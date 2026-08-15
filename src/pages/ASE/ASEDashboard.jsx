import React, { useState, useEffect } from 'react';
import { StatCard } from '../../components/UI/StatCard';
import { Badge } from '../../components/UI/Badge';
import { OrderFormModal } from '../../components/Orders/OrderFormModal';
import { OrderDetailModal } from '../../components/Orders/OrderDetailModal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Plus, Eye, ShoppingBag, Clock, CheckCircle, Send } from 'lucide-react';

export const ASEDashboard = () => {
  const { showError } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

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
          onClick={() => setIsOrderFormOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 shadow-lg shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Order to RGDG Agro (Company)</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Region Orders" value={totalOrders} icon={ShoppingBag} color="sky" />
        <StatCard title="Pending Delivery" value={pendingOrders} icon={Clock} color="amber" />
        <StatCard title="Delivered Orders" value={deliveredOrders} icon={CheckCircle} color="emerald" />
        <StatCard title="Total Region Volume" value={formatCurrency(totalVolume)} icon={Send} color="indigo" />
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
          <h3 className="font-bold text-sm" style={{ color: 'var(--c-text-primary)' }}>
            Super Stockist & Regional Orders
          </h3>
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
                <th className="p-3 sm:px-4 text-right">Action</th>
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
                    No regional orders found.
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
        onClose={() => setIsOrderFormOpen(false)}
        onOrderSaved={fetchOrders}
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
