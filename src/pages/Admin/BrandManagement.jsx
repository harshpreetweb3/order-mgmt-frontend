import React, { useState, useEffect } from 'react';
import { BrandModal } from '../../components/Brands/BrandModal';
import { Badge } from '../../components/UI/Badge';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Tag, Plus, Edit, Trash2, Search } from 'lucide-react';

export const BrandManagement = () => {
  const { showSuccess, showError } = useToast();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const data = await api.get('/brands');
      setBrands(data);
    } catch (err) {
      showError(err.message || 'Failed to fetch brands');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleDelete = async (id, brandName) => {
    if (!window.confirm(`Are you sure you want to delete brand "${brandName}"?`)) return;
    try {
      await api.delete(`/brands/${id}`);
      showSuccess('Brand deleted successfully');
      fetchBrands();
    } catch (err) {
      showError(err.message || 'Failed to delete brand');
    }
  };

  const filteredBrands = brands.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.description && b.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--c-text-primary)' }}>
            Company Brands Master
          </h1>
          <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
            Create and manage product brands for KNK Enterprises & assign to Super Stockists
          </p>
        </div>

        <button
          onClick={() => {
            setEditingBrand(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Brand</span>
        </button>
      </div>

      {/* Search Bar */}
      <div
        className="p-4 rounded-2xl border shadow-sm flex items-center gap-4"
        style={{
          backgroundColor: 'var(--c-bg-surface)',
          borderColor: 'var(--c-border)',
        }}
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--c-text-muted)' }} />
          <input
            type="text"
            placeholder="Search brands by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border outline-none focus:ring-2 focus:ring-sky-500/50"
            style={{
              backgroundColor: 'var(--c-bg-input)',
              borderColor: 'var(--c-border)',
              color: 'var(--c-text-primary)',
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden shadow-xl border"
        style={{
          backgroundColor: 'var(--c-bg-surface)',
          borderColor: 'var(--c-border)',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead style={{ backgroundColor: 'var(--c-bg-elevated)', color: 'var(--c-text-muted)' }}>
              <tr>
                <th className="p-3 sm:px-4">Brand Name</th>
                <th className="p-3 sm:px-4">Description</th>
                <th className="p-3 sm:px-4 text-center">Status</th>
                <th className="p-3 sm:px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--c-border)' }}>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-12">
                    <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-12" style={{ color: 'var(--c-text-muted)' }}>
                    No brands found. Click "Add New Brand" to create one.
                  </td>
                </tr>
              ) : (
                filteredBrands.map((b) => (
                  <tr key={b._id} className="transition-colors hover:bg-slate-800/20">
                    <td className="p-3 sm:px-4 font-bold" style={{ color: 'var(--c-text-primary)' }}>
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-sky-400 shrink-0" />
                        <span>{b.name}</span>
                      </div>
                    </td>
                    <td className="p-3 sm:px-4" style={{ color: 'var(--c-text-secondary)' }}>
                      {b.description || '-'}
                    </td>
                    <td className="p-3 sm:px-4 text-center">
                      <Badge status={b.active ? 'Active' : 'Inactive'} />
                    </td>
                    <td className="p-3 sm:px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingBrand(b);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg border text-sky-400 bg-sky-500/10 border-sky-500/20 hover:bg-sky-500/20 transition-colors"
                          title="Edit Brand"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(b._id, b.name)}
                          className="p-1.5 rounded-lg border text-rose-400 bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20 transition-colors"
                          title="Delete Brand"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BrandModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBrand(null);
        }}
        onBrandSaved={fetchBrands}
        initialData={editingBrand}
      />
    </div>
  );
};
