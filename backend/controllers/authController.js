import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from '../db/index.js';

export const register = async (req, res) => {
  try {
    const { email, username, password, name } = req.body;

    if (!email || !username || !password || !name) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if email or username already exists
    const exists = await pool.query(
      "SELECT 1 FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );
    if (exists.rows.length > 0) {
      return res.status(409).json({ message: "Email or username already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      "INSERT INTO users (email, username, password, name) VALUES ($1, $2, $3, $4) RETURNING id, email, username, name",
      [email, username, hashedPassword, name]
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).json({ user, token });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({ message: "Login successful", username: user.username, name: user.name });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

