-- Database schema for bet_app.
-- Creates users and bets tables if they do not exist.

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

-- Likes table
CREATE TABLE IF NOT EXISTS likes (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    bet_id INT REFERENCES bets(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, bet_id)
);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    bet_id INT REFERENCES bets(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, bet_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_status ON bets(status);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_bet_id ON likes(bet_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_bet_id ON bookmarks(bet_id);

-- Optional: Enforce lowercase unique usernames
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower ON users(LOWER(username));

-- Optional: Challenge amount positive constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'challenge_amount_positive'
      AND conrelid = 'bets'::regclass
  ) THEN
    ALTER TABLE bets
      ADD CONSTRAINT challenge_amount_positive CHECK (challenge_amount IS NULL OR challenge_amount > 0);
  END IF;
END$$;
