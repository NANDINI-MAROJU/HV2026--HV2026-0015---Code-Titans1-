import React, { useState, useEffect } from 'react';
import { Layers, AlertTriangle, Clock, CheckCircle2, Star, Filter, Search, UserCheck } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import CampusMap from '../components/CampusMap';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPrio, setFilterPrio] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assigneeId, setAssigneeId] = useState('');

  const fetchData = async () => {
    const [statsRes, listRes] = await Promise.all([
      api.get('/admin/stats'),
      api.get(`/admin/complaints?status=${filterStatus}&priority=${filterPrio}&search=${searchTerm}`)
    ]);
    setStats(statsRes.data);
    setComplaints(listRes.data);
  };

  useEffect(() => {
    fetchData();
  }, [filterStatus, filterPrio, searchTerm]);

  const handleAssign = async (complaintId) => {
    if (!assigneeId) return alert('Select a staff member');
    await api.patch(`/admin/complaints/${complaintId}`, {
      assigned_staff_id: parseInt(assigneeId),
      status: 'Assigned',
      notes: 'Staff assigned by Admin'
    });
    alert('Assigned successfully');
    fetchData();
    setSelectedComplaint(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Tickets</span>
            <p className="text-2xl font-bold text-slate-800 mt-1">{stats.stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-blue-600 uppercase">New / Submitted</span>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.stats.submitted}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-amber-600 uppercase">In Progress</span>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.stats.inProgress}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-emerald-600 uppercase">Resolved</span>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.stats.resolved}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-rose-600 uppercase">Critical Issues</span>
            <p className="text-2xl font-bold text-rose-600 mt-1">{stats.stats.critical}</p>
          </div>
        </div>
      )}

      {/* Campus Map View */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" /> Live Campus Geo-Location Tracking
        </h3>
        <CampusMap complaints={complaints} />
      </div>

      {/* Filters & Complaint Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, Title, or Keyword..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full text-sm outline-none bg-transparent"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="text-xs border rounded-lg px-2.5 py-1.5 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            <select
              value={filterPrio}
              onChange={e => setFilterPrio(e.target.value)}
              className="text-xs border rounded-lg px-2.5 py-1.5 bg-white"
            >
              <option value="">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Location</th>
                <th className="p-3">AI Recom.</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
                <th className="p-3">Assigned Staff</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-slate-700">
              {complaints.map(c => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-blue-600">{c.complaint_id}</td>
                  <td className="p-3 font-medium max-w-[200px] truncate">{c.title}</td>
                  <td className="p-3">{c.category}</td>
                  <td className="p-3 text-slate-500">{c.building} ({c.room_or_area || 'General'})</td>
                  <td className="p-3">
                    <span className="text-[11px] text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                      {c.ai_department}
                    </span>
                  </td>
                  <td className="p-3"><PriorityBadge priority={c.priority} /></td>
                  <td className="p-3"><StatusBadge status={c.status} /></td>
                  <td className="p-3">{c.staff_name || <span className="text-slate-400 italic">Unassigned</span>}</td>
                  <td className="p-3">
                    <button
                      onClick={() => setSelectedComplaint(c)}
                      className="text-xs bg-slate-800 text-white px-2.5 py-1 rounded hover:bg-black font-medium"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Action Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-800">
              Manage Complaint: {selectedComplaint.complaint_id}
            </h3>
            <p className="text-xs text-slate-600 font-medium">{selectedComplaint.title}</p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Assign Staff Member</label>
              <select
                value={assigneeId}
                onChange={e => setAssigneeId(e.target.value)}
                className="w-full border rounded-lg p-2 text-sm bg-white"
              >
                <option value="">Choose Staff...</option>
                {stats?.staffList.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.department})</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2 border rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAssign(selectedComplaint.complaint_id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700"
              >
                Save & Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
