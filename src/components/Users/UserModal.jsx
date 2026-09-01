import React, { useState, useEffect } from 'react';
import { Modal } from '../UI/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

export const UserModal = ({ isOpen, onClose, onUserSaved, initialData = null }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  if (user?.role !== 'Admin') return null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Salesman');
  const [status, setStatus] = useState('Active');
  const [distributorId, setDistributorId] = useState('');
  const [superStockistId, setSuperStockistId] = useState('');
  const [assignedBrandIds, setAssignedBrandIds] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [superStockists, setSuperStockists] = useState([]);
  const [brandsList, setBrandsList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchMasterLists = async () => {
      if (user.role === 'Admin') {
        try {
          const [ssList, distList, bList] = await Promise.all([
            api.get('/users?role=Super Stockist'),
            api.get('/users?role=Distributor'),
            api.get('/brands?activeOnly=true'),
          ]);
          setSuperStockists(ssList);
          setDistributors(distList);
          setBrandsList(bList);
        } catch (err) {
          console.error(err);
        }
      }
    };

    fetchMasterLists();

    if (initialData) {
      setName(initialData.name || '');
      setEmail(initialData.email || '');
      setRole(initialData.role || 'Salesman');
      setStatus(initialData.status || 'Active');
      setDistributorId(initialData.distributorId?._id || initialData.distributorId || '');
      setSuperStockistId(initialData.superStockistId?._id || initialData.superStockistId || '');
      
      const bIds = (initialData.assignedBrands || []).map((b) => (b._id ? b._id : b));
      setAssignedBrandIds(bIds);
      setPassword('');
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setRole('Salesman');
      setStatus('Active');
      setDistributorId('');
      setSuperStockistId('');
      setAssignedBrandIds([]);
    }
  }, [isOpen, initialData, user]);

  const handleBrandToggle = (brandId) => {
    setAssignedBrandIds((prev) =>
      prev.includes(brandId) ? prev.filter((id) => id !== brandId) : [...prev, brandId]
    );
  };

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
        ...(role === 'Salesman' || role === 'ASM' ? { distributorId: distributorId || null } : {}),
        ...(role === 'Distributor' || role === 'ASE' ? { superStockistId: superStockistId || null } : {}),
        ...(role === 'Super Stockist' ? { assignedBrands: assignedBrandIds } : {}),
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
      maxWidth="max-w-xl"
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
            placeholder="e.g. Ramesh Kumar"
            required
            className="w-full border rounded-xl px-3.5 py-2 text-sm focus:border-sky-500"
            style={inputStyle}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--c-text-muted)' }}>
            Email Address *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. ramesh@example.com"
            required
            className="w-full border rounded-xl px-3.5 py-2 text-sm focus:border-sky-500"
            style={inputStyle}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--c-text-muted)' }}>
            {initialData ? 'New Password (leave blank to keep current)' : 'Password *'}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={initialData ? '••••••••' : 'Minimum 6 characters'}
            required={!initialData}
            minLength={6}
            className="w-full border rounded-xl px-3.5 py-2 text-sm focus:border-sky-500"
            style={inputStyle}
          />
        </div>

        {user.role === 'Admin' && (
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--c-text-muted)' }}>
              System Role *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border rounded-xl px-3.5 py-2 text-sm focus:border-sky-500"
              style={inputStyle}
            >
              <option value="Salesman">Salesman</option>
              <option value="ASM">ASM (Area Sales Manager)</option>
              <option value="Distributor">Distributor</option>
              <option value="ASE">ASE (Area Sales Executive)</option>
              <option value="Super Stockist">Super Stockist</option>
              <option value="Admin">Company Admin</option>
            </select>
          </div>
        )}

        {/* Assign Brands to Super Stockist */}
        {user.role === 'Admin' && role === 'Super Stockist' && (
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--c-text-muted)' }}>
              Authorized Brands for Super Stockist
            </label>
            {brandsList.length === 0 ? (
              <p className="text-xs text-amber-400">No active brands available. Add brands in Brands Master.</p>
            ) : (
              <div
                className="p-3 rounded-xl border max-h-40 overflow-y-auto space-y-2"
                style={{ backgroundColor: 'var(--c-bg-surface)', borderColor: 'var(--c-border)' }}
              >
                {brandsList.map((b) => (
                  <label key={b._id} className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={assignedBrandIds.includes(b._id)}
                      onChange={() => handleBrandToggle(b._id)}
                      className="rounded border-slate-700 text-sky-500 focus:ring-sky-500"
                    />
                    <span style={{ color: 'var(--c-text-primary)' }}>{b.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Assign Distributor to Salesman or ASM */}
        {user.role === 'Admin' && (role === 'Salesman' || role === 'ASM') && (
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--c-text-muted)' }}>
              Assign Distributor
            </label>
            <select
              value={distributorId}
              onChange={(e) => setDistributorId(e.target.value)}
              className="w-full border rounded-xl px-3.5 py-2 text-sm focus:border-sky-500"
              style={inputStyle}
            >
              <option value="">None (Unassigned)</option>
              {distributors.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.email})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Assign Super Stockist to Distributor or ASE */}
        {user.role === 'Admin' && (role === 'Distributor' || role === 'ASE') && (
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
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-sky-500 hover:bg-sky-400 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Saving...' : initialData ? 'Save Changes' : 'Create Account'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
