import React from 'react';

export const Badge = ({ status }) => {
  if (status === 'Delivered') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        Delivered
      </span>
    );
  }

  if (status === 'Pending') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
        Pending
      </span>
    );
  }

  if (status === 'Active') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        Active
      </span>
    );
  }

  if (status === 'Inactive') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
        Inactive
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
      {status}
    </span>
  );
};
