import db from '../models/db.js';
import { createNotification } from '../services/notificationService.js';

export function getAssignedTasks(req, res) {
  try {
    const tasks = db.prepare(`
      SELECT c.*, u.name as reporter_name, u.phone as reporter_phone
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      WHERE c.assigned_staff_id = ?
      ORDER BY CASE c.priority WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 ELSE 4 END, c.id DESC
    `).all(req.user.id);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function updateTaskProgress(req, res) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const resolution_proof_url = req.file ? `/uploads/${req.file.filename}` : null;

    const task = db.prepare('SELECT * FROM complaints WHERE complaint_id = ? AND assigned_staff_id = ?').get(id, req.user.id);
    if (!task) return res.status(404).json({ error: 'Assigned task not found' });

    let resolved_at = task.resolved_at;
    if (status === 'Resolved') resolved_at = new Date().toISOString();

    db.prepare(`
      UPDATE complaints 
      SET status = ?, resolution_notes = COALESCE(?, resolution_notes),
          resolution_proof_url = COALESCE(?, resolution_proof_url),
          resolved_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE complaint_id = ?
    `).run(status, notes || null, resolution_proof_url, resolved_at, id);

    db.prepare(`
      INSERT INTO status_history (complaint_id, status, changed_by_user_id, notes)
      VALUES (?, ?, ?, ?)
    `).run(id, status, req.user.id, notes || `Status updated by Assigned Staff (${req.user.name})`);

    createNotification(task.user_id, id, 'Complaint Updated', `Maintenance staff updated status to: ${status}`);

    res.json({ message: 'Task status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
