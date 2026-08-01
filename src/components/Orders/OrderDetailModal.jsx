import React, { useState } from 'react';
import { Modal } from '../UI/Modal';
import { Badge } from '../UI/Badge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CheckCircle, Clock, Printer, Store, UserCheck, ShieldCheck } from 'lucide-react';

export const OrderDetailModal = ({ isOpen, onClose, order, onStatusChanged }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [updating, setUpdating] = useState(false);

  if (!order) return null;

  const canMarkDelivered =
    (user.role === 'Distributor' && order.status === 'Pending') ||
    (user.role === 'Super Stockist' && order.status === 'Pending') ||
    user.role === 'Admin';

  const handleToggleDelivery = async () => {
    setUpdating(true);
    try {
      const nextStatus = order.status === 'Pending' ? 'Delivered' : 'Pending';
      await api.put(`/orders/${order._id}/delivery`, { status: nextStatus });
      showSuccess(`Order status updated to ${nextStatus}`);
      if (onStatusChanged) onStatusChanged();
      onClose();
    } catch (err) {
      showError(err.message || 'Failed to update delivery status');
    } finally {
      setUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order Details - #${order.orderNumber}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Top Header Card */}
        <div
          className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border"
          style={{
            backgroundColor: 'var(--c-bg-elevated)',
            borderColor: 'var(--c-border)',
          }}
        >
          <div>
            <span className="text-xs font-semibold block mb-1" style={{ color: 'var(--c-text-muted)' }}>
              Status
            </span>
            <Badge status={order.status} />
          </div>

          <div>
            <span className="text-xs font-semibold block mb-1" style={{ color: 'var(--c-text-muted)' }}>
              Order Date
            </span>
            <span className="text-sm font-medium" style={{ color: 'var(--c-text-secondary)' }}>
              {formatDate(order.createdAt)}
            </span>
          </div>

          {order.deliveredAt && (
            <div>
              <span className="text-xs font-semibold block mb-1" style={{ color: 'var(--c-text-muted)' }}>
                Delivered At
              </span>
              <span className="text-sm font-medium text-emerald-500">
                {formatDate(order.deliveredAt)}
              </span>
            </div>
          )}
        </div>

        {/* Workflow Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            className="p-3.5 rounded-xl border"
            style={{
              backgroundColor: 'var(--c-bg-surface)',
              borderColor: 'var(--c-border)',
            }}
          >
            <div className="flex items-center gap-2 text-xs font-bold mb-1" style={{ color: 'var(--c-text-muted)' }}>
              <Store className="w-4 h-4 text-sky-400" />
              <span>Shop Name (Order From)</span>
            </div>
            <p className="text-sm font-bold" style={{ color: 'var(--c-text-primary)' }}>
              {order.orderFrom}
            </p>
          </div>

          <div
            className="p-3.5 rounded-xl border"
            style={{
              backgroundColor: 'var(--c-bg-surface)',
              borderColor: 'var(--c-border)',
            }}
          >
            <div className="flex items-center gap-2 text-xs font-bold mb-1" style={{ color: 'var(--c-text-muted)' }}>
              <UserCheck className="w-4 h-4 text-indigo-400" />
              <span>Order Creator</span>
            </div>
            <p className="text-sm font-bold" style={{ color: 'var(--c-text-primary)' }}>
              {order.createdBy?.name || 'Unknown'} ({order.createdByRole})
            </p>
          </div>

          {order.orderTo && (
            <div
              className="p-3.5 rounded-xl border sm:col-span-2"
              style={{
                backgroundColor: 'var(--c-bg-surface)',
                borderColor: 'var(--c-border)',
              }}
            >
              <div className="flex items-center gap-2 text-xs font-bold mb-1" style={{ color: 'var(--c-text-muted)' }}>
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Order Recipient (Order To)</span>
              </div>
              <p className="text-sm font-bold" style={{ color: 'var(--c-text-primary)' }}>
                {order.orderTo?.name || 'N/A'} ({order.orderTo?.role})
              </p>
            </div>
          )}
        </div>

        {/* Products Table */}
        <div>
          <h4 className="text-sm font-bold mb-3" style={{ color: 'var(--c-text-primary)' }}>
            Order Items ({order.products?.length || 0})
          </h4>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--c-border)' }}>
            <table className="w-full text-left text-xs">
              <thead style={{ backgroundColor: 'var(--c-bg-elevated)', color: 'var(--c-text-muted)' }}>
                <tr>
                  <th className="p-3">Item Name</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--c-border)' }}>
                {order.products?.map((prod, idx) => (
                  <tr key={idx} style={{ backgroundColor: 'var(--c-bg-surface)' }}>
                    <td className="p-3 font-semibold" style={{ color: 'var(--c-text-primary)' }}>
                      {prod.itemName}
                    </td>
                    <td className="p-3 text-center font-bold" style={{ color: 'var(--c-text-secondary)' }}>
                      {prod.quantity}
                    </td>
                    <td className="p-3 text-right" style={{ color: 'var(--c-text-secondary)' }}>
                      {formatCurrency(prod.price)}
                    </td>
                    <td className="p-3 text-right font-bold text-sky-400">
                      {formatCurrency(prod.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Grand Total */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-sky-950/20 border border-sky-500/30">
          <span className="text-base font-bold" style={{ color: 'var(--c-text-secondary)' }}>
            Grand Total
          </span>
          <span className="text-2xl font-extrabold text-sky-400">{formatCurrency(order.grandTotal)}</span>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors"
            style={{
              backgroundColor: 'var(--c-bg-elevated)',
              color: 'var(--c-text-secondary)',
            }}
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>

          <div className="flex items-center gap-3">
            {canMarkDelivered && (
              <button
                onClick={handleToggleDelivery}
                disabled={updating}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-lg ${
                  order.status === 'Pending'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                    : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
                }`}
              >
                {order.status === 'Pending' ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Mark as Delivered</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>Revert to Pending</span>
                  </>
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
              style={{
                backgroundColor: 'var(--c-bg-elevated)',
                color: 'var(--c-text-secondary)',
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
