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
