import mysql from 'mysql2/promise';
import { config } from './config.js';

export const pool = mysql.createPool({
  ...config.db,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
});

/** Run a query and return rows only. */
export async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}
