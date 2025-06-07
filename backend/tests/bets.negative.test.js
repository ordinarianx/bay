import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../server.js';
import pool from '../db/index.js';

let testUser;
let testBetId;

beforeAll(async () => {
  // Use short name
  const res = await pool.query(
    "INSERT INTO users (email, username, password, name, points) VALUES ('neg1@t.com', 'neguser1', 'hashed', 'NegUser', 10) RETURNING *"
  );
  testUser = res.rows[0];

  // Create a bet for this user
  const betRes = await pool.query(
    `INSERT INTO bets (user_id, title, body, evidence, wager, status)
     VALUES ($1, $2, $3, $4, $5, 'open')
     RETURNING id`,
    [testUser.id, 'NegTest', 'Body', 'Evidence', 5]
  );
  testBetId = betRes.rows[0].id;
});

afterAll(async () => {
  await pool.query('DELETE FROM bets WHERE user_id = $1 OR challenger_id = $1', [testUser.id]);
  await pool.query('DELETE FROM users WHERE id = $1', [testUser.id]);
  await pool.end();
});

describe('Bets API Negative Cases', () => {
  it('should not allow challenging own bet', async () => {
    const res = await request(app)
      .post(`/api/bets/${testBetId}/challenge`)
      .send({ wager: 5, username: testUser.username });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/can't challenge your own bet/i);
  });

  it('should not allow challenging with too low wager', async () => {
    // Create a challenger user
    const rand = Math.floor(Math.random() * 1e5);
    const challengerEmail = `c${rand}@t.com`;
    const challengerUsername = `cuser${rand}`;
    const challengerRes = await pool.query(
      "INSERT INTO users (email, username, password, name, points) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [challengerEmail, challengerUsername, 'hashed', 'ChallUser', 10]
    );
    const challenger = challengerRes.rows[0];

    const res = await request(app)
      .post(`/api/bets/${testBetId}/challenge`)
      .send({ wager: 1, username: challenger.username });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/at least/i);

    // Clean up
    await pool.query('DELETE FROM bets WHERE challenger_id = $1', [challenger.id]);
    await pool.query('DELETE FROM users WHERE id = $1', [challenger.id]);
  });
});