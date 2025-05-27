import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import dotenv from 'dotenv';
import betRoutes from './routes/bets.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/bets', betRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
