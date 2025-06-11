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
      SELECT b.id, b.title, b.body, b.evidence, b.wager, b.created_at, b.status,
             b.challenge_amount, b.challenger_id,
             u.username, u.name,
             (SELECT COUNT(*) FROM likes l WHERE l.bet_id = b.id) AS likes_count,
             (SELECT COUNT(*) FROM bookmarks bm WHERE bm.bet_id = b.id) AS bookmarks_count
      FROM bets b
      JOIN users u ON b.user_id = u.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `, [user.id]);

    // Get user's bookmarks (as full bet objects)
    const bookmarksResult = await pool.query(`
      SELECT b.id, b.title, b.body, b.evidence, b.wager, b.created_at, b.status,
             b.challenge_amount, b.challenger_id,
             u.username, u.name,
             (SELECT COUNT(*) FROM likes l WHERE l.bet_id = b.id) AS likes_count,
             (SELECT COUNT(*) FROM bookmarks bm WHERE bm.bet_id = b.id) AS bookmarks_count
      FROM bookmarks bm
      JOIN bets b ON bm.bet_id = b.id
      JOIN users u ON b.user_id = u.id
      WHERE bm.user_id = $1
      ORDER BY bm.created_at DESC
    `, [user.id]);

    res.json({
      user: {
        name: user.name,
        username: user.username,
        points: user.points,
        bets: betsResult.rows,
        bookmarks: bookmarksResult.rows
      }
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
