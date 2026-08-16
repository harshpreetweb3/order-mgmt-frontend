import React, { useState, useEffect } from 'react';
import { OrderFilterBar } from '../../components/Orders/OrderFilterBar';
import { Badge } from '../../components/UI/Badge';
import { OrderFormModal } from '../../components/Orders/OrderFormModal';
import { OrderDetailModal } from '../../components/Orders/OrderDetailModal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Eye, Plus, Edit, Trash2 } from 'lucide-react';

export const SentOrders = () => {
  const { showSuccess, showError } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [date, setDate] = useState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.get('/orders', {
        scope: 'sent',
        search,
        status,
        date,
      });
      setOrders(data);
    } catch (err) {
      showError(err.message || 'Failed to fetch sent orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search, status, date]);

  const handleDelete = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this pending order?')) return;
    try {
      await api.delete(`/orders/${orderId}`);
      showSuccess('Order deleted successfully');
      fetchOrders();
    } catch (err) {
      showError(err.message || 'Failed to delete order');
    }
  };

  const handleEdit = (ord) => {
    setEditingOrder(ord);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingOrder(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--c-text-primary)' }}>
            Orders Sent to Super Stockist / Company
          </h1>
          <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
            Track, edit, or cancel pending replenishment orders
          </p>
        </div>

        <button
          onClick={() => {
            setEditingOrder(null);
            setIsFormOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-lg shadow-sky-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Order</span>
        </button>
      </div>

      <OrderFilterBar
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        date={date}
        setDate={setDate}
        onReset={() => {
          setSearch('');
          setStatus('All');
          setDate('');
        }}
      />

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
                <th className="p-3 sm:px-4">Order #</th>
                <th className="p-3 sm:px-4">Date</th>
                <th className="p-3 sm:px-4">Store/Depot</th>
                <th className="p-3 sm:px-4">Recipient (Order To)</th>
                <th className="p-3 sm:px-4 text-right">Grand Total</th>
                <th className="p-3 sm:px-4 text-center">Status</th>
                <th className="p-3 sm:px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--c-border)' }}>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12" style={{ color: 'var(--c-text-muted)' }}>
                    No sent orders match your criteria.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id} className="transition-colors hover:bg-slate-800/20">
                    <td className="p-3 sm:px-4 font-bold text-sky-400">{ord.orderNumber}</td>
                    <td className="p-3 sm:px-4" style={{ color: 'var(--c-text-secondary)' }}>
                      {formatDate(ord.createdAt)}
                    </td>
                    <td className="p-3 sm:px-4 font-semibold" style={{ color: 'var(--c-text-primary)' }}>
                      {ord.orderFrom}
                    </td>
                    <td className="p-3 sm:px-4" style={{ color: 'var(--c-text-secondary)' }}>
                      {ord.orderTo?.name || 'Super Stockist'}
                    </td>
                    <td className="p-3 sm:px-4 text-right font-bold" style={{ color: 'var(--c-text-primary)' }}>
                      {formatCurrency(ord.grandTotal)}
                    </td>
                    <td className="p-3 sm:px-4 text-center">
                      <Badge status={ord.status} />
                    </td>
                    <td className="p-3 sm:px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {ord.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleEdit(ord)}
                              className="p-1.5 rounded-lg border text-amber-400 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                              title="Edit Order"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(ord._id)}
                              className="p-1.5 rounded-lg border text-rose-400 bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20 transition-colors"
                              title="Delete Order"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{
                            backgroundColor: 'var(--c-bg-elevated)',
                            color: 'var(--c-text-secondary)',
                          }}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
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

      <OrderFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onOrderSaved={fetchOrders}
        initialData={editingOrder}
      />

      <OrderDetailModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onStatusChanged={fetchOrders}
      />
    </div>
  );
};
