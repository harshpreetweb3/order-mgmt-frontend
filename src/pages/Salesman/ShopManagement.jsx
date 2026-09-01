import React, { useState, useEffect } from 'react';
import { ShopModal } from '../../components/Shops/ShopModal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Store, Plus, Edit, Trash2, Search, Phone, MapPin, User } from 'lucide-react';

export const ShopManagement = () => {
  const { showSuccess, showError } = useToast();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState(null);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const data = await api.get('/shops');
      setShops(data);
    } catch (err) {
      showError(err.message || 'Failed to fetch shops');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleDelete = async (id, shopName) => {
    if (!window.confirm(`Are you sure you want to delete shop "${shopName}"?`)) return;
    try {
      await api.delete(`/shops/${id}`);
      showSuccess('Shop deleted successfully');
      fetchShops();
    } catch (err) {
      showError(err.message || 'Failed to delete shop');
    }
  };

  const filteredShops = shops.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.ownerName && s.ownerName.toLowerCase().includes(search.toLowerCase())) ||
      (s.address && s.address.toLowerCase().includes(search.toLowerCase())) ||
      (s.phone && s.phone.includes(search))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--c-text-primary)' }}>
            Retail Shops Directory
          </h1>
          <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
            Manage retail shops and stores for order booking
          </p>
        </div>

        <button
          onClick={() => {
            setEditingShop(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Shop</span>
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
            placeholder="Search shops by name, owner, phone, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500/50"
            style={{
              backgroundColor: 'var(--c-bg-input)',
              borderColor: 'var(--c-border)',
              color: 'var(--c-text-primary)',
            }}
          />
        </div>
      </div>

      {/* Grid of Shops */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : filteredShops.length === 0 ? (
        <div
          className="p-8 rounded-2xl border text-center"
          style={{
            backgroundColor: 'var(--c-bg-surface)',
            borderColor: 'var(--c-border)',
            color: 'var(--c-text-muted)',
          }}
        >
          No shops found. Click "Add New Shop" to create your first retail shop!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShops.map((s) => (
            <div
              key={s._id}
              className="p-4 rounded-2xl border transition-all hover:shadow-lg flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--c-bg-surface)',
                borderColor: 'var(--c-border)',
              }}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-base" style={{ color: 'var(--c-text-primary)' }}>
                    <Store className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>{s.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingShop(s);
                        setIsModalOpen(true);
                      }}
                      className="p-1 rounded-lg border text-sky-400 bg-sky-500/10 border-sky-500/20 hover:bg-sky-500/20 transition-colors"
                      title="Edit Shop"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(s._id, s.name)}
                      className="p-1 rounded-lg border text-rose-400 bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20 transition-colors"
                      title="Delete Shop"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {s.ownerName && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--c-text-secondary)' }}>
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{s.ownerName}</span>
                  </div>
                )}

                {s.phone && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--c-text-secondary)' }}>
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{s.phone}</span>
                  </div>
                )}

                {s.address && (
                  <div className="flex items-start gap-2 text-xs" style={{ color: 'var(--c-text-muted)' }}>
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{s.address}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ShopModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingShop(null);
        }}
        onShopSaved={fetchShops}
        initialData={editingShop}
      />
    </div>
  );
};
