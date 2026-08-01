import React, { useState, useEffect } from 'react';
import { Modal } from '../UI/Modal';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

export const ItemModal = ({ isOpen, onClose, onItemSaved, initialData = null }) => {
  const { showSuccess, showError } = useToast();

  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [sku, setSku] = useState('');
  const [active, setActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setItemName(initialData.itemName || '');
      setPrice(initialData.price || '');
      setSku(initialData.sku || '');
      setActive(initialData.active !== undefined ? initialData.active : true);
    } else {
      setItemName('');
      setPrice('');
      setSku('');
      setActive(true);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!itemName.trim() || price === '') {
      showError('Item name and price are required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        itemName,
        price: Number(price),
        sku,
        active,
      };

      if (initialData) {
        await api.put(`/items/${initialData._id}`, payload);
        showSuccess('Product item updated successfully');
      } else {
        await api.post('/items', payload);
        showSuccess('New product item created successfully');
      }

      onItemSaved();
      onClose();
    } catch (err) {
      showError(err.message || 'Failed to save item');
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
      title={initialData ? `Edit Product: ${initialData.itemName}` : 'Create New Product Item'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--c-text-muted)' }}>
            Item Name *
          </label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            required
            placeholder="e.g. Sunflower Cooking Oil 1L"
            className="w-full border rounded-xl px-3.5 py-2 text-sm focus:border-sky-500"
            style={inputStyle}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--c-text-muted)' }}>
            Price (₹) *
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            placeholder="e.g. 180"
            className="w-full border rounded-xl px-3.5 py-2 text-sm focus:border-sky-500"
            style={inputStyle}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--c-text-muted)' }}>
            SKU Code (Optional)
          </label>
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="e.g. SKU-OIL-100"
            className="w-full border rounded-xl px-3.5 py-2 text-sm focus:border-sky-500"
            style={inputStyle}
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="itemActive"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="w-4 h-4 rounded text-sky-500 focus:ring-0"
            style={{ backgroundColor: 'var(--c-bg-input)', borderColor: 'var(--c-border)' }}
          />
          <label htmlFor="itemActive" className="text-xs font-medium" style={{ color: 'var(--c-text-secondary)' }}>
            Active in Order Catalog (Available for selection)
          </label>
        </div>

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
            {submitting ? 'Saving...' : initialData ? 'Update Item' : 'Create Item'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
