import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function QRScannerView() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // When a QR code is scanned, parse parameters and redirect straight to complaint creation
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const building = params.get('building');
    const floor = params.get('floor');
    const room = params.get('room');
    const category = params.get('category');

    if (code) {
      navigate(`/complaints/new?code=${encodeURIComponent(code)}&building=${encodeURIComponent(building || '')}&floor=${encodeURIComponent(floor || '')}&room=${encodeURIComponent(room || '')}&category=${encodeURIComponent(category || '')}`);
    } else {
      navigate('/complaints/new');
    }
  }, [location, navigate]);

  return (
    <div className="flex items-center justify-center p-12 text-slate-600 text-sm">
      Processing QR Location tag...
    </div>
  );
}
