import React, { useState, useEffect } from 'react';
import { Modal } from '../UI/Modal';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

export const ShopModal = ({ isOpen, onClose, onShopSaved, initialData = null }) => {
  const { showSuccess, showError } = useToast();
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setName(initialData.name || '');
      setOwnerName(initialData.ownerName || '');
      setPhone(initialData.phone || '');
      setAddress(initialData.address || '');
    } else {
      setName('');
      setOwnerName('');
      setPhone('');
      setAddress('');
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      showError('Shop name is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        ownerName: ownerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
      };

      if (initialData) {
        await api.put(`/shops/${initialData._id}`, payload);
        showSuccess('Shop updated successfully');
      } else {
        await api.post('/shops', payload);
        showSuccess('New Shop added successfully');
      }

      onShopSaved();
      onClose();
    } catch (err) {
      showError(err.message || 'Failed to save shop');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit Shop: ${initialData.name}` : 'Add New Retail Shop'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--c-text-muted)' }}>
            Shop / Store Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Apex Supermarket, Gupta Kirana Store"
            required
            className="w-full rounded-lg px-3.5 py-2 text-sm border focus:border-sky-500"
            style={{
              backgroundColor: 'var(--c-bg-input)',
              borderColor: 'var(--c-border)',
              color: 'var(--c-text-primary)',
            }}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--c-text-muted)' }}>
            Owner / Contact Person
          </label>
          <input
            type="text"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="e.g. Rajesh Gupta"
            className="w-full rounded-lg px-3.5 py-2 text-sm border focus:border-sky-500"
            style={{
              backgroundColor: 'var(--c-bg-input)',
              borderColor: 'var(--c-border)',
              color: 'var(--c-text-primary)',
            }}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--c-text-muted)' }}>
            Phone Number
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 9876543210"
            className="w-full rounded-lg px-3.5 py-2 text-sm border focus:border-sky-500"
            style={{
              backgroundColor: 'var(--c-bg-input)',
              borderColor: 'var(--c-border)',
              color: 'var(--c-text-primary)',
            }}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--c-text-muted)' }}>
            Address / Location
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. Shop #12, Main Market, Sector 15"
            rows="2"
            className="w-full rounded-lg px-3.5 py-2 text-sm border focus:border-sky-500"
            style={{
              backgroundColor: 'var(--c-bg-input)',
              borderColor: 'var(--c-border)',
              color: 'var(--c-text-primary)',
            }}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--c-border)' }}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg border transition-colors"
            style={{
              backgroundColor: 'var(--c-bg-elevated)',
              borderColor: 'var(--c-border)',
              color: 'var(--c-text-secondary)',
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-xs font-semibold rounded-lg text-white bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Saving...' : initialData ? 'Save Changes' : 'Add Shop'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
