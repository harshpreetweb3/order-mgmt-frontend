import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in overflow-y-auto"
      style={{ backgroundColor: 'var(--c-overlay)' }}
      onClick={onClose}
    >
      <div
        className={`relative w-full ${maxWidth} rounded-2xl shadow-2xl overflow-hidden my-8`}
        style={{
          backgroundColor: 'var(--c-bg-surface)',
          border: '1px solid var(--c-border)',
          boxShadow: 'var(--c-shadow)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{
            borderBottom: '1px solid var(--c-border)',
            backgroundColor: 'var(--c-bg-elevated)',
          }}
        >
          <h3
            className="text-lg font-bold tracking-wide"
            style={{ color: 'var(--c-text-primary)' }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-slate-800"
            style={{ color: 'var(--c-text-muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
