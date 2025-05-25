// backend/controllers/authController.js

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db/index.js";

import pool from '../db/index.js';

export const register = async (req, res) => {
  try {
    // console.log("👉 Incoming request to /register");
    // console.log("🟡 Request body:", req.body);

    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      // console.log("🔴 Missing fields:", { email, username, password });
      return res.status(400).json({ message: "All fields are required." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // console.log("✅ Password hashed");

    const result = await pool.query(
      "INSERT INTO users (email, username, password) VALUES ($1, $2, $3) RETURNING id, email, username",
      [email, username, hashedPassword]
    );
    // console.log("✅ User inserted into database");

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    // console.log("✅ Token generated");

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

    console.log("✅ Login successful. Sending response:", user.username); // Debug

    res.json({ message: "Login successful", username: user.username }); // <- must include this

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

