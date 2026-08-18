import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../models/db.js';

export function register(req, res) {
  const { name, email, password, role = 'student', department, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const stmt = db.prepare(`
      INSERT INTO users (name, email, password, role, department, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(name, email.toLowerCase(), hashedPassword, role, department || null, phone || null);
    
    const token = jwt.sign(
      { id: info.lastInsertRowid, name, email: email.toLowerCase(), role },
      process.env.JWT_SECRET || 'super_secure_hackathon_jwt_secret_key_2026',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: info.lastInsertRowid, name, email, role, department }
    });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed: users.email')) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: err.message });
  }
}

export function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);

    // Auto-create user if email does not exist
    if (!user) {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const generatedName = normalizedEmail.split('@')[0] || 'Campus User';
      
      // Assign admin role if email contains 'admin', otherwise default to student
      const role = normalizedEmail.includes('admin') ? 'admin' : 'student';

      const insertStmt = db.prepare(`
        INSERT INTO users (name, email, password, role, department)
        VALUES (?, ?, ?, ?, ?)
      `);
      const info = insertStmt.run(generatedName, normalizedEmail, hashedPassword, role, 'General');
      
      user = {
        id: info.lastInsertRowid,
        name: generatedName,
        email: normalizedEmail,
        role: role,
        department: 'General'
      };
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'super_secure_hackathon_jwt_secret_key_2026',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function getProfile(req, res) {
  const user = db.prepare('SELECT id, name, email, role, department, phone, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
}
