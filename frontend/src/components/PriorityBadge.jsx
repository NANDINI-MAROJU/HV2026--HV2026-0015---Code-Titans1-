import React from 'react';

const prioColors = {
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-blue-50 text-blue-700 border-blue-200',
  High: 'bg-amber-50 text-amber-700 border-amber-200',
  Critical: 'bg-rose-50 text-rose-700 border-rose-200 font-bold animate-pulse'
};

export default function PriorityBadge({ priority }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs border ${prioColors[priority] || 'bg-gray-100'}`}>
      {priority} Priority
    </span>
  );
}
