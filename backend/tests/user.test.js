import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../server.js';
import pool from '../db/index.js';

let user;

beforeAll(async () => {
  const res = await pool.query(
    "INSERT INTO users (email, username, password, name, points) VALUES ('p@test.com', 'profile1', 'hashed', 'ProfUser', 10) RETURNING *"
  );
  user = res.rows[0];
});

afterAll(async () => {
  await pool.query('DELETE FROM users WHERE id = $1', [user.id]);
  await pool.end();
});

describe('User API', () => {
  it('should fetch user profile', async () => {
    const res = await request(app).get(`/api/users/${user.username}/profile`);
    expect(res.status).toBe(200);
    expect(res.body.user).toHaveProperty('username', user.username);
    expect(res.body.user).toHaveProperty('points');
    expect(Array.isArray(res.body.user.bets)).toBe(true);
  });

  it('should return 404 for non-existent user', async () => {
    const res = await request(app).get('/api/users/nonexist/profile');
    expect(res.status).toBe(404);
  });
});