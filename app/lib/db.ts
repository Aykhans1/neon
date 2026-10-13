import { neon } from "@neondatabase/serverless";

// Neon PostgreSQL bağlantı linki (?sslmode=require ilə TLS/SSL məcburidir)
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_jLN3iaSOy8lu@ep-orange-violet-b5hz70d0-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require";

// Bulud drayveri HTTPS/TLS üzərindən Data-in-Transit şifrələməsini təmin edir
export const sql = neon(connectionString);