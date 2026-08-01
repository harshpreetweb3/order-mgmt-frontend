import React, { useState, useEffect } from 'react';
import { StatCard } from '../../components/UI/StatCard';
import { Badge } from '../../components/UI/Badge';
import { OrderDetailModal } from '../../components/Orders/OrderDetailModal';
import { api } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Users,
  Store,
  Package,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Activity,
  Eye,
  UserCheck,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
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
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Admin System Dashboard</h1>
        <p className="text-sm text-slate-400">Complete control and real-time monitoring of all supply chain operations</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Stat Cards - 6 Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Total Salesmen"
              value={stats?.totalSalesmen || 0}
              icon={Users}
              color="emerald"
            />
            <StatCard
              title="Total Distributors"
              value={stats?.totalDistributors || 0}
              icon={Store}
              color="indigo"
            />
            <StatCard
              title="Total Super Stockists"
              value={stats?.totalSuperStockists || 0}
              icon={Package}
              color="sky"
            />
            <StatCard
              title="Total System Orders"
              value={stats?.totalOrders || 0}
              icon={ShoppingBag}
              color="purple"
            />
            <StatCard
              title="Pending Orders"
              value={stats?.pendingOrders || 0}
              icon={Clock}
              color="amber"
            />
            <StatCard
              title="Delivered Orders"
              value={stats?.deliveredOrders || 0}
              icon={CheckCircle2}
              color="emerald"
            />
          </div>

          {/* Activity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent System Orders Table (2 cols) */}
            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-400" />
                  <span>Recent Orders Activity</span>
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Order #</th>
                      <th className="p-3">Creator</th>
                      <th className="p-3 text-right">Grand Total</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                    {stats?.recentOrders?.map((ord) => (
                      <tr key={ord._id} className="hover:bg-slate-800/30">
                        <td className="p-3 font-bold text-sky-400">{ord.orderNumber}</td>
                        <td className="p-3 text-slate-200">{ord.createdBy?.name || 'User'} ({ord.createdByRole})</td>
                        <td className="p-3 text-right font-bold text-slate-100">{formatCurrency(ord.grandTotal)}</td>
                        <td className="p-3 text-center">
                          <Badge status={ord.status} />
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Registered Users (1 col) */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
              <h3 className="font-bold text-base text-white flex items-center gap-2 mb-4">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Recently Registered Users</span>
              </h3>

              <div className="space-y-3">
                {stats?.recentUsers?.map((usr) => (
                  <div
                    key={usr._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80"
                  >
                    <div>
                      <div className="text-sm font-bold text-white">{usr.name}</div>
                      <div className="text-xs text-slate-400">{usr.email}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 block mb-1">
                        {usr.role}
                      </span>
                      <Badge status={usr.status} />
                    </div>
                  </div>
                ))}
              </div>
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
