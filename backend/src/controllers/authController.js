import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../models/db.js';

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if user already exists
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());

    // 2. If user does NOT exist, auto-create a new account on the fly
    if (!user) {
      const hashedPassword = bcrypt.hashSync(password || 'password123', 10);
      const name = email.split('@')[0]; // Use the email prefix as the default name
      
      // Determine role: assign admin if email contains 'admin', otherwise student
      const role = email.toLowerCase().includes('admin') ? 'admin' : 'student';

      const result = db.prepare(`
        INSERT INTO users (name, email, password, role)
        VALUES (?, ?, ?, ?)
      `).run(name, email.toLowerCase().trim(), hashedPassword, role);

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    } else {
      // 3. If user exists, check password (or accept any password if you want completely open access)
      const isMatch = bcrypt.compareSync(password, user.password);
      if (!isMatch) {
        // Optional: uncomment below if you want any password to work for existing accounts too:
        // const newHash = bcrypt.hashSync(password, 10);
        // db.prepare('UPDATE users SET password = ? WHERE id = ?').run(newHash, user.id);
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }

    // 4. Generate JWT token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_secret_jwt_key_here_12345',
      { expiresIn: '7d' }
    );

    // 5. Send user info and token back to the frontend
    res.json({
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
    res.status(500).json({ error: 'Internal server error' });
  }
};
