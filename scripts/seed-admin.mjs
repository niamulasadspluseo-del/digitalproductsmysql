// Run with: node scripts/seed-admin.mjs
// Creates the first admin user in MySQL.
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const DATABASE_URL = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/ecommerce_db';

async function main() {
  const conn = await mysql.createConnection(DATABASE_URL);

  const name = process.argv[2] || 'Admin';
  const email = process.argv[3] || 'admin@example.com';
  const password = process.argv[4] || 'admin123456';

  const passwordHash = await bcrypt.hash(password, 10);
  const id = crypto.randomUUID();

  await conn.execute(
    `INSERT INTO profiles (id, name, email, password_hash) VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE name=VALUES(name), password_hash=VALUES(password_hash)`,
    [id, name, email, passwordHash]
  );

  await conn.execute(
    `INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, 'admin')
     ON DUPLICATE KEY UPDATE role='admin'`,
    [crypto.randomUUID(), id]
  );

  console.log(`Admin created: ${email} / ${password}`);
  await conn.end();
}

main().catch(console.error);
