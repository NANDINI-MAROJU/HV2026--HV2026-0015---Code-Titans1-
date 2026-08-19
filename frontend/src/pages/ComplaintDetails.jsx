import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, ShieldAlert, CheckCircle2, RotateCcw } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import ComplaintTimeline from '../components/ComplaintTimeline';

export default function ComplaintDetails() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [reopenReason, setReopenReason] = useState('');

  const fetchComplaint = async () => {
    const res = await api.get(`/complaints/${id}`);
    setComplaint(res.data);
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const handleFeedback = async (e) => {
    e.preventDefault();
    await api.post(`/complaints/${id}/feedback`, { rating, comment: feedbackText });
    alert('Thank you for rating the service!');
    fetchComplaint();
  };

  const handleReopen = async (e) => {
    e.preventDefault();
    await api.post(`/complaints/${id}/reopen`, { reason: reopenReason });
    alert('Complaint reopened and escalated to Admin.');
    fetchComplaint();
  };

  if (!complaint) return <div className="p-8 text-center text-sm text-slate-500">Loading details...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-4">
          <div>
            <span className="text-xs font-bold text-blue-600">{complaint.complaint_id}</span>
            <h1 className="text-xl font-bold text-slate-800">{complaint.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={complaint.priority} />
            <StatusBadge status={complaint.status} />
          </div>
        </div>

        <p className="text-sm text-slate-600">{complaint.description}</p>

        {complaint.attachment_url && (
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">Attached Proof</span>
            <img
              src={complaint.attachment_url}
              alt="Issue attachment"
              className="w-48 h-32 object-cover rounded-lg border"
            />
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-slate-50 rounded-lg text-xs">
          <div>
            <span className="text-slate-400 block">Category</span>
            <span className="font-semibold text-slate-700">{complaint.category}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Location</span>
            <span className="font-semibold text-slate-700">{complaint.building} - {complaint.room_or_area}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Assigned Staff</span>
            <span className="font-semibold text-slate-700">{complaint.staff_name || 'Pending assignment'}</span>
          </div>
          <div>
            <span className="text-slate-400 block">AI Recommended Dept</span>
            <span className="font-semibold text-purple-700">{complaint.ai_department}</span>
          </div>
        </div>

        {/* Visual Lifecycle Timeline */}
        <ComplaintTimeline currentStatus={complaint.status} history={complaint.history} />
      </div>

      {/* Resolution & Feedback Section */}
      {complaint.status === 'Resolved' && !complaint.rating && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" /> Rate Resolution & Service
          </h3>
          <form onSubmit={handleFeedback} className="space-y-3">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-1 rounded ${rating >= star ? 'text-amber-500' : 'text-slate-300'}`}
                >
                  <Star className="w-6 h-6 fill-current" />
                </button>
              ))}
            </div>
            <textarea
              placeholder="Leave feedback on service quality..."
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              className="w-full text-xs p-2.5 border rounded-lg"
              rows={2}
            />
            <button type="submit" className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-emerald-700">
              Submit 5-Star Feedback
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
