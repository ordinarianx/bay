import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../server.js';
import pool from '../db/index.js';

let testUser;
let testBetId;

beforeAll(async () => {
  const res = await pool.query(
    "INSERT INTO users (email, username, password, name, points) VALUES ('test@user.com', 'testuser', 'hashed', 'TestUser', 100) RETURNING *"
  );
  testUser = res.rows[0];
});

afterAll(async () => {
  await pool.query('DELETE FROM bets WHERE user_id = $1', [testUser.id]);
  await pool.query('DELETE FROM users WHERE id = $1', [testUser.id]);
  await pool.end();
});

describe('Bets API', () => {
  it('should create a new bet', async () => {
    const betData = {
      title: 'Test Bet',
      body: 'Test body',
      evidence: 'Test evidence',
      wager: 5,
      username: testUser.username,
    };
    const res = await request(app).post('/api/bets').send(betData);
    expect(res.status).toBe(201);
    expect(res.body.bet).toHaveProperty('id');
    testBetId = res.body.bet.id;
  });

  it('should fetch all bets', async () => {
    const res = await request(app).get('/api/bets');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.bets)).toBe(true);
  });

  it('should not allow creating a bet with missing fields', async () => {
    const res = await request(app).post('/api/bets').send({ title: 'Missing fields' });
    expect(res.status).toBe(400);
  });

  it('should challenge a bet', async () => {
    // Generate a random suffix for email and username
    const rand = Math.floor(Math.random() * 1e5);
    const challengerEmail = `chall${rand}@t.com`;
    const challengerUsername = `chall${rand}`;
    // Create a challenger user
    const challengerRes = await pool.query(
      "INSERT INTO users (email, username, password, name, points) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [challengerEmail, challengerUsername, 'hashed', 'ChallUser', 10]
    );
    const challenger = challengerRes.rows[0];

    const res = await request(app)
      .post(`/api/bets/${testBetId}/challenge`)
      .send({ wager: 5, username: challenger.username });
    expect(res.status).toBe(200);
    expect(res.body.bet.status).toBe('challenged');

    // Clean up: delete bets where challenger_id is this user
    await pool.query('DELETE FROM bets WHERE challenger_id = $1', [challenger.id]);
    // Now delete the challenger user
    await pool.query('DELETE FROM users WHERE id = $1', [challenger.id]);
  });
});