import React, { useState } from 'react';
import { Modal } from '../UI/Modal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export const FactoryResetModal = ({ isOpen, onClose, onSuccess }) => {
  const { showSuccess, showError } = useToast();
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (confirmText.trim() !== 'RESET') {
      showError('Please type RESET in capital letters to confirm.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.delete('/orders/factory-reset');
      showSuccess(res?.message || 'Factory reset successful! All orders have been deleted.');
      setConfirmText('');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      showError(err.message || 'Failed to factory reset orders');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setConfirmText('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Factory Reset Orders (Admin Only)" maxWidth="max-w-lg">
      <form onSubmit={handleReset} className="space-y-5">
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm space-y-2 text-rose-200">
            <p className="font-bold text-rose-300">
              Warning: This is a destructive and permanent action!
            </p>
            <p>
              This will completely wipe <strong>all orders</strong> created in the system by Salesmen, Distributors, Super Stockists, ASM, ASE, and Admin.
            </p>
            <p>
              Order sequential numbering will also be reset to 0001 for future orders.
            </p>
            <p className="text-xs text-rose-300/80">
              * Note: User accounts, retail shops, brands, and items master will NOT be deleted.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--c-text-secondary)' }}>
            To confirm this action, please type <span className="font-mono font-bold text-rose-400">RESET</span> below:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type RESET to confirm"
            disabled={loading}
            className="w-full px-4 py-2.5 rounded-xl border font-mono font-bold text-center uppercase tracking-wider text-sm transition-all focus:outline-none focus:ring-2 focus:ring-rose-500"
            style={{
              backgroundColor: 'var(--c-bg-elevated)',
              borderColor: confirmText === 'RESET' ? '#f43f5e' : 'var(--c-border)',
              color: 'var(--c-text-primary)',
            }}
            autoFocus
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: 'var(--c-border)' }}>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors hover:bg-slate-800 disabled:opacity-50"
            style={{ color: 'var(--c-text-muted)' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={confirmText !== 'RESET' || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-lg shadow-rose-950/40 disabled:opacity-40 disabled:cursor-not-allowed border border-rose-500/30"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Resetting All Orders...</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Delete All Orders</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
