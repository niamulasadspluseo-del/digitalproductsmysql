import { drizzle, type MySql2Database } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../../drizzle/schema';
import 'dotenv/config';

type DBSchema = typeof schema;
type DbInstance = MySql2Database<DBSchema> & { $client: mysql.Pool };

let _db: DbInstance | null = null;
let _pool: mysql.Pool | null = null;

export function getDb(): DbInstance {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not set. Add it to .env (e.g. mysql://user:pass@localhost:3306/ecommerce_db)');
    }
    _pool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      connectionLimit: 5,
      idleTimeout: 10000,
      enableKeepAlive: false,
    });
    _db = drizzle(_pool as any, { schema, mode: 'default' }) as unknown as DbInstance;
  }
  return _db;
}

export async function closeDb() {
  if (_pool) { await _pool.end(); _pool = null; _db = null; }
}
