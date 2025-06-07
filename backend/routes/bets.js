/**
 * Express routes for bet creation, fetching, and challenging.
 * 
 * POST /api/bets         - Create a new bet (deducts wager from user)
 * GET  /api/bets         - Get all bets (with poster info)
 * POST /api/bets/:id/challenge - Challenge a bet
 */

import express from 'express';
import pool from '../db/index.js';

const router = express.Router();

// Create a new bet
router.post('/', async (req, res) => {
  const { title, body, evidence, wager, username } = req.body;

  if (!title || !body || !evidence || !wager || !username) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get user and check points
    const userResult = await client.query(
      'SELECT id, name, points FROM users WHERE username = $1',
      [username]
    );
    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'User not found' });
    }
    const user = userResult.rows[0];
    if (user.points < wager) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Not enough points to place this bet.' });
    }

    // Create bet
    const result = await client.query(
      `INSERT INTO bets (user_id, title, body, evidence, wager, status)
       VALUES ($1, $2, $3, $4, $5, 'open')
       RETURNING id, title, body, evidence, wager, created_at, status`,
      [user.id, title, body, evidence, wager]
    );

    // Deduct points
    await client.query(
      'UPDATE users SET points = points - $1 WHERE id = $2',
      [wager, user.id]
    );

    await client.query('COMMIT');

    const betWithUser = {
      ...result.rows[0],
      username,
      name: user.name
    };

    res.status(201).json({ bet: betWithUser });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error posting bet:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

// Get all bets
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.id, b.title, b.body, b.evidence, b.wager, b.created_at, b.status,
             b.challenge_amount, b.challenger_id,
             u.username, u.name,
             cu.username AS challenger_username
      FROM bets b
      JOIN users u ON b.user_id = u.id
      LEFT JOIN users cu ON b.challenger_id = cu.id
      ORDER BY b.created_at DESC
    `);

    res.json({ bets: result.rows });
  } catch (err) {
    console.error("Error fetching bets:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Challenge a bet
router.post('/:id/challenge', async (req, res) => {
  const betId = req.params.id;
  const { wager, username } = req.body;

  if (!wager || !username) {
    return res.status(400).json({ message: 'Wager and username are required.' });
  }

  try {
    // Get bet
    const betResult = await pool.query(
      'SELECT * FROM bets WHERE id = $1',
      [betId]
    );
    if (betResult.rows.length === 0) {
      return res.status(404).json({ message: 'Bet not found.' });
    }
    const bet = betResult.rows[0];

    // Get challenger user
    const userResult = await pool.query(
      'SELECT id, name FROM users WHERE username = $1',
      [username]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const challengerId = userResult.rows[0].id;
    if (challengerId === bet.user_id) {
      return res.status(400).json({ message: "You can't challenge your own bet." });
    }

    const minAllowed = bet.challenge_amount || bet.wager;
    if (wager < minAllowed) {
      return res.status(400).json({ message: `Wager must be at least ${minAllowed}` });
    }

    // Update bet
    await pool.query(
      `UPDATE bets
       SET challenge_amount = $1,
           challenger_id = $2,
           status = 'challenged'
       WHERE id = $3`,
      [wager, challengerId, betId]
    );

    // Return updated bet for frontend (joined for usernames)
    const updatedBetResult = await pool.query(`
      SELECT b.id, b.title, b.body, b.evidence, b.wager, b.created_at, b.status,
             b.challenge_amount, b.challenger_id,
             u.username, u.name,
             cu.username AS challenger_username
      FROM bets b
      JOIN users u ON b.user_id = u.id
      LEFT JOIN users cu ON b.challenger_id = cu.id
      WHERE b.id = $1
    `, [betId]);

    res.json({ bet: updatedBetResult.rows[0] });
  } catch (err) {
    console.error("Error challenging bet:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
// This code defines the backend API routes for creating and managing bets.