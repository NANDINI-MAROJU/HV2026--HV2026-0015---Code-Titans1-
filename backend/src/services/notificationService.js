import db from '../models/db.js';

export function createNotification(userId, complaintId, title, message) {
  try {
    const stmt = db.prepare(`
      INSERT INTO notifications (user_id, complaint_id, title, message)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(userId, complaintId, title, message);
  } catch (err) {
    console.error('Notification creation error:', err.message);
  }
}

export function notifyAdmins(complaintId, title, message) {
  const admins = db.prepare(`SELECT id FROM users WHERE role = 'admin'`).all();
  admins.forEach(admin => {
    createNotification(admin.id, complaintId, title, message);
  });
}
/*
import db from '../models/db.js';
import { v4 as uuidv4 } from 'uuid';

export const createNotification = (userId, title, message) => {
  try {
    const stmt = db.prepare(`
      INSERT INTO notifications (id, user_id, title, message)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(uuidv4(), userId, title, message);
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

export const getUserNotifications = (userId) => {
  const stmt = db.prepare(`
    SELECT * FROM notifications 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT 20
  `);
  return stmt.all(userId);
};

export const markNotificationsAsRead = (userId) => {
  const stmt = db.prepare(`
    UPDATE notifications 
    SET is_read = 1 
    WHERE user_id = ?
  `);
  return stmt.run(userId);
};*/
