import db from '../models/db.js';

const KEYWORD_RULES = [
  {
    category: 'Electrical',
    department: 'Electrical Maintenance',
    keywords: ['fan', 'light', 'bulb', 'switch', 'spark', 'power', 'socket', 'wire', 'fuse', 'ac', 'voltage', 'short circuit'],
    highPriority: ['spark', 'fire', 'shock', 'smoke', 'short circuit']
  },
  {
    category: 'Plumbing',
    department: 'Civil & Water Works',
    keywords: ['leak', 'pipe', 'tap', 'water', 'overflow', 'flush', 'drain', 'washroom', 'toilet', 'sewage', 'clogged'],
    highPriority: ['flooding', 'main pipe', 'burst', 'overflowing sewage']
  },
  {
    category: 'Internet/Wi-Fi',
    department: 'IT & Network Support',
    keywords: ['wifi', 'wi-fi', 'internet', 'router', 'ethernet', 'lan', 'network', 'connection', 'dns', 'signal'],
    highPriority: ['server room', 'datacenter down', 'entire block offline']
  },
  {
    category: 'Laboratory',
    department: 'Lab Technical Support',
    keywords: ['projector', 'computer', 'pc', 'monitor', 'oscilloscope', 'machine', 'chemical', 'fume hood', 'lab equipment'],
    highPriority: ['chemical spill', 'gas leak', 'exam hall projector']
  },
  {
    category: 'Cleanliness',
    department: 'Sanitation Team',
    keywords: ['garbage', 'trash', 'dust', 'cleaning', 'dirty', 'smell', 'odor', 'sweep', 'mop'],
    highPriority: ['biohazard', 'medical waste']
  },
  {
    category: 'Security',
    department: 'Campus Security',
    keywords: ['theft', 'stolen', 'broken lock', 'unauthorized', 'camera', 'cctv', 'harassment', 'gate', 'guard'],
    highPriority: ['theft', 'unauthorized entry', 'harassment', 'broken main lock']
  }
];

export async function analyzeComplaint({ title, description, building, room_or_area }) {
  const text = `${title} ${description}`.toLowerCase();
  
  let detectedCategory = 'Maintenance';
  let detectedDept = 'General Facilities';
  let detectedPriority = 'Medium';
  let confidence = 0.75;

  for (const rule of KEYWORD_RULES) {
    const match = rule.keywords.some(k => text.includes(k));
    if (match) {
      detectedCategory = rule.category;
      detectedDept = rule.department;
      confidence = 0.88;

      const isHigh = rule.highPriority.some(hp => text.includes(hp));
      if (isHigh) {
        detectedPriority = 'High';
        confidence = 0.95;
      }
      break;
    }
  }

  if (text.includes('urgent') || text.includes('danger') || text.includes('emergency') || text.includes('fire')) {
    detectedPriority = 'Critical';
    confidence = 0.99;
  }

  // Duplicate Detection Query (Within same building/room with similar keywords in the last 7 days)
  const potentialDuplicates = db.prepare(`
    SELECT complaint_id, title, description, status 
    FROM complaints 
    WHERE building = ? AND (room_or_area = ? OR room_or_area IS NULL) 
      AND status NOT IN ('Resolved', 'Closed')
      AND created_at >= datetime('now', '-7 days')
    ORDER BY id DESC LIMIT 5
  `).all(building, room_or_area);

  let isDuplicateOf = null;
  for (const item of potentialDuplicates) {
    const simText = `${item.title} ${item.description}`.toLowerCase();
    const commonWords = text.split(/\s+/).filter(w => w.length > 3 && simText.includes(w));
    if (commonWords.length >= 2) {
      isDuplicateOf = item.complaint_id;
      break;
    }
  }

  return {
    category: detectedCategory,
    priority: detectedPriority,
    department: detectedDept,
    confidence,
    isDuplicateOf
  };
}
