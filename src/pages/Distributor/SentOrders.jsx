import React, { useState, useEffect } from 'react';
import { OrderFilterBar } from '../../components/Orders/OrderFilterBar';
import { Badge } from '../../components/UI/Badge';
import { OrderFormModal } from '../../components/Orders/OrderFormModal';
import { OrderDetailModal } from '../../components/Orders/OrderDetailModal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Eye, Plus } from 'lucide-react';

export const SentOrders = () => {
  const { showError } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [date, setDate] = useState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Orders Sent to Super Stockist</h1>
          <p className="text-sm text-slate-400">Track bulk replenishment orders sent to Super Stockists</p>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-lg shadow-sky-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Order to SS</span>
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

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3 sm:px-4">Order #</th>
                <th className="p-3 sm:px-4">Date</th>
                <th className="p-3 sm:px-4">Store/Depot</th>
                <th className="p-3 sm:px-4">Super Stockist</th>
                <th className="p-3 sm:px-4 text-right">Grand Total</th>
                <th className="p-3 sm:px-4 text-center">Status</th>
                <th className="p-3 sm:px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-500">
                    No sent orders match your criteria.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 sm:px-4 font-bold text-sky-400">{ord.orderNumber}</td>
                    <td className="p-3 sm:px-4 text-slate-300">{formatDate(ord.createdAt)}</td>
                    <td className="p-3 sm:px-4 font-semibold text-white">{ord.orderFrom}</td>
                    <td className="p-3 sm:px-4 text-slate-300">{ord.orderTo?.name || 'Super Stockist'}</td>
                    <td className="p-3 sm:px-4 text-right font-bold text-slate-100">
                      {formatCurrency(ord.grandTotal)}
                    </td>
                    <td className="p-3 sm:px-4 text-center">
                      <Badge status={ord.status} />
                    </td>
                    <td className="p-3 sm:px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
                        title="View Details"
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
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
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
