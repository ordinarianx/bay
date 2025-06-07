/**
 * Main Express server entry point.
 * 
 * - Loads environment variables
 * - Initializes DB if needed
 * - Sets up routes and middleware
 * - Starts the server
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool, { initDbIfNeeded } from './db/index.js';
import betRoutes from './routes/bets.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize DB if needed
await initDbIfNeeded();

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/bets', betRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
// This is the main server file for the backend of the betting application.
// It sets up the Express server, configures middleware, and defines routes for authentication, bets, and user management.