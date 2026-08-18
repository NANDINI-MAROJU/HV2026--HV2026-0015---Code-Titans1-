import React from 'react';

const statusColors = {
  Submitted: 'bg-blue-100 text-blue-800 border-blue-200',
  Acknowledged: 'bg-purple-100 text-purple-800 border-purple-200',
  Assigned: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'In Progress': 'bg-amber-100 text-amber-800 border-amber-200',
  'On Hold': 'bg-gray-100 text-gray-800 border-gray-200',
  Resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Closed: 'bg-slate-100 text-slate-700 border-slate-200',
  Reopened: 'bg-rose-100 text-rose-800 border-rose-200'
};

export default function StatusBadge({ status }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
}
