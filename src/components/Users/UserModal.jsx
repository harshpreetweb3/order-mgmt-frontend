import React, { useState, useEffect } from 'react';
import { Modal } from '../UI/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

export const UserModal = ({ isOpen, onClose, onUserSaved, initialData = null }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(user.role === 'Distributor' ? 'Salesman' : 'Distributor');
  const [status, setStatus] = useState('Active');
  const [superStockistId, setSuperStockistId] = useState('');
  const [superStockists, setSuperStockists] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchSS = async () => {
      if (user.role === 'Admin') {
        try {
          const list = await api.get('/users?role=Super Stockist');
          setSuperStockists(list);
        } catch (err) {
          console.error(err);
        }
      }
    };

    fetchSS();

    if (initialData) {
      setName(initialData.name || '');
      setEmail(initialData.email || '');
      setRole(initialData.role || 'Distributor');
      setStatus(initialData.status || 'Active');
      setSuperStockistId(initialData.superStockistId?._id || initialData.superStockistId || '');
      setPassword('');
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setRole(user.role === 'Distributor' ? 'Salesman' : 'Distributor');
      setStatus('Active');
      setSuperStockistId('');
    }
  }, [isOpen, initialData, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      showError('Name and email are required');
      return;
    }

    if (!initialData && !password) {
      showError('Password is required for new users');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name,
        email,
        role,
        status,
        ...(password ? { password } : {}),
        ...(superStockistId ? { superStockistId } : {}),
      };

      if (initialData) {
        await api.put(`/users/${initialData._id}`, payload);
        showSuccess('User updated successfully');
      } else {
        await api.post('/users', payload);
        showSuccess(`New ${role} user created successfully`);
      }

      onUserSaved();
      onClose();
    } catch (err) {
      showError(err.message || 'Failed to save user');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    backgroundColor: 'var(--c-bg-input)',
    borderColor: 'var(--c-border)',
    color: 'var(--c-text-primary)',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit User: ${initialData.name}` : 'Create New User Account'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--c-text-muted)' }}>
            Full Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Robert Johnson"
            className="w-full border rounded-xl px-3.5 py-2 text-sm focus:border-sky-500"
            style={inputStyle}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--c-text-muted)' }}>
            Email / Username *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="e.g. robert@company.com"
            className="w-full border rounded-xl px-3.5 py-2 text-sm focus:border-sky-500"
            style={inputStyle}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--c-text-muted)' }}>
            {initialData ? 'New Password (Leave blank to keep unchanged)' : 'Password *'}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!initialData}
            minLength={6}
            placeholder="••••••••"
            className="w-full border rounded-xl px-3.5 py-2 text-sm focus:border-sky-500"
            style={inputStyle}
          />
        </div>

        {user.role === 'Admin' && (
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--c-text-muted)' }}>
              Role *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border rounded-xl px-3.5 py-2 text-sm focus:border-sky-500"
              style={inputStyle}
            >
              <option value="Distributor">Distributor</option>
              <option value="Super Stockist">Super Stockist</option>
              <option value="Salesman">Salesman</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        )}

        {user.role === 'Admin' && role === 'Distributor' && superStockists.length > 0 && (
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--c-text-muted)' }}>
              Assign Super Stockist
            </label>
            <select
              value={superStockistId}
              onChange={(e) => setSuperStockistId(e.target.value)}
              className="w-full border rounded-xl px-3.5 py-2 text-sm focus:border-sky-500"
              style={inputStyle}
            >
              <option value="">None (Unassigned)</option>
              {superStockists.map((ss) => (
                <option key={ss._id} value={ss._id}>
                  {ss.name} ({ss.email})
                </option>
              ))}
            </select>
          </div>
        )}

        {initialData && (
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--c-text-muted)' }}>
              Account Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded-xl px-3.5 py-2 text-sm focus:border-sky-500"
              style={inputStyle}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--c-border)' }}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
            style={{
              backgroundColor: 'var(--c-bg-elevated)',
              color: 'var(--c-text-secondary)',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-sky-500 hover:bg-sky-400 shadow-md shadow-sky-500/20 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : initialData ? 'Update Account' : 'Create Account'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
