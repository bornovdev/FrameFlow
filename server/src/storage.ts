import { users, products, categories, orders, orderItems, cartItems, settings, type User, type InsertUser, type Product, type InsertProduct, type Category, type InsertCategory, type Order, type InsertOrder, type CartItem, type InsertCartItem, type OrderItem, type InsertOrderItem, type Settings, type InsertSettings } from "../shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Products
  getProducts(filters?: { categoryId?: string; search?: string }): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  
  // Cart
  getCartItems(userId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem>;
  removeFromCart(id: string): Promise<void>;
  clearCart(userId: string): Promise<void>;
  
  // Orders
  getOrders(userId?: string): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] })[]>;
  getOrder(id: string): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] }) | undefined>;
  createOrder(order: InsertOrder, orderItems: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order>;
  
  // Settings
  getSettings(): Promise<Record<string, string>>;
  getSetting(key: string): Promise<string | undefined>;
  setSetting(key: string, value: string): Promise<void>;
  setSettings(settingsObj: Record<string, string>): Promise<void>;

  // Analytics
  getDashboardStats(): Promise<{
    totalRevenue: string;
    totalOrders: number;
    activeProducts: number;
    totalCustomers: number;
    topProducts: Array<{
      id: string;
      name: string;
      sales: number;
      revenue: string;
    }>;
    recentOrders: Array<{
      id: string;
      customer: string;
      product: string;
      amount: string;
      status: string;
      date: string;
    }>;
  }>;
  
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser as any)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    // First delete cart items to avoid foreign key constraint issues
    await db.delete(cartItems).where(eq(cartItems.userId, id));
    
    // Delete the user (this will fail if user has orders, which is intentional 
    // to preserve business records)
    await db.delete(users).where(eq(users.id, id));
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  async getProducts(filters?: { categoryId?: string; search?: string }): Promise<Product[]> {
    let conditions = [eq(products.isActive, true)];
    
    if (filters?.categoryId) {
      conditions.push(eq(products.categoryId, filters.categoryId));
    }
    
    if (filters?.search) {
      conditions.push(sql`${products.name} ILIKE ${`%${filters.search}%`}`);
    }
    
    return await db.select().from(products).where(and(...conditions)).orderBy(desc(products.createdAt));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.slug, slug));
    return product || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product as any)
      .returning();
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set(product as any)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    // Check if product is referenced in any orders (prevent deletion if so)
    const [orderItemExists] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(orderItems)
      .where(eq(orderItems.productId, id));

    if (orderItemExists.count > 0) {
      throw new Error("Cannot delete product: it has been ordered by customers. Consider marking it as inactive instead.");
    }

    // Remove from carts first (safe to remove from carts)
    await db.delete(cartItems).where(eq(cartItems.productId, id));
    
    // Now delete the product
    await db.delete(products).where(eq(products.id, id));
  }

  async getCartItems(userId: string): Promise<(CartItem & { product: Product })[]> {
    return await db
      .select({
        id: cartItems.id,
        userId: cartItems.userId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        options: cartItems.options,
        createdAt: cartItems.createdAt,
        product: products,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId));
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existing] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, cartItem.userId),
          eq(cartItems.productId, cartItem.productId),
          sql`${cartItems.options}::text = ${JSON.stringify(cartItem.options || {})}::text`
        )
      );

    if (existing) {
      // Update quantity
      const [updated] = await db
        .update(cartItems)
        .set({ quantity: existing.quantity + cartItem.quantity })
        .where(eq(cartItems.id, existing.id))
        .returning();
      return updated;
    } else {
      // Insert new item
      const [newItem] = await db
        .insert(cartItems)
        .values(cartItem)
        .returning();
      return newItem;
    }
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem> {
    const [updated] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updated;
  }

  async removeFromCart(id: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  async getOrders(userId?: string): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] })[]> {
    const ordersQuery = userId
      ? db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt))
      : db.select().from(orders).orderBy(desc(orders.createdAt));

    const ordersResult = await ordersQuery;

    const ordersWithItems = await Promise.all(
      ordersResult.map(async (order: any) => {
        const items = await db
          .select({
            id: orderItems.id,
            orderId: orderItems.orderId,
            productId: orderItems.productId,
            quantity: orderItems.quantity,
            price: orderItems.price,
            options: orderItems.options,
            product: products,
          })
          .from(orderItems)
          .innerJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id));

        return {
          ...order,
          orderItems: items,
        };
      })
    );

    return ordersWithItems;
  }

  async getOrder(id: string): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;

    const items = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        options: orderItems.options,
        product: products,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, order.id));

    return {
      ...order,
      orderItems: items,
    };
  }

  async createOrder(order: InsertOrder, orderItemsData: InsertOrderItem[]): Promise<Order> {
    const [newOrder] = await db
      .insert(orders)
      .values(order)
      .returning();

    await db
      .insert(orderItems)
      .values(orderItemsData.map(item => ({ ...item, orderId: newOrder.id })));

    return newOrder;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const [updated] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  async getSalesChartData(period: string = '7d'): Promise<Array<{
    date: string;
    sales: number;
    revenue: number;
  }>> {
    const now = new Date();
    let startDate: Date;
    let groupBy: string;
    let dateFormat: string;

    switch (period) {
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupBy = 'DATE';
        dateFormat = 'YYYY-MM-DD';
        break;
      case '3m':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        groupBy = 'DATE';
        dateFormat = 'YYYY-MM-DD';
        break;
      default: // 7d
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = 'DATE';
        dateFormat = 'YYYY-MM-DD';
        break;
    }

    const salesData = await db
      .select({
        date: sql<string>`DATE(${orders.createdAt})`,
        sales: sql<number>`COUNT(*)`,
        revenue: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
      })
      .from(orders)
      .where(
        and(
          sql`${orders.createdAt} >= ${startDate.toISOString()}`,
          sql`${orders.status} != 'cancelled'`
        )
      )
      .groupBy(sql`DATE(${orders.createdAt})`)
      .orderBy(sql`DATE(${orders.createdAt})`);

    // Fill in missing days with zero values
    const result: Array<{ date: string; sales: number; revenue: number }> = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= now) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const existingData = salesData.find((d: any) => d.date === dateStr);
      
      result.push({
        date: dateStr,
        sales: existingData?.sales || 0,
        revenue: existingData?.revenue || 0,
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  }

  async getDashboardStats(): Promise<{
    totalRevenue: string;
    totalOrders: number;
    activeProducts: number;
    totalCustomers: number;
    topProducts: Array<{
      id: string;
      name: string;
      sales: number;
      revenue: string;
    }>;
    recentOrders: Array<{
      id: string;
      customer: string;
      product: string;
      amount: string;
      status: string;
      date: string;
    }>;
  }> {
    // Total revenue
    const [revenueResult] = await db
      .select({ total: sql<string>`COALESCE(SUM(${orders.total}), 0)` })
      .from(orders)
      .where(sql`${orders.status} != 'cancelled'`);

    // Total orders
    const [ordersResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(orders);

    // Active products
    const [productsResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(products)
      .where(eq(products.isActive, true));

    // Total customers
    const [customersResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(eq(users.role, 'customer'));

    // Top products
    const topProducts = await db
      .select({
        id: products.id,
        name: products.name,
        sales: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`,
        revenue: sql<string>`COALESCE(SUM(${orderItems.price} * ${orderItems.quantity}), 0)`,
      })
      .from(products)
      .leftJoin(orderItems, eq(products.id, orderItems.productId))
      .groupBy(products.id, products.name)
      .orderBy(sql`COALESCE(SUM(${orderItems.quantity}), 0) DESC`)
      .limit(5);

    // Recent orders
    const recentOrders = await db
      .select({
        id: orders.id,
        customerName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
        productName: sql<string>`STRING_AGG(${products.name}, ', ')`,
        amount: orders.total,
        status: orders.status,
        date: orders.createdAt,
      })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
      .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
      .innerJoin(products, eq(orderItems.productId, products.id))
      .groupBy(orders.id, users.firstName, users.lastName, orders.total, orders.status, orders.createdAt)
      .orderBy(desc(orders.createdAt))
      .limit(10);

    return {
      totalRevenue: revenueResult.total,
      totalOrders: ordersResult.count,
      activeProducts: productsResult.count,
      totalCustomers: customersResult.count,
      topProducts,
      recentOrders: recentOrders.map((order: any) => ({
        id: order.id,
        customer: order.customerName,
        product: order.productName,
        amount: order.amount,
        status: order.status,
        date: order.date?.toLocaleDateString() || '',
      })),
    };
  }

  // Settings methods
  async getSettings(): Promise<Record<string, string>> {
    const settingsRows = await db.select().from(settings);
    const settingsObj: Record<string, string> = {};
    
    for (const setting of settingsRows) {
      settingsObj[setting.key] = setting.value;
    }
    
    return settingsObj;
  }

  async getSetting(key: string): Promise<string | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting?.value;
  }

  async setSetting(key: string, value: string): Promise<void> {
    const existingSetting = await db.select().from(settings).where(eq(settings.key, key));
    
    if (existingSetting.length > 0) {
      await db.update(settings)
        .set({ value, updatedAt: new Date() })
        .where(eq(settings.key, key));
    } else {
      await db.insert(settings)
        .values({ key, value });
    }
  }

  async setSettings(settingsObj: Record<string, string>): Promise<void> {
    const promises = Object.entries(settingsObj).map(([key, value]) => 
      this.setSetting(key, value)
    );
    
    await Promise.all(promises);
  }
}

export const storage = new DatabaseStorage();
