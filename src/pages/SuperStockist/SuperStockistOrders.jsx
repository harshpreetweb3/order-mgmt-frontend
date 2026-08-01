import React, { useState, useEffect } from 'react';
import { OrderFilterBar } from '../../components/Orders/OrderFilterBar';
import { Badge } from '../../components/UI/Badge';
import { OrderDetailModal } from '../../components/Orders/OrderDetailModal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Eye, CheckCircle } from 'lucide-react';

export const SuperStockistOrders = () => {
  const { showSuccess, showError } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [date, setDate] = useState('');

  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.get('/orders', {
        search,
        status,
        date,
      });
      setOrders(data);
    } catch (err) {
      showError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search, status, date]);

  const handleMarkDelivered = async (ord) => {
    try {
      await api.put(`/orders/${ord._id}/delivery`, { status: 'Delivered' });
      showSuccess(`Order #${ord.orderNumber} marked as Delivered!`);
      fetchOrders();
    } catch (err) {
      showError(err.message || 'Failed to update order');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Orders Received</h1>
        <p className="text-sm text-slate-400">View orders placed by distributors and process delivery status</p>
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
                <th className="p-3 sm:px-4">Depot / Store</th>
                <th className="p-3 sm:px-4">Distributor</th>
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
                    No distributor orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 sm:px-4 font-bold text-sky-400">{ord.orderNumber}</td>
                    <td className="p-3 sm:px-4 text-slate-300">{formatDate(ord.createdAt)}</td>
                    <td className="p-3 sm:px-4 font-semibold text-white">{ord.orderFrom}</td>
                    <td className="p-3 sm:px-4 text-slate-300">{ord.createdBy?.name || 'Distributor'}</td>
                    <td className="p-3 sm:px-4 text-right font-bold text-slate-100">
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
                          title="View Details"
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

      <OrderDetailModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onStatusChanged={fetchOrders}
      />
    </div>
  );
};
