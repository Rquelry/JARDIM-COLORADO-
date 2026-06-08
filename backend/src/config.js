import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config = {
  port: Number(process.env.BACKEND_PORT || process.env.PORT || 3001),
  host: process.env.BACKEND_HOST || "0.0.0.0",
  dataFile:
    process.env.BACKEND_DATA_FILE ||
    path.resolve(__dirname, "../data/database.json"),
  corsOrigin: process.env.CORS_ORIGIN || "*",
  adminUser: process.env.ADMIN_USER || "admin",
  adminPassword: process.env.ADMIN_PASSWORD || "12345678",
  tokenTtlMs: Number(process.env.AUTH_TOKEN_TTL_MS || 1000 * 60 * 60 * 8),
};
