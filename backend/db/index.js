/**
 * Database connection and (optional) initialization logic.
 * 
 * - Exports a PostgreSQL connection pool using environment variables.
 * - Exports initDbIfNeeded() to auto-run init.sql if INIT_DB=true in .env.
 */

import pkg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * If INIT_DB env var is set to 'true', runs db/init.sql to initialize tables.
 * Safe to run multiple times (uses IF NOT EXISTS in SQL).
 */
export async function initDbIfNeeded() {
  if (process.env.INIT_DB === 'true') {
    const sqlPath = path.resolve('./db/init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    try {
      await pool.query(sql);
      console.log('Database initialized!');
    } catch (err) {
      console.error('Error initializing database:', err);
    }
  }
}

export default pool;
// This module exports a configured PostgreSQL connection pool and a function to initialize the database by running an SQL script.
// It reads the connection string from environment variables and can run an initialization script if the INIT_DB variable is set to true.