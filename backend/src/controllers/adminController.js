import db from '../models/db.js';
import { createNotification } from '../services/notificationService.js';

export function getAllComplaints(req, res) {
  try {
    const { status, category, priority, building, search } = req.query;
    let query = `
      SELECT c.*, u.name as reporter_name, s.name as staff_name, f.rating
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN users s ON c.assigned_staff_id = s.id
      LEFT JOIN feedback f ON c.complaint_id = f.complaint_id
      WHERE 1=1
    `;
    const params = [];

    if (status) { query += ' AND c.status = ?'; params.push(status); }
    if (category) { query += ' AND c.category = ?'; params.push(category); }
    if (priority) { query += ' AND c.priority = ?'; params.push(priority); }
    if (building) { query += ' AND c.building = ?'; params.push(building); }
    if (search) {
      query += ' AND (c.complaint_id LIKE ? OR c.title LIKE ? OR c.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY c.id DESC';
    const complaints = db.prepare(query).all(...params);
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function updateComplaint(req, res) {
  try {
    const { id } = req.params;
    const { status, assigned_staff_id, priority, notes } = req.body;

    const current = db.prepare('SELECT * FROM complaints WHERE complaint_id = ?').get(id);
    if (!current) return res.status(404).json({ error: 'Complaint not found' });

    let updatedStatus = status || current.status;
    let resolvedAt = current.resolved_at;
    if (status === 'Resolved' && current.status !== 'Resolved') {
      resolvedAt = new Date().toISOString();
    }

    db.prepare(`
      UPDATE complaints 
      SET status = ?, assigned_staff_id = ?, priority = ?, updated_at = CURRENT_TIMESTAMP, resolved_at = ?
      WHERE complaint_id = ?
    `).run(updatedStatus, assigned_staff_id || current.assigned_staff_id, priority || current.priority, resolvedAt, id);

    db.prepare(`
      INSERT INTO status_history (complaint_id, status, changed_by_user_id, notes)
      VALUES (?, ?, ?, ?)
    `).run(id, updatedStatus, req.user.id, notes || `Status updated to ${updatedStatus} by Admin`);

    // Notifications
    createNotification(current.user_id, id, 'Status Update', `Your complaint ${id} is now: ${updatedStatus}`);
    if (assigned_staff_id && assigned_staff_id !== current.assigned_staff_id) {
      createNotification(assigned_staff_id, id, 'New Task Assigned', `You have been assigned to complaint ${id}`);
    }

    res.json({ message: 'Complaint updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function getDashboardStats(req, res) {
  try {
    const total = db.prepare('SELECT COUNT(*) as c FROM complaints').get().c;
    const submitted = db.prepare("SELECT COUNT(*) as c FROM complaints WHERE status = 'Submitted'").get().c;
    const inProgress = db.prepare("SELECT COUNT(*) as c FROM complaints WHERE status = 'In Progress'").get().c;
    const resolved = db.prepare("SELECT COUNT(*) as c FROM complaints WHERE status = 'Resolved'").get().c;
    const critical = db.prepare("SELECT COUNT(*) as c FROM complaints WHERE priority = 'Critical' AND status NOT IN ('Resolved', 'Closed')").get().c;

    const byCategory = db.prepare('SELECT category, COUNT(*) as count FROM complaints GROUP BY category').all();
    const byStatus = db.prepare('SELECT status, COUNT(*) as count FROM complaints GROUP BY status').all();
    const byBuilding = db.prepare('SELECT building, COUNT(*) as count FROM complaints GROUP BY building').all();
    const avgRating = db.prepare('SELECT ROUND(AVG(rating), 1) as avg FROM feedback').get().avg || 0;

    const staffList = db.prepare(`SELECT id, name, department, role FROM users WHERE role = 'staff'`).all();

    res.json({
      stats: { total, submitted, inProgress, resolved, critical, avgRating },
      byCategory,
      byStatus,
      byBuilding,
      staffList
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
