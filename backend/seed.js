import bcrypt from 'bcryptjs';
import db from './src/models/db.js';

console.log('Seeding demo data...');

// Reset tables
db.exec(`
  DELETE FROM feedback;
  DELETE FROM status_history;
  DELETE FROM notifications;
  DELETE FROM complaints;
  DELETE FROM qr_locations;
  DELETE FROM users;
`);

const password = bcrypt.hashSync('password123', 10);

// Users
const users = [
  { name: 'Admin User', email: 'admin@campus.edu', role: 'admin', dept: 'Facilities Management', phone: '9876543210' },
  { name: 'Ramesh Electrical', email: 'ramesh@campus.edu', role: 'staff', dept: 'Electrical Maintenance', phone: '9876543211' },
  { name: 'Suresh Civil & Water', email: 'suresh@campus.edu', role: 'staff', dept: 'Civil & Water Works', phone: '9876543212' },
  { name: 'Rahul IT Lab', email: 'rahul@campus.edu', role: 'staff', dept: 'Lab Technical Support', phone: '9876543213' },
  { name: 'Ananya Sharma (Student)', email: 'student@campus.edu', role: 'student', dept: 'CSE Department', phone: '9876543214' }
];

const insertUser = db.prepare(`INSERT INTO users (name, email, password, role, department, phone) VALUES (?, ?, ?, ?, ?, ?)`);
users.forEach(u => insertUser.run(u.name, u.email, password, u.role, u.dept, u.phone));

// QR Locations
const qrLocations = [
  { code: 'QR-LAB-302', b: 'Academic Block A', f: '3rd Floor', r: 'CSE Lab 3', cat: 'Laboratory', lat: 17.3850, lng: 78.4867 },
  { code: 'QR-HOSTEL-B-104', b: 'Boys Hostel Block 1', f: '1st Floor', r: 'Room 104', cat: 'Plumbing', lat: 17.3860, lng: 78.4875 },
  { code: 'QR-LIB-GF', b: 'Central Library', f: 'Ground Floor', r: 'Digital Reading Hall', cat: 'Internet/Wi-Fi', lat: 17.3845, lng: 78.4855 }
];

const insertQR = db.prepare(`INSERT INTO qr_locations (code, building, floor, room_or_area, category_hint, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)`);
qrLocations.forEach(q => insertQR.run(q.code, q.b, q.f, q.r, q.cat, q.lat, q.lng));

// Complaints
const demoComplaints = [
  {
    id: 'CMP-2026-0001', uid: 5, title: 'Projector not working in CSE Lab 3',
    desc: 'The HDMI connection is broken and lamp indicator blinks red during lectures.',
    cat: 'Laboratory', prio: 'High', stat: 'Assigned', b: 'Academic Block A', f: '3rd Floor', r: 'CSE Lab 3',
    lat: 17.3850, lng: 78.4867, staff: 4, ai_cat: 'Laboratory', ai_prio: 'High', ai_dept: 'Lab Technical Support'
  },
  {
    id: 'CMP-2026-0002', uid: 5, title: 'Main water pipe leak near washroom',
    desc: 'Severe water leakage causing puddles on the 1st floor corridor.',
    cat: 'Plumbing', prio: 'Critical', stat: 'In Progress', b: 'Boys Hostel Block 1', f: '1st Floor', r: 'Room 104 Corridor',
    lat: 17.3860, lng: 78.4875, staff: 3, ai_cat: 'Plumbing', ai_prio: 'Critical', ai_dept: 'Civil & Water Works'
  },
  {
    id: 'CMP-2026-0003', uid: 5, title: 'Ceiling fan making loud squeaking noise',
    desc: 'Fan speed regulator is stiff and motor is wobbling.',
    cat: 'Electrical', prio: 'Medium', stat: 'Resolved', b: 'Academic Block A', f: '2nd Floor', r: 'Room 204',
    lat: 17.3852, lng: 78.4869, staff: 2, ai_cat: 'Electrical', ai_prio: 'Medium', ai_dept: 'Electrical Maintenance'
  }
];

const insertCmp = db.prepare(`
  INSERT INTO complaints (
    complaint_id, user_id, title, description, category, priority, status,
    building, floor, room_or_area, latitude, longitude, assigned_staff_id,
    ai_category, ai_priority, ai_department, ai_confidence
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0.95)
`);

demoComplaints.forEach(c => {
  insertCmp.run(c.id, c.uid, c.title, c.desc, c.cat, c.prio, c.stat, c.b, c.f, c.r, c.lat, c.lng, c.staff, c.ai_cat, c.ai_prio, c.ai_dept);
  db.prepare(`INSERT INTO status_history (complaint_id, status, changed_by_user_id, notes) VALUES (?, 'Submitted', ?, 'Ticket created')`).run(c.id, c.uid);
  if (c.stat !== 'Submitted') {
    db.prepare(`INSERT INTO status_history (complaint_id, status, changed_by_user_id, notes) VALUES (?, ?, ?, 'Status progress update')`).run(c.id, c.stat, 1);
  }
});

console.log('Seed completed successfully!');
