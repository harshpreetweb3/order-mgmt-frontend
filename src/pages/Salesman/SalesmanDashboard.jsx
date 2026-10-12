import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { StatCard } from '../../components/UI/StatCard';
import { Badge } from '../../components/UI/Badge';
import { OrderFormModal } from '../../components/Orders/OrderFormModal';
import { OrderDetailModal } from '../../components/Orders/OrderDetailModal';
import { api } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import { ShoppingBag, Clock, CheckCircle2, Plus, Eye, Edit, Trash2, XCircle } from 'lucide-react';

export const SalesmanDashboard = () => {
  const location = useLocation();
  const { showSuccess, showError } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editOrder, setEditOrder] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.get('/dashboard/stats');
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (location.pathname === '/salesman/create-order') {
      setEditOrder(null);
      setIsFormOpen(true);
    }
  }, [location.pathname]);

  const handleCancel = async (id, orderNumber) => {
    if (!window.confirm(`Are you sure you want to cancel Order #${orderNumber}?`)) return;
    try {
      await api.put(`/orders/${id}/cancel`, {});
      showSuccess(`Order #${orderNumber} cancelled successfully`);
      fetchStats();
    } catch (err) {
      showError(err.message || 'Failed to cancel order');
    }
  };

  const handleDelete = async (id, orderNumber) => {
    if (!window.confirm(`Are you sure you want to delete Order #${orderNumber}?`)) return;
    try {
      await api.delete(`/orders/${id}`);
      showSuccess(`Order #${orderNumber} deleted successfully`);
      fetchStats();
    } catch (err) {
      showError(err.message || 'Failed to delete order');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Salesman Dashboard</h1>
          <p className="text-sm text-slate-400">Track and manage your retail shop orders</p>
        </div>

        <button
          onClick={() => {
            setEditOrder(null);
            setIsFormOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-lg shadow-sky-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Order</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Total Orders Created"
              value={stats?.totalOrders || 0}
              icon={ShoppingBag}
              color="indigo"
            />
            <StatCard
              title="Pending Orders"
              value={stats?.pendingOrders || 0}
              icon={Clock}
              color="amber"
              subtitle="Awaiting distributor delivery"
            />
            <StatCard
              title="Delivered Orders"
              value={stats?.deliveredOrders || 0}
              icon={CheckCircle2}
              color="emerald"
              subtitle="Completed and locked"
            />
          </div>

          {/* Recent Orders Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-white">Recent Orders</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3 sm:px-4">Order #</th>
                    <th className="p-3 sm:px-4">Shop Name</th>
                    <th className="p-3 sm:px-4">Distributor</th>
                    <th className="p-3 sm:px-4 text-right">Grand Total</th>
                    <th className="p-3 sm:px-4 text-center">Status</th>
                    <th className="p-3 sm:px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                  {stats?.recentOrders?.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-slate-500">
                        No recent orders found. Click 'Create New Order' to place your first order!
                      </td>
                    </tr>
                  ) : (
                    stats?.recentOrders?.map((ord) => (
                      <tr key={ord._id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3 sm:px-4 font-bold text-sky-400">{ord.orderNumber}</td>
                        <td className="p-3 sm:px-4 font-semibold text-white">{ord.orderFrom}</td>
                        <td className="p-3 sm:px-4 text-slate-300">{ord.orderTo?.name || 'Distributor'}</td>
                        <td className="p-3 sm:px-4 text-right font-bold text-slate-200">
                          {formatCurrency(ord.grandTotal)}
                        </td>
                        <td className="p-3 sm:px-4 text-center">
                          <Badge status={ord.status} cancelledByRole={ord.cancelledByRole} />
                        </td>
                        <td className="p-3 sm:px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
                              title="View Order Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {ord.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditOrder(ord);
                                    setIsFormOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-colors"
                                  title="Edit Order"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => handleCancel(ord._id, ord.orderNumber)}
                                  className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                                  title="Cancel Order"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}

                            {ord.status !== 'Delivered' && (
                              <button
                                onClick={() => handleDelete(ord._id, ord.orderNumber)}
                                className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                                title="Delete Order"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      <OrderFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditOrder(null);
        }}
        onOrderSaved={fetchStats}
        initialData={editOrder}
      />

      <OrderDetailModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onStatusChanged={fetchStats}
      />
    </div>
  );
};
