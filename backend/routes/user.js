import express from 'express';
import pool from '../db/index.js';

const router = express.Router();

// GET /api/users/:username/profile
router.get('/:username/profile', async (req, res) => {
  const { username } = req.params;
  try {
    // Get user basic info
    const userResult = await pool.query(
      'SELECT id, name, username, points FROM users WHERE username = $1',
      [username]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const user = userResult.rows[0];

    // Get user's bets, with status
    const betsResult = await pool.query(`
      SELECT id, title, status, wager, challenge_amount, created_at
      FROM bets
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [user.id]);

    res.json({
      user: {
        name: user.name,
        username: user.username,
        points: user.points,
        bets: betsResult.rows
      }
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
