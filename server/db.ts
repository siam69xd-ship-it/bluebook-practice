import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Enable websocket for neon
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

if (connectionString) {
  try {
    pool = new Pool({ connectionString });
    db = drizzle({ client: pool, schema });
    console.log("Database connection configured");
  } catch (error) {
    console.error("Failed to configure database:", error);
  }
} else {
  console.warn("No database URL found. Running without database.");
}

export { pool, db };