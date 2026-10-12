import React, { useState, useEffect } from 'react';
import { Modal } from '../UI/Modal';
import { Badge } from '../UI/Badge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CheckCircle, Clock, Printer, Store, UserCheck, ShieldCheck, Trash2, Edit3, XCircle, Ban } from 'lucide-react';

export const OrderDetailModal = ({ isOpen, onClose, order, onStatusChanged }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [updating, setUpdating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [editableProducts, setEditableProducts] = useState([]);

  useEffect(() => {
    setShowCancelConfirm(false);
    setCancelReason('');
    if (order && order.products) {
      setEditableProducts(
        order.products.map((p) => ({
          itemId: p.itemId?._id || p.itemId,
          itemName: p.itemName,
          quantity: p.quantity,
          price: p.price,
          total: p.total,
        }))
      );
    }
  }, [order, isOpen]);

  if (!order) return null;

  const isRecipient =
    order.orderTo?._id === user._id || order.orderTo === user._id;

  const isCreator =
    (order.createdBy?._id && order.createdBy._id === user._id) ||
    order.createdBy === user._id;

  const isAdmin = user.role === 'Admin';

  const canCancel = (isAdmin || isCreator) && order.status === 'Pending';
  const canDelete = (isAdmin || isCreator) && order.status !== 'Delivered';

  const canMarkDelivered =
    (user.role === 'Admin' && order.status === 'Pending') ||
    (isRecipient && (user.role === 'Distributor' || user.role === 'Super Stockist') && order.status === 'Pending');

  const handleQtyChange = (idx, val) => {
    const qty = Math.max(1, parseInt(val) || 1);
    setEditableProducts((prev) => {
      const copy = [...prev];
      const price = copy[idx].price;
      copy[idx] = {
        ...copy[idx],
        quantity: qty,
        total: Math.round(qty * price * 100) / 100,
      };
      return copy;
    });
  };

  const handleRemoveProduct = (idx) => {
    if (editableProducts.length <= 1) {
      showError('An order must contain at least 1 product.');
      return;
    }
    setEditableProducts((prev) => prev.filter((_, i) => i !== idx));
  };

  const currentGrandTotal = editableProducts.reduce(
    (sum, p) => sum + (p.quantity * p.price),
    0
  );

  const handleToggleDelivery = async () => {
    setUpdating(true);
    try {
      const nextStatus = order.status === 'Pending' ? 'Delivered' : 'Pending';
      const payload = { status: nextStatus };

      // If pending order is being marked delivered by recipient, include modified products list
      if (order.status === 'Pending' && canMarkDelivered) {
        payload.products = editableProducts;
      }

      await api.put(`/orders/${order._id}/delivery`, payload);
      showSuccess(`Order #${order.orderNumber} marked as ${nextStatus}!`);
      if (onStatusChanged) onStatusChanged();
      onClose();
    } catch (err) {
      showError(err.message || 'Failed to update delivery status');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      await api.put(`/orders/${order._id}/cancel`, {
        reason: cancelReason,
      });
      showSuccess(
        isAdmin
          ? `Order #${order.orderNumber} cancelled by admin.`
          : `Order #${order.orderNumber} cancelled successfully.`
      );
      if (onStatusChanged) onStatusChanged();
      setShowCancelConfirm(false);
      onClose();
    } catch (err) {
      showError(err.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete Order #${order.orderNumber}?`)) return;
    try {
      await api.delete(`/orders/${order._id}`);
      showSuccess(`Order #${order.orderNumber} deleted successfully`);
      if (onStatusChanged) onStatusChanged();
      onClose();
    } catch (err) {
      showError(err.message || 'Failed to delete order');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const inputStyle = {
    backgroundColor: 'var(--c-bg-input)',
    borderColor: 'var(--c-border)',
    color: 'var(--c-text-primary)',
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
            <Badge status={order.status} cancelledByRole={order.cancelledByRole} />
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

          {order.cancelledAt && (
            <div>
              <span className="text-xs font-semibold block mb-1" style={{ color: 'var(--c-text-muted)' }}>
                Cancelled At
              </span>
              <span className="text-sm font-medium text-rose-400">
                {formatDate(order.cancelledAt)}
              </span>
            </div>
          )}
        </div>

        {/* Cancelled Alert Box */}
        {order.status === 'Cancelled' && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400">
            <XCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-rose-300">
                {order.cancelledByRole === 'Admin' ? 'Cancelled by an admin' : 'Order Cancelled'}
              </p>
              <p className="text-xs text-rose-400/90">
                {order.cancelledByRole === 'Admin'
                  ? `This order was cancelled by an Administrator${order.cancelledBy?.name ? ` (${order.cancelledBy.name})` : ''}.`
                  : `This order was cancelled by its creator${order.cancelledBy?.name ? ` (${order.cancelledBy.name})` : ''}.`}
                {order.cancelledAt && ` on ${formatDate(order.cancelledAt)}`}
              </p>
              {order.cancellationReason && (
                <p className="text-xs text-slate-300 pt-1">
                  <span className="font-semibold text-rose-300">Reason:</span> {order.cancellationReason}
                </p>
              )}
            </div>
          </div>
        )}

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
              <span>
                {order.createdByRole === 'ASM'
                  ? 'Ordering Entity (Distributor)'
                  : order.createdByRole === 'ASE'
                  ? 'Ordering Entity (Super Stockist)'
                  : 'Shop Name (Order From)'}
              </span>
            </div>
            <p className="text-sm font-bold" style={{ color: 'var(--c-text-primary)' }}>
              {order.createdByRole === 'ASM' && order.distributor?.name
                ? order.distributor.name
                : order.createdByRole === 'ASE' && order.superStockist?.name
                ? order.superStockist.name
                : order.orderFrom}
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
              {order.createdBy?.name || 'User'} ({order.createdByRole || order.createdBy?.role || 'User'})
            </p>
          </div>

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
              {order.orderTo?.role === 'Admin' || !order.orderTo?.name
                ? 'KNK Enterprises (Company)'
                : `${order.orderTo.name}${order.orderTo.role ? ` (${order.orderTo.role})` : ''}`}
            </p>
          </div>
        </div>

        {/* Fulfillment Notice if editable */}
        {canMarkDelivered && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs">
            <Edit3 className="w-4 h-4 shrink-0" />
            <span>
              <strong>Fulfillment Edit Mode:</strong> You can adjust product quantities or remove unavailable items before marking this order as delivered.
            </span>
          </div>
        )}

        {/* Products Table */}
        <div>
          <h4 className="text-sm font-bold mb-3" style={{ color: 'var(--c-text-primary)' }}>
            Order Items ({editableProducts.length})
          </h4>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--c-border)' }}>
            <table className="w-full text-left text-xs">
              <thead style={{ backgroundColor: 'var(--c-bg-elevated)', color: 'var(--c-text-muted)' }}>
                <tr>
                  <th className="p-3">Item Name</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Total</th>
                  {canMarkDelivered && <th className="p-3 text-center">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--c-border)' }}>
                {editableProducts.map((prod, idx) => (
                  <tr key={idx} style={{ backgroundColor: 'var(--c-bg-surface)' }}>
                    <td className="p-3 font-semibold" style={{ color: 'var(--c-text-primary)' }}>
                      {prod.itemName}
                    </td>
                    <td className="p-3 text-center">
                      {canMarkDelivered ? (
                        <input
                          type="number"
                          min="1"
                          value={prod.quantity}
                          onChange={(e) => handleQtyChange(idx, e.target.value)}
                          className="w-16 px-2 py-1 text-center font-bold border rounded-lg focus:border-sky-500 focus:outline-none"
                          style={inputStyle}
                        />
                      ) : (
                        <span className="font-bold" style={{ color: 'var(--c-text-secondary)' }}>
                          {prod.quantity}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right" style={{ color: 'var(--c-text-secondary)' }}>
                      {formatCurrency(prod.price)}
                    </td>
                    <td className="p-3 text-right font-bold text-sky-400">
                      {formatCurrency(prod.total)}
                    </td>
                    {canMarkDelivered && (
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(idx)}
                          className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-colors"
                          title="Remove unavailable item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
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
          <span className="text-2xl font-extrabold text-sky-400">
            {formatCurrency(currentGrandTotal)}
          </span>
        </div>

        {/* Cancel Confirmation Prompt */}
        {showCancelConfirm && (
          <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-500/10 space-y-3">
            <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>
                {isAdmin
                  ? `Administrative Cancellation: Order #${order.orderNumber}`
                  : `Cancel Order #${order.orderNumber}?`}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {isAdmin
                ? 'As Admin, cancelling this order will mark it as "Cancelled by an admin" across the entire system. This action cannot be undone.'
                : 'Cancelling this order will stop processing and notify recipient. This action cannot be undone.'}
            </p>
            <input
              type="text"
              placeholder="Reason for cancellation (optional)..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border outline-none focus:border-rose-500"
              style={inputStyle}
            />
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ backgroundColor: 'var(--c-bg-elevated)', color: 'var(--c-text-secondary)' }}
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelOrder}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-sm disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : isAdmin ? 'Confirm Cancel as Admin' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        )}

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
            {canCancel && !showCancelConfirm && (
              <button
                type="button"
                onClick={() => setShowCancelConfirm(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all shadow-sm"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel Order</span>
              </button>
            )}

            {canDelete && !showCancelConfirm && (
              <button
                type="button"
                onClick={handleDeleteOrder}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Order</span>
              </button>
            )}
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
                    <span>{updating ? 'Fulfilling...' : 'Save & Mark Delivered'}</span>
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
