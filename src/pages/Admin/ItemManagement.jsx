import React, { useState, useEffect } from 'react';
import { Badge } from '../../components/UI/Badge';
import { ItemModal } from '../../components/Items/ItemModal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';
import { Plus, Package, Edit, Trash2, Search, CheckCircle2, XCircle } from 'lucide-react';

export const ItemManagement = () => {
  const { showSuccess, showError } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await api.get('/items');
      setItems(data);
    } catch (err) {
      showError(err.message || 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleToggleActive = async (item) => {
    try {
      await api.put(`/items/${item._id}`, { active: !item.active });
      showSuccess(`Product '${item.itemName}' status updated`);
      fetchItems();
    } catch (err) {
      showError(err.message || 'Failed to update item');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete product '${item.itemName}'?`)) return;

    try {
      await api.delete(`/items/${item._id}`);
      showSuccess(`Product '${item.itemName}' deleted successfully`);
      fetchItems();
    } catch (err) {
      showError(err.message || 'Failed to delete item');
    }
  };

  const filteredItems = items.filter((i) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return i.itemName.toLowerCase().includes(s) || (i.sku && i.sku.toLowerCase().includes(s));
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Items Master Management</h1>
          <p className="text-sm text-slate-400">Manage products, SKUs, and master price catalog used across all orders</p>
        </div>

        <button
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-lg shadow-sky-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name or SKU..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2 text-sm text-white"
          />
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3 sm:px-4">Product Name</th>
                <th className="p-3 sm:px-4">SKU</th>
                <th className="p-3 sm:px-4 text-right">Master Price</th>
                <th className="p-3 sm:px-4 text-center">Catalog Status</th>
                <th className="p-3 sm:px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-400">
                    <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 sm:px-4 font-bold text-white flex items-center gap-2">
                      <Package className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>{item.itemName}</span>
                    </td>
                    <td className="p-3 sm:px-4 text-slate-400 font-mono">{item.sku || 'N/A'}</td>
                    <td className="p-3 sm:px-4 text-right font-extrabold text-sky-400">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="p-3 sm:px-4 text-center">
                      <Badge status={item.active ? 'Active' : 'Inactive'} />
                    </td>
                    <td className="p-3 sm:px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleActive(item)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            item.active
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                          title="Toggle Active Status"
                        >
                          {item.active ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-colors"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                          title="Delete Product"
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

      <ItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onItemSaved={fetchItems}
        initialData={editingItem}
      />
    </div>
  );
};
