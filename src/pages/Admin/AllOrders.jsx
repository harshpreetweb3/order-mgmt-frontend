import React, { useState, useEffect } from 'react';
import { OrderFilterBar } from '../../components/Orders/OrderFilterBar';
import { Badge } from '../../components/UI/Badge';
import { OrderDetailModal } from '../../components/Orders/OrderDetailModal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Eye, Power, CheckCircle, Clock } from 'lucide-react';

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
        <h1 className="text-2xl font-extrabold text-white tracking-tight">System Order Management</h1>
        <p className="text-sm text-slate-400">View and override delivery status for Salesman, Distributor, and Super Stockist orders</p>
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

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3 sm:px-4">Order #</th>
                <th className="p-3 sm:px-4">Date</th>
                <th className="p-3 sm:px-4">Shop / Depot</th>
                <th className="p-3 sm:px-4">Creator Role</th>
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
                    No orders match search criteria.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 sm:px-4 font-bold text-sky-400">{ord.orderNumber}</td>
                    <td className="p-3 sm:px-4 text-slate-300">{formatDate(ord.createdAt)}</td>
                    <td className="p-3 sm:px-4 font-semibold text-white">{ord.orderFrom}</td>
                    <td className="p-3 sm:px-4 text-slate-300">
                      {ord.createdBy?.name || 'User'} ({ord.createdByRole})
                    </td>
                    <td className="p-3 sm:px-4 text-right font-bold text-slate-100">
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
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
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
