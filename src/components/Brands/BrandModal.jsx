import React, { useState, useEffect } from 'react';
import { Modal } from '../UI/Modal';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

export const BrandModal = ({ isOpen, onClose, onBrandSaved, initialData = null }) => {
  const { showSuccess, showError } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [allowSalesmanPriceEdit, setAllowSalesmanPriceEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setActive(initialData.active !== undefined ? initialData.active : true);
      setAllowSalesmanPriceEdit(Boolean(initialData.allowSalesmanPriceEdit));
    } else {
      setName('');
      setDescription('');
      setActive(true);
      setAllowSalesmanPriceEdit(false);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      showError('Brand name is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        active,
        allowSalesmanPriceEdit,
      };

      if (initialData) {
        await api.put(`/brands/${initialData._id}`, payload);
        showSuccess('Brand updated successfully');
      } else {
        await api.post('/brands', payload);
        showSuccess('New Brand created successfully');
      }

      onBrandSaved();
      onClose();
    } catch (err) {
      showError(err.message || 'Failed to save brand');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit Brand: ${initialData.name}` : 'Add New Brand'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--c-text-muted)' }}>
            Brand Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. KNK Spices, KNK Grains"
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
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief details about brand product line..."
            rows="3"
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
            Status
          </label>
          <select
            value={active ? 'Active' : 'Inactive'}
            onChange={(e) => setActive(e.target.value === 'Active')}
            className="w-full rounded-lg px-3 py-2 text-sm border focus:border-sky-500"
            style={{
              backgroundColor: 'var(--c-bg-input)',
              borderColor: 'var(--c-border)',
              color: 'var(--c-text-primary)',
            }}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Feature Option: Salesman Price Editable for this Brand */}
        <div
          className="p-3.5 rounded-xl border flex items-start justify-between gap-3 transition-colors"
          style={{
            backgroundColor: allowSalesmanPriceEdit ? 'rgba(16, 185, 129, 0.08)' : 'var(--c-bg-elevated)',
            borderColor: allowSalesmanPriceEdit ? 'rgba(16, 185, 129, 0.3)' : 'var(--c-border)',
          }}
        >
          <div className="space-y-1">
            <label
              htmlFor="allowSalesmanPriceEdit"
              className="text-xs font-bold block cursor-pointer"
              style={{ color: allowSalesmanPriceEdit ? '#34d399' : 'var(--c-text-primary)' }}
            >
              Allow Salesman Price Edit
            </label>
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>
              When enabled, salesmen creating orders for retail shops can edit unit prices for products under this brand (useful when prices vary by shop).
            </p>
          </div>
          <input
            id="allowSalesmanPriceEdit"
            type="checkbox"
            checked={allowSalesmanPriceEdit}
            onChange={(e) => setAllowSalesmanPriceEdit(e.target.checked)}
            className="w-5 h-5 rounded text-emerald-500 cursor-pointer mt-0.5 shrink-0 focus:ring-emerald-500/30"
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
            className="px-5 py-2 text-xs font-semibold rounded-lg text-white bg-sky-500 hover:bg-sky-400 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Saving...' : initialData ? 'Save Changes' : 'Create Brand'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
