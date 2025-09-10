import { CorsOptions } from "cors";
import { allowedOrigins } from "./allowedOrigins";

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || origin === 'null' || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  allowedHeaders: [
    'Content-Type',
    "Authorization",
  ]
}

export default corsOptions;