import express from 'express';
import pool from '../db/index.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { title, body, evidence, wager, username } = req.body;

  if (!title || !body || !evidence || !wager || !username) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const userResult = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userId = userResult.rows[0].id;

    const result = await pool.query(
      `INSERT INTO bets (user_id, title, body, evidence, wager)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, body, evidence, wager`,
      [userId, title, body, evidence, wager]
    );

    res.status(201).json({ bet: result.rows[0] });
  } catch (err) {
    console.error('Error posting bet:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.id, b.title, b.body, b.evidence, b.wager, b.created_at, u.username, u.name
      FROM bets b
      JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC
    `);

    res.json({ bets: result.rows });
  } catch (err) {
    console.error("Error fetching bets:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
