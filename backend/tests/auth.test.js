import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app from '../server.js';
import pool from '../db/index.js';

const testUser = {
  email: 'authu@test.com',
  username: 'authuser',
  password: 'testpass',
  name: 'AuthUser' // ≤ 10 chars
};

afterAll(async () => {
  await pool.query('DELETE FROM users WHERE username = $1', [testUser.username]);
  await pool.end();
});

describe('Auth API', () => {
  it('should register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.user).toHaveProperty('username', testUser.username);
  });

  it('should not register with missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'x', password: 'y' });
    expect(res.status).toBe(400);
  });

  it('should login with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('username', testUser.username);
  });

  it('should not login with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'wrongpass'
    });
    expect(res.status).toBe(401);
  });
});