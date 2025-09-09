import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "your-secret-key-here",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        console.log('Login attempt for email:', email);
        const user = await storage.getUserByEmail(email);
        
        if (!user) {
          console.log('User not found for email:', email);
          return done(null, false);
        }
        
        console.log('User found:', user.username, 'comparing passwords...');
        const passwordMatch = await comparePasswords(password, user.password);
        console.log('Password match result:', passwordMatch);
        
        if (!passwordMatch) {
          console.log('Password mismatch for user:', user.username);
          return done(null, false);
        } else {
          console.log('Login successful for user:', user.username);
          return done(null, user);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    const { email, username, password, firstName, lastName } = req.body;
    
    const existingUser = await storage.getUserByEmail(email) || await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await storage.createUser({
      email,
      username,
      password: await hashPassword(password),
      firstName,
      lastName,
      role: "customer",
    });

    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json(user);
    });
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  app.delete("/api/user/:id?", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userIdToDelete = req.params.id || req.user!.id;
    
    // Only allow users to delete their own account or allow admins to delete any account
    if (userIdToDelete !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized to delete this user" });
    }

    try {
      await storage.deleteUser(userIdToDelete);
      
      // If user deleted their own account, logout
      if (userIdToDelete === req.user!.id) {
        req.logout((err) => {
          if (err) return next(err);
          res.json({ message: "User deleted successfully" });
        });
      } else {
        res.json({ message: "User deleted successfully" });
      }
    } catch (error: any) {
      if (error.code === '23503') {
        // Foreign key constraint error - user has orders
        return res.status(400).json({ 
          message: "Cannot delete user with existing orders. Please contact support for account closure." 
        });
      }
      console.error('Error deleting user:', error);
      res.status(500).json({ message: "Error deleting user" });
    }
  });
}
