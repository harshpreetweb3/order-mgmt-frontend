import React, { useState, useEffect } from 'react';
import { StatCard } from '../../components/UI/StatCard';
import { Badge } from '../../components/UI/Badge';
import { OrderDetailModal } from '../../components/Orders/OrderDetailModal';
import { api } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Inbox, Clock, CheckCircle2, Eye, CheckCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const SuperStockistDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { showSuccess, showError } = useToast();

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

  const handleMarkDelivered = async (ord) => {
    try {
      await api.put(`/orders/${ord._id}/delivery`, { status: 'Delivered' });
      showSuccess(`Order #${ord.orderNumber} marked as Delivered!`);
      fetchStats();
    } catch (err) {
      showError(err.message || 'Failed to update order');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Super Stockist Dashboard</h1>
        <p className="text-sm text-slate-400">Process bulk supply orders from regional distributors</p>
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
              title="Orders Received"
              value={stats?.ordersReceivedCount || 0}
              icon={Inbox}
              color="sky"
              subtitle="From Distributors"
            />
            <StatCard
              title="Pending Fulfillment"
              value={stats?.pendingCount || 0}
              icon={Clock}
              color="amber"
            />
            <StatCard
              title="Delivered Orders"
              value={stats?.deliveredCount || 0}
              icon={CheckCircle2}
              color="emerald"
            />
          </div>

          {/* Recent Orders */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-white">Recent Distributor Orders</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3 sm:px-4">Order #</th>
                    <th className="p-3 sm:px-4">Depot / Store</th>
                    <th className="p-3 sm:px-4">Distributor Name</th>
                    <th className="p-3 sm:px-4 text-right">Grand Total</th>
                    <th className="p-3 sm:px-4 text-center">Status</th>
                    <th className="p-3 sm:px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                  {stats?.recentOrders?.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-slate-500">
                        No distributor orders received yet.
                      </td>
                    </tr>
                  ) : (
                    stats?.recentOrders?.map((ord) => (
                      <tr key={ord._id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3 sm:px-4 font-bold text-sky-400">{ord.orderNumber}</td>
                        <td className="p-3 sm:px-4 font-semibold text-white">{ord.orderFrom}</td>
                        <td className="p-3 sm:px-4 text-slate-300">{ord.createdBy?.name || 'Distributor'}</td>
                        <td className="p-3 sm:px-4 text-right font-bold text-slate-200">
                          {formatCurrency(ord.grandTotal)}
                        </td>
                        <td className="p-3 sm:px-4 text-center">
                          <Badge status={ord.status} />
                        </td>
                        <td className="p-3 sm:px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
                              title="Inspect Order"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {ord.status === 'Pending' && (
                              <button
                                onClick={() => handleMarkDelivered(ord)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-sm"
                                title="Mark Delivered"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Mark Delivered</span>
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

      <OrderDetailModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onStatusChanged={fetchStats}
      />
    </div>
  );
};
