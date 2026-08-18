import db from '../models/db.js';
import { analyzeComplaint } from '../services/aiService.js';
import { createNotification, notifyAdmins } from '../services/notificationService.js';

export async function createComplaint(req, res) {
  try {
    const { title, description, category, building, floor, room_or_area, latitude, longitude } = req.body;
    const attachment_url = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title || !description || !building) {
      return res.status(400).json({ error: 'Title, description, and building are required' });
    }

    // AI Classification & Duplicate Check
    const aiResult = await analyzeComplaint({ title, description, building, room_or_area });

    // Generate Unique ID
    const count = db.prepare('SELECT COUNT(*) as total FROM complaints').get().total;
    const year = new Date().getFullYear();
    const complaint_id = `CMP-${year}-${String(count + 1).padStart(4, '0')}`;

    const finalCategory = category && category !== 'Auto-Detect' ? category : aiResult.category;
    const finalPriority = aiResult.priority;

    const stmt = db.prepare(`
      INSERT INTO complaints (
        complaint_id, user_id, title, description, category, priority, status,
        building, floor, room_or_area, latitude, longitude, attachment_url,
        ai_category, ai_priority, ai_department, ai_confidence, is_duplicate_of
      ) VALUES (?, ?, ?, ?, ?, ?, 'Submitted', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      complaint_id, req.user.id, title, description, finalCategory, finalPriority,
      building, floor || null, room_or_area || null,
      latitude ? parseFloat(latitude) : null, longitude ? parseFloat(longitude) : null,
      attachment_url, aiResult.category, aiResult.priority, aiResult.department,
      aiResult.confidence, aiResult.isDuplicateOf
    );

    // Add status history
    db.prepare(`
      INSERT INTO status_history (complaint_id, status, changed_by_user_id, notes)
      VALUES (?, 'Submitted', ?, 'Complaint created by student/user')
    `).run(complaint_id, req.user.id);

    // In-app Notifications
    createNotification(req.user.id, complaint_id, 'Complaint Submitted', `Complaint ${complaint_id} recorded successfully.`);
    notifyAdmins(complaint_id, 'New Complaint Received', `${complaint_id} (${finalPriority}) reported at ${building} - ${room_or_area || 'General'}.`);

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint_id,
      aiRecommendations: aiResult
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function getMyComplaints(req, res) {
  try {
    const complaints = db.prepare(`
      SELECT c.*, u.name as staff_name, f.rating, f.comment as feedback_comment
      FROM complaints c
      LEFT JOIN users u ON c.assigned_staff_id = u.id
      LEFT JOIN feedback f ON c.complaint_id = f.complaint_id
      WHERE c.user_id = ?
      ORDER BY c.id DESC
    `).all(req.user.id);
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function getComplaintById(req, res) {
  try {
    const { id } = req.params;
    const complaint = db.prepare(`
      SELECT c.*, u.name as reporter_name, u.email as reporter_email, s.name as staff_name, s.department as staff_dept,
             f.rating, f.comment as feedback_comment
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN users s ON c.assigned_staff_id = s.id
      LEFT JOIN feedback f ON c.complaint_id = f.complaint_id
      WHERE c.complaint_id = ? OR c.id = ?
    `).get(id, id);

    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    // Authorization check
    if (req.user.role === 'student' && complaint.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const history = db.prepare(`
      SELECT sh.*, u.name as changed_by_name, u.role as changed_by_role
      FROM status_history sh
      JOIN users u ON sh.changed_by_user_id = u.id
      WHERE sh.complaint_id = ?
      ORDER BY sh.id ASC
    `).all(complaint.complaint_id);

    res.json({ ...complaint, history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function submitFeedback(req, res) {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const complaint = db.prepare('SELECT * FROM complaints WHERE complaint_id = ?').get(id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    if (complaint.user_id !== req.user.id) return res.status(403).json({ error: 'Only reporter can submit feedback' });
    if (!['Resolved', 'Closed'].includes(complaint.status)) {
      return res.status(400).json({ error: 'Feedback can only be submitted for resolved complaints' });
    }

    db.prepare(`
      INSERT OR REPLACE INTO feedback (complaint_id, user_id, rating, comment)
      VALUES (?, ?, ?, ?)
    `).run(id, req.user.id, rating, comment || null);

    res.json({ message: 'Feedback submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function reopenComplaint(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const complaint = db.prepare('SELECT * FROM complaints WHERE complaint_id = ?').get(id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    if (complaint.user_id !== req.user.id) return res.status(403).json({ error: 'Only reporter can reopen' });

    db.prepare(`UPDATE complaints SET status = 'Reopened', updated_at = CURRENT_TIMESTAMP WHERE complaint_id = ?`).run(id);
    db.prepare(`
      INSERT INTO status_history (complaint_id, status, changed_by_user_id, notes)
      VALUES (?, 'Reopened', ?, ?)
    `).run(id, req.user.id, reason || 'Student reopened ticket: Issue still unresolved');

    notifyAdmins(id, 'Complaint Reopened', `Student reopened ${id}. Reason: ${reason || 'Unresolved'}`);

    res.json({ message: 'Complaint marked as Reopened' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
