import React, { useState, useEffect } from 'react';
import { QrCode, Download, Plus } from 'lucide-react';
import api from '../services/api';

export default function QRManagement() {
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState({
    code: '',
    building: 'Academic Block A',
    floor: '',
    room_or_area: '',
    category_hint: 'Laboratory'
  });

  const fetchLocations = async () => {
    const res = await api.get('/qr/locations');
    setLocations(res.data);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    await api.post('/qr/generate', form);
    alert('QR location generated successfully!');
    setForm({ code: '', building: 'Academic Block A', floor: '', room_or_area: '', category_hint: 'Laboratory' });
    fetchLocations();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <QrCode className="w-5 h-5 text-blue-600" /> Generate Campus Location QR Code
        </h2>
        <form onSubmit={handleGenerate} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            required
            placeholder="Unique Code (e.g. QR-LAB-302)"
            value={form.code}
            onChange={e => setForm({ ...form, code: e.target.value })}
            className="border p-2 rounded text-xs"
          />
          <input
            type="text"
            required
            placeholder="Room or Facility Name"
            value={form.room_or_area}
            onChange={e => setForm({ ...form, room_or_area: e.target.value })}
            className="border p-2 rounded text-xs"
          />
          <input
            type="text"
            required
            placeholder="Floor (e.g. 3rd Floor)"
            value={form.floor}
            onChange={e => setForm({ ...form, floor: e.target.value })}
            className="border p-2 rounded text-xs"
          />
          <button type="submit" className="bg-blue-600 text-white text-xs font-semibold py-2 px-4 rounded hover:bg-blue-700">
            Generate QR
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {locations.map(loc => (
          <div key={loc.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <img src={loc.qr_image_url} alt={loc.code} className="w-36 h-36 mb-2 border rounded" />
            <span className="font-bold text-sm text-slate-800">{loc.code}</span>
            <span className="text-xs text-slate-500">{loc.building} - {loc.room_or_area}</span>
            <span className="text-[11px] text-blue-600 font-medium">{loc.category_hint}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
