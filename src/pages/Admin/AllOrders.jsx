import React, { useState, useEffect } from 'react';
import { OrderFilterBar } from '../../components/Orders/OrderFilterBar';
import { Badge } from '../../components/UI/Badge';
import { OrderDetailModal } from '../../components/Orders/OrderDetailModal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Eye, CheckCircle, Clock } from 'lucide-react';

export const AllOrders = () => {
  const { showSuccess, showError } = useToast();
  const [orders, setOrders] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [superStockists, setSuperStockists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [date, setDate] = useState('');
  const [distributor, setDistributor] = useState('');
  const [superStockist, setSuperStockist] = useState('');

  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const dList = await api.get('/users?role=Distributor');
        const ssList = await api.get('/users?role=Super Stockist');
        setDistributors(dList);
        setSuperStockists(ssList);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDropdowns();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.get('/orders', {
        search,
        status,
        date,
        distributor,
        superStockist,
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
  }, [search, status, date, distributor, superStockist]);

  const handleAdminToggleStatus = async (ord) => {
    const nextStatus = ord.status === 'Pending' ? 'Delivered' : 'Pending';
    try {
      await api.put(`/orders/${ord._id}/delivery`, { status: nextStatus });
      showSuccess(`Order #${ord.orderNumber} status overridden to ${nextStatus}`);
      fetchOrders();
    } catch (err) {
      showError(err.message || 'Failed to override status');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--c-text-primary)' }}>
          Company System Orders
        </h1>
        <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
          View, manage, and override delivery status across Salesman, Distributor, Super Stockist, ASM, and ASE orders
        </p>
      </div>

      <OrderFilterBar
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        date={date}
        setDate={setDate}
        distributor={distributor}
        setDistributor={setDistributor}
        distributorsList={distributors}
        superStockist={superStockist}
        setSuperStockist={setSuperStockist}
        superStockistsList={superStockists}
        onReset={() => {
          setSearch('');
          setStatus('All');
          setDate('');
          setDistributor('');
          setSuperStockist('');
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
                <th className="p-3 sm:px-4">Order Source (Shop / Creator)</th>
                <th className="p-3 sm:px-4">Order Recipient</th>
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
                    No orders match search criteria.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id} className="transition-colors hover:bg-slate-800/20">
                    <td className="p-3 sm:px-4 font-bold text-sky-400">{ord.orderNumber}</td>
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
                      {ord.orderTo?.role === 'Admin' || !ord.orderTo ? 'RGDG Agro India (Company)' : `${ord.orderTo.name} (${ord.orderTo.role})`}
                    </td>
                    <td className="p-3 sm:px-4 text-right font-bold" style={{ color: 'var(--c-text-primary)' }}>
                      {formatCurrency(ord.grandTotal)}
                    </td>
                    <td className="p-3 sm:px-4 text-center">
                      <Badge status={ord.status} />
                    </td>
                    <td className="p-3 sm:px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleAdminToggleStatus(ord)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            ord.status === 'Pending'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                          }`}
                          title={`Override to ${ord.status === 'Pending' ? 'Delivered' : 'Pending'}`}
                        >
                          {ord.status === 'Pending' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </button>

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

      <OrderDetailModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onStatusChanged={fetchOrders}
      />
    </div>
  );
};
