import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function CampusMap({ complaints = [], onSelectComplaint }) {
  const campusCenter = [17.3850, 78.4867];

  return (
    <div className="h-96 w-full rounded-xl overflow-hidden shadow-inner border border-slate-200 z-0 relative">
      <MapContainer center={campusCenter} zoom={16} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {complaints.filter(c => c.latitude && c.longitude).map(c => (
          <Marker key={c.complaint_id} position={[c.latitude, c.longitude]}>
            <Popup>
              <div className="p-1 space-y-1">
                <p className="font-bold text-sm text-slate-800">{c.complaint_id}</p>
                <p className="text-xs text-slate-600 font-semibold">{c.title}</p>
                <p className="text-xs text-slate-500">{c.building} - {c.room_or_area}</p>
                <div className="pt-2">
                  <button 
                    onClick={() => onSelectComplaint && onSelectComplaint(c.complaint_id)}
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 w-full"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
