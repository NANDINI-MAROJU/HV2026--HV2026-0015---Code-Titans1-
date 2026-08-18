import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import qrRoutes from './routes/qrRoutes.js';
import db from './models/db.js';
import { authenticateToken } from './middleware/authMiddleware.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/qr', qrRoutes);

// In-app notifications
app.get('/api/notifications', authenticateToken, (req, res) => {
  try {
    const notes = db.prepare(`SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 20`).all(req.user.id);
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/notifications/read-all', authenticateToken, (req, res) => {
  try {
    db.prepare(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`).run(req.user.id);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend build static files (2 levels up from backend/src -> root -> frontend/dist)
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Client-side routing catch-all
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

// Listen
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
