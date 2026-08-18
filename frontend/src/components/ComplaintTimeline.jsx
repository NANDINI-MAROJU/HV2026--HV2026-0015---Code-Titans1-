import React from 'react';
import { CheckCircle2, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

const ALL_STEPS = ['Submitted', 'Acknowledged', 'Assigned', 'In Progress', 'Resolved'];

export default function ComplaintTimeline({ currentStatus, history = [] }) {
  const currentIndex = ALL_STEPS.indexOf(currentStatus);

  return (
    <div className="py-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-0" />
        {ALL_STEPS.map((step, idx) => {
          const isPassed = currentIndex >= idx;
          const isCurrent = currentStatus === step;

          return (
            <div key={step} className="flex flex-col items-center relative z-10 bg-white px-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                isCurrent 
                  ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100' 
                  : isPassed 
                  ? 'bg-emerald-600 border-emerald-600 text-white' 
                  : 'bg-white border-slate-300 text-slate-400'
              }`}>
                {isPassed ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              </div>
              <span className={`text-xs mt-1 font-medium ${isCurrent ? 'text-blue-600 font-bold' : isPassed ? 'text-emerald-700' : 'text-slate-400'}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>

      {history.length > 0 && (
        <div className="mt-6 border-t pt-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Activity Log</h4>
          {history.map((item) => (
            <div key={item.id} className="text-xs flex items-start gap-2 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
              <div>
                <span className="font-semibold text-slate-800">{item.status}</span> — {item.notes}
                <div className="text-slate-400 text-[10px]">
                  {new Date(item.timestamp).toLocaleString()} by {item.changed_by_name} ({item.changed_by_role})
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
