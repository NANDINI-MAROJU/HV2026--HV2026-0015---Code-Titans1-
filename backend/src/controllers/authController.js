import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../models/db.js';

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const rawPassword = password || 'password123';

  try {
    let user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(cleanEmail);

    if (!user) {
      // 1. Determine role dynamically from email
      let role = 'student';
      if (cleanEmail.includes('admin')) {
        role = 'admin';
      } else if (cleanEmail.includes('staff') || cleanEmail.includes('ramesh')) {
        role = 'staff';
      }

      const name = cleanEmail.split('@')[0];
      const hashedPassword = bcrypt.hashSync(rawPassword, 10);

      // 2. Auto-create user
      const result = db.prepare(`
        INSERT INTO users (name, email, password, role)
        VALUES (?, ?, ?, ?)
      `).run(name, cleanEmail, hashedPassword, role);

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    }

    // 3. Generate JWT Token (Always succeeds for any user)
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_secret_jwt_key_here_12345',
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: error.message });
  }
};

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const cleanEmail = email.toLowerCase().trim();
    const existing = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(cleanEmail);
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = db.prepare(`
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `).run(name, cleanEmail, hashedPassword, role || 'student');

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_secret_jwt_key_here_12345',
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
