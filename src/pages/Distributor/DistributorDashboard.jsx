import React, { useState, useEffect } from 'react';
import { StatCard } from '../../components/UI/StatCard';
import { Badge } from '../../components/UI/Badge';
import { OrderFormModal } from '../../components/Orders/OrderFormModal';
import { OrderDetailModal } from '../../components/Orders/OrderDetailModal';
import { UserModal } from '../../components/Users/UserModal';
import { api } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Inbox, Send, Clock, CheckCircle2, Plus, Users, Eye } from 'lucide-react';

export const DistributorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Distributor Dashboard</h1>
          <p className="text-sm text-slate-400">Manage salesmen orders & supply chain to Super Stockists</p>
        </div>

        <div>
          <button
            onClick={() => setIsOrderFormOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-lg shadow-sky-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Order to Super Stockist</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Orders Received"
              value={stats?.ordersReceivedCount || 0}
              icon={Inbox}
              color="indigo"
              subtitle="From Salesmen"
            />
            <StatCard
              title="Orders Sent to SS"
              value={stats?.ordersSentCount || 0}
              icon={Send}
              color="sky"
              subtitle="To Super Stockists"
            />
            <StatCard
              title="Pending Orders"
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

          {/* Recent Received Orders Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-white">Recent Orders Received from Salesmen</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3 sm:px-4">Order #</th>
                    <th className="p-3 sm:px-4">Shop Name</th>
                    <th className="p-3 sm:px-4">Salesman</th>
                    <th className="p-3 sm:px-4 text-right">Grand Total</th>
                    <th className="p-3 sm:px-4 text-center">Status</th>
                    <th className="p-3 sm:px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                  {stats?.recentReceivedOrders?.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-slate-500">
                        No received orders yet.
                      </td>
                    </tr>
                  ) : (
                    stats?.recentReceivedOrders?.map((ord) => (
                      <tr key={ord._id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3 sm:px-4 font-bold text-sky-400">{ord.orderNumber}</td>
                        <td className="p-3 sm:px-4 font-semibold text-white">{ord.orderFrom}</td>
                        <td className="p-3 sm:px-4 text-slate-300">{ord.createdBy?.name || 'Salesman'}</td>
                        <td className="p-3 sm:px-4 text-right font-bold text-slate-200">
                          {formatCurrency(ord.grandTotal)}
                        </td>
                        <td className="p-3 sm:px-4 text-center">
                          <Badge status={ord.status} />
                        </td>
                        <td className="p-3 sm:px-4 text-right">
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
                            title="Inspect & Delivery Action"
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
        </>
      )}

      {/* Modals */}
      <OrderFormModal
        isOpen={isOrderFormOpen}
        onClose={() => setIsOrderFormOpen(false)}
        onOrderSaved={fetchStats}
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
