import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = 'sky', subtitle }) => {
  const colorMap = {
    sky:     'bg-sky-500/10 text-sky-400 border-sky-500/20',
    amber:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    indigo:  'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    purple:  'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  return (
    <div
      className="rounded-2xl p-5 shadow-lg transition-all border"
      style={{
        backgroundColor: 'var(--c-bg-surface)',
        borderColor: 'var(--c-border)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-sm font-semibold"
          style={{ color: 'var(--c-text-muted)' }}
        >
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${colorMap[color] || colorMap.sky}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div
        className="text-3xl font-extrabold tracking-tight"
        style={{ color: 'var(--c-text-primary)' }}
      >
        {value}
      </div>

      {subtitle && (
        <p
          className="text-xs mt-1"
          style={{ color: 'var(--c-text-muted)' }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};
