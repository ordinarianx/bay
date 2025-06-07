-- Database schema for bet_app.
-- Creates users and bets tables if they do not exist.

CREATE DATABASE IF NOT EXISTS bet_app;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  name VARCHAR(10) NOT NULL,
  username TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 10
);

CREATE TABLE IF NOT EXISTS bets (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT,
  evidence TEXT NOT NULL,
  wager INTEGER NOT NULL CHECK (wager > 0),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_amount INTEGER,                      -- Highest/active challenge wager
  challenger_id INTEGER REFERENCES users(id),    -- User who placed the current challenge
  status VARCHAR(20) DEFAULT 'open',             -- Bet status: open, challenged, resolved, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
