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
        scope: 'received',
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
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--c-text-primary)' }}>
          Orders Received
        </h1>
        <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
          View orders placed by distributors and process delivery fulfillment
        </p>
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
                <th className="p-3 sm:px-4">Distributor Name</th>
                <th className="p-3 sm:px-4 text-right">Grand Total</th>
                <th className="p-3 sm:px-4 text-center">Status</th>
                <th className="p-3 sm:px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--c-border)' }}>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12" style={{ color: 'var(--c-text-muted)' }}>
                    No distributor orders received matching your filter criteria.
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
                      {ord.createdBy?.name || 'Distributor'}
                    </td>
                    <td className="p-3 sm:px-4 text-right font-bold" style={{ color: 'var(--c-text-primary)' }}>
                      {formatCurrency(ord.grandTotal)}
                    </td>
                    <td className="p-3 sm:px-4 text-center">
                      <Badge status={ord.status} cancelledByRole={ord.cancelledByRole} />
                    </td>
                    <td className="p-3 sm:px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
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
