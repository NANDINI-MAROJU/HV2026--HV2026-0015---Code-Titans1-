import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LayoutDashboard, PlusCircle, QrCode, LogOut, CheckSquare } from 'lucide-react';

import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import NewComplaint from './pages/NewComplaint';
import ComplaintDetails from './pages/ComplaintDetails';
import QRScannerView from './pages/QRScannerView';
import QRManagement from './pages/QRManagement';

export default function App() {
  const { user, logout, loading } = useAuth();

  if (loading) return null;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">
            HV
          </span>
          <span className="font-bold text-slate-800 text-base">CampusOps 360</span>
        </div>

        {user ? (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-800">{user.name}</p>
              <p className="text-[10px] text-blue-600 font-semibold uppercase">{user.role}</p>
            </div>
            <button
              onClick={logout}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-xs font-semibold px-3 py-1.5 text-slate-700 hover:text-black">
              Login
            </Link>
            <Link to="/register" className="text-xs font-semibold px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Register
            </Link>
          </div>
        )}
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        {user && (
          <aside className="md:col-span-3 space-y-2">
            <nav className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 text-xs font-semibold text-slate-600">
              {user.role === 'admin' ? (
                <>
                  <Link to="/" className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 text-slate-800">
                    <LayoutDashboard className="w-4 h-4 text-blue-600" /> Admin Command Center
                  </Link>
                  <Link to="/qr-manage" className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50">
                    <QrCode className="w-4 h-4 text-indigo-600" /> QR Code Generator
                  </Link>
                </>
              ) : null}

              <Link to="/complaints/new" className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 text-blue-600 font-bold">
                <PlusCircle className="w-4 h-4 text-blue-600" /> New Service Request
              </Link>
            </nav>
          </aside>
        )}

        <main className={user ? "md:col-span-9" : "md:col-span-12"}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/scan" element={<QRScannerView />} />
            <Route path="/complaints/new" element={user ? <NewComplaint /> : <Navigate to="/login" />} />
            <Route path="/complaints/:id" element={user ? <ComplaintDetails /> : <Navigate to="/login" />} />
            <Route path="/qr-manage" element={user?.role === 'admin' ? <QRManagement /> : <Navigate to="/" />} />
            <Route path="/" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/complaints/new" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
