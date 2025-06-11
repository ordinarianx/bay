import pool from '../db/index.js';

// Define required tables and columns for validation
const requiredTables = {
  users: ['id', 'username', 'name', 'email', 'password', 'points'],
  bets: [
    'id',
    'user_id',
    'title',
    'body',
    'evidence',
    'wager',
    'status',
    'created_at',
    'challenger_id',
    'challenge_amount'
  ],
  likes: ['id', 'user_id', 'bet_id'],
  bookmarks: ['id', 'user_id', 'bet_id'],
  // Add other tables as needed
};

async function validateTables() {
  try {
    for (const [table, columns] of Object.entries(requiredTables)) {
      // Check if table exists
      const tableRes = await pool.query(
        `SELECT to_regclass($1) as exists`,
        [table]
      );
      if (!tableRes.rows[0].exists) {
        console.error(`❌ Table "${table}" does not exist.`);
        continue;
      }

      // Check columns
      const colRes = await pool.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = $1`,
        [table]
      );
      const dbCols = colRes.rows.map(r => r.column_name);
      const missing = columns.filter(col => !dbCols.includes(col));
      if (missing.length > 0) {
        console.error(`❌ Table "${table}" is missing columns: ${missing.join(', ')}`);
      } else {
        console.log(`✅ Table "${table}" validated.`);
      }
    }
  } catch (err) {
    console.error("Error validating tables:", err);
  }
}

export default validateTables;