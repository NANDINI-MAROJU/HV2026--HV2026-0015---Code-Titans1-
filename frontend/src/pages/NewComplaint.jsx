import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, MapPin, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';

export default function NewComplaint() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: searchParams.get('category') || 'Auto-Detect',
    building: searchParams.get('building') || 'Academic Block A',
    floor: searchParams.get('floor') || '',
    room_or_area: searchParams.get('room') || '',
    latitude: '',
    longitude: ''
  });

  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('');
  const [aiPreview, setAiPreview] = useState(null);

  useEffect(() => {
    if (searchParams.get('building')) {
      setFormData(prev => ({
        ...prev,
        building: searchParams.get('building'),
        floor: searchParams.get('floor') || '',
        room_or_area: searchParams.get('room') || '',
        category: searchParams.get('category') || 'Auto-Detect'
      }));
    }
  }, [location.search]);

  const detectLocation = () => {
    setGpsStatus('Detecting GPS coordinates...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData(prev => ({
            ...prev,
            latitude: pos.coords.latitude.toFixed(6),
            longitude: pos.coords.longitude.toFixed(6)
          }));
          setGpsStatus('Location locked via GPS');
        },
        () => {
          // Fallback to campus center coords
          setFormData(prev => ({ ...prev, latitude: '17.385044', longitude: '78.486671' }));
          setGpsStatus('GPS permission denied. Using Campus Landmark coords.');
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (attachment) data.append('attachment', attachment);

      const res = await api.post('/complaints', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setAiPreview(res.data.aiRecommendations);
      setTimeout(() => {
        navigate(`/complaints/${res.data.complaint_id}`);
      }, 1200);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Submit Campus Request</h2>
          <p className="text-xs text-slate-500">Report problems, broken equipment, or maintenance issues</p>
        </div>
        <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-100">
          <Sparkles className="w-3.5 h-3.5" /> AI Priority Active
        </span>
      </div>

      {searchParams.get('code') && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          Location auto-filled from QR code: <strong>{searchParams.get('code')}</strong>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Issue Title *</label>
          <input
            type="text"
            required
            placeholder="e.g. Projector not working or Water leakage"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Detailed Description *</label>
          <textarea
            required
            rows={3}
            placeholder="Describe the exact fault, symptoms, or hazard..."
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Category</label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
            >
              <option value="Auto-Detect">Auto-Detect via AI</option>
              <option value="Electrical">Electrical</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Internet/Wi-Fi">Internet/Wi-Fi</option>
              <option value="Laboratory">Laboratory</option>
              <option value="Cleanliness">Cleanliness</option>
              <option value="Security">Security</option>
              <option value="Maintenance">General Maintenance</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Building/Block *</label>
            <select
              value={formData.building}
              onChange={e => setFormData({ ...formData, building: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
            >
              <option value="Academic Block A">Academic Block A</option>
              <option value="Academic Block B">Academic Block B</option>
              <option value="Boys Hostel Block 1">Boys Hostel Block 1</option>
              <option value="Girls Hostel Block 1">Girls Hostel Block 1</option>
              <option value="Central Library">Central Library</option>
              <option value="Main Auditorium">Main Auditorium</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Floor</label>
            <input
              type="text"
              placeholder="e.g. 2nd Floor"
              value={formData.floor}
              onChange={e => setFormData({ ...formData, floor: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Room / Specific Area</label>
            <input
              type="text"
              placeholder="e.g. Lab 302 or Near Water Cooler"
              value={formData.room_or_area}
              onChange={e => setFormData({ ...formData, room_or_area: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="p-3 bg-slate-50 border rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" /> GPS Tagging
            </span>
            <button
              type="button"
              onClick={detectLocation}
              className="text-xs bg-white border border-slate-300 px-3 py-1 rounded hover:bg-slate-100 font-medium"
            >
              Fetch Current GPS
            </button>
          </div>
          {gpsStatus && <p className="text-[11px] text-blue-600 mt-1 font-medium">{gpsStatus}</p>}
          {formData.latitude && (
            <p className="text-[11px] text-slate-500 mt-0.5">
              Lat: {formData.latitude}, Lng: {formData.longitude}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Photo Attachment</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setAttachment(e.target.files[0])}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-all shadow"
        >
          {loading ? 'Submitting & Running AI Analysis...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}
