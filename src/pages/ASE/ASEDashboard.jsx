import React, { useState, useEffect } from 'react';
import { StatCard } from '../../components/UI/StatCard';
import { Badge } from '../../components/UI/Badge';
import { OrderFormModal } from '../../components/Orders/OrderFormModal';
import { OrderDetailModal } from '../../components/Orders/OrderDetailModal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Plus, Eye, ShoppingBag, Clock, CheckCircle, Send, Edit, Trash2 } from 'lucide-react';

export const ASEDashboard = () => {
  const { showSuccess, showError } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.get('/orders');
      setOrders(data);
    } catch (err) {
      showError(err.message || 'Failed to fetch ASE orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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
    setIsOrderFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsOrderFormOpen(false);
    setEditingOrder(null);
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;
  const totalVolume = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--c-text-primary)' }}>
            ASE Panel (Area Sales Executive)
          </h1>
          <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
            Create replenishment orders to RGDG Agro India (Company) on behalf of Super Stockist & view downline orders
          </p>
        </div>

        <button
          onClick={() => {
            setEditingOrder(null);
            setIsOrderFormOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 shadow-lg shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Order to RGDG Agro (Company)</span>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Regional Orders" value={totalOrders} icon={ShoppingBag} color="sky" />
        <StatCard title="Pending Fulfillment" value={pendingOrders} icon={Clock} color="amber" />
        <StatCard title="Delivered Orders" value={deliveredOrders} icon={CheckCircle} color="emerald" />
        <StatCard title="Total Volume" value={formatCurrency(totalVolume)} icon={Send} color="indigo" />
      </div>

      {/* Orders Table */}
      <div
        className="rounded-2xl overflow-hidden shadow-xl border"
        style={{
          backgroundColor: 'var(--c-bg-surface)',
          borderColor: 'var(--c-border)',
        }}
      >
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--c-border)' }}>
          <h3 className="font-bold text-base" style={{ color: 'var(--c-text-primary)' }}>
            ASE Regional Orders
          </h3>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {orders.length} Total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead style={{ backgroundColor: 'var(--c-bg-elevated)', color: 'var(--c-text-muted)' }}>
              <tr>
                <th className="p-3 sm:px-4">Order #</th>
                <th className="p-3 sm:px-4">Date</th>
                <th className="p-3 sm:px-4">Order Source (Shop / Creator)</th>
                <th className="p-3 sm:px-4">Recipient</th>
                <th className="p-3 sm:px-4 text-right">Grand Total</th>
                <th className="p-3 sm:px-4 text-center">Status</th>
                <th className="p-3 sm:px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--c-border)' }}>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12" style={{ color: 'var(--c-text-muted)' }}>
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id} className="transition-colors hover:bg-slate-800/20">
                    <td className="p-3 sm:px-4 font-bold text-amber-400">{ord.orderNumber}</td>
                    <td className="p-3 sm:px-4" style={{ color: 'var(--c-text-secondary)' }}>
                      {formatDate(ord.createdAt)}
                    </td>
                    <td className="p-3 sm:px-4">
                      <div className="font-bold" style={{ color: 'var(--c-text-primary)' }}>
                        {ord.orderFrom}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
                        by {ord.createdBy?.name || 'User'} ({ord.createdByRole})
                      </div>
                    </td>
                    <td className="p-3 sm:px-4 font-semibold" style={{ color: 'var(--c-text-primary)' }}>
                      {ord.orderTo?.name ? `${ord.orderTo.name} (${ord.orderTo.role})` : 'RGDG Agro India (Company)'}
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
                          title="View Order Details"
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
        isOpen={isOrderFormOpen}
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
