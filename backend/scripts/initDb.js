// Creates the database (if missing), then (re)creates all tables and seeds data.
// Usage: npm run db:init
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import { config } from '../src/config.js';

const dir = path.dirname(fileURLToPath(import.meta.url));
const sqlDir = path.join(dir, '..', 'sql');

async function connectWithRetry(opts, attempts = 30) {
  for (let i = 1; ; i++) {
    try {
      return await mysql.createConnection(opts);
    } catch (err) {
      if (i >= attempts) throw err;
      console.log(`MySQL not ready (${err.code}), retrying ${i}/${attempts}...`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

const { database, ...server } = config.db;
const conn = await connectWithRetry({ ...server, multipleStatements: true, charset: 'utf8mb4' });
try {
  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await conn.query(`USE \`${database}\``);
  for (const file of ['schema.sql', 'seed.sql']) {
    await conn.query(await fs.readFile(path.join(sqlDir, file), 'utf8'));
    console.log(`✔ ${file}`);
  }
  const [[{ n }]] = await conn.query('SELECT COUNT(*) AS n FROM sections');
  console.log(`Database "${database}" ready (${n} sections).`);
} finally {
  await conn.end();
}
