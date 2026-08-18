import QRCode from 'qrcode';
import db from '../models/db.js';

export async function generateQRLocation(req, res) {
  try {
    const { code, building, floor, room_or_area, category_hint, latitude, longitude } = req.body;
    if (!code || !building || !floor || !room_or_area) {
      return res.status(400).json({ error: 'Code, building, floor, and room/area are required' });
    }

    const clientUrl = `http://localhost:5173/scan?code=${encodeURIComponent(code)}&building=${encodeURIComponent(building)}&floor=${encodeURIComponent(floor)}&room=${encodeURIComponent(room_or_area)}&category=${encodeURIComponent(category_hint || '')}`;
    const qrDataUrl = await QRCode.toDataURL(clientUrl, { width: 300, margin: 2 });

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO qr_locations (code, building, floor, room_or_area, category_hint, latitude, longitude, qr_image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(code, building, floor, room_or_area, category_hint || null, latitude || null, longitude || null, qrDataUrl);

    res.status(201).json({
      message: 'QR Code generated',
      code,
      qrDataUrl,
      targetUrl: clientUrl
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function getAllQRLocations(req, res) {
  try {
    const locations = db.prepare('SELECT * FROM qr_locations ORDER BY id DESC').all();
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
