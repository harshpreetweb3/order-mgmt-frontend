import React, { useState, useEffect } from 'react';
import { Modal } from '../UI/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { calculateRolePrice } from '../../utils/pricing';
import { Plus, Trash2, ShoppingCart, Store, UserCheck } from 'lucide-react';

export const OrderFormModal = ({ isOpen, onClose, onOrderSaved, initialData = null }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [itemsMaster, setItemsMaster] = useState([]);
  const [recipientUsers, setRecipientUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [orderTo, setOrderTo] = useState('');
  const [orderFrom, setOrderFrom] = useState('');
  const [products, setProducts] = useState([
    { itemId: '', quantity: 1, price: 0, total: 0 },
  ]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const items = await api.get('/items?activeOnly=true');
        setItemsMaster(items);

        if (user.role === 'Salesman') {
          const distributors = await api.get('/users?role=Distributor');
          setRecipientUsers(distributors);
          if (distributors.length > 0 && !initialData) {
            setOrderTo(distributors[0]._id);
          }
        } else if (user.role === 'Distributor' || user.role === 'ASM') {
          const superStockists = await api.get('/users?role=Super Stockist');
          const admins = await api.get('/users?role=Admin');
          // Allow selecting Super Stockist or Company (Admin)
          const companyOption = admins.length > 0 ? [{ _id: admins[0]._id, name: 'RGDG Agro India (Company)', role: 'Company' }] : [];
          const combinedRecipients = [...superStockists, ...companyOption];
          setRecipientUsers(combinedRecipients);
          if (combinedRecipients.length > 0 && !initialData) {
            setOrderTo(combinedRecipients[0]._id);
          }
        } else if (user.role === 'Super Stockist' || user.role === 'ASE') {
          const admins = await api.get('/users?role=Admin');
          setRecipientUsers(admins);
          if (admins.length > 0 && !initialData) {
            setOrderTo(admins[0]._id);
          }
        } else if (user.role === 'Admin') {
          const distributors = await api.get('/users?role=Distributor');
          const superStockists = await api.get('/users?role=Super Stockist');
          setRecipientUsers([...distributors, ...superStockists]);
        }

        if (initialData) {
          setOrderTo(initialData.orderTo?._id || initialData.orderTo || '');
          setOrderFrom(initialData.orderFrom || '');
          if (initialData.products && initialData.products.length > 0) {
            setProducts(
              initialData.products.map((p) => ({
                itemId: p.itemId?._id || p.itemId,
                quantity: p.quantity,
                price: p.price,
                total: p.total,
              }))
            );
          }
        } else if (items.length > 0) {
          const defaultPrice = calculateRolePrice(items[0].price, user.role);
          setProducts([
            {
              itemId: items[0]._id,
              quantity: 1,
              price: defaultPrice,
              total: defaultPrice,
            },
          ]);
        }
      } catch (err) {
        showError('Failed to load item master or recipient users');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, initialData, user]);

  const handleItemChange = (index, itemId) => {
    const selectedItem = itemsMaster.find((i) => i._id === itemId);
    const updated = [...products];
    const price = selectedItem ? calculateRolePrice(selectedItem.price, user.role) : 0;
    const qty = updated[index].quantity || 1;

    updated[index] = {
      ...updated[index],
      itemId,
      price,
      total: Math.round(price * qty * 100) / 100,
    };
    setProducts(updated);
  };

  const handleQuantityChange = (index, quantity) => {
    const qty = Math.max(1, parseInt(quantity) || 1);
    const updated = [...products];
    const price = updated[index].price || 0;

    updated[index] = {
      ...updated[index],
      quantity: qty,
      total: Math.round(price * qty * 100) / 100,
    };
    setProducts(updated);
  };

  const addProductRow = () => {
    const defaultItem = itemsMaster[0];
    const price = defaultItem ? calculateRolePrice(defaultItem.price, user.role) : 0;
    setProducts((prev) => [
      ...prev,
      {
        itemId: defaultItem ? defaultItem._id : '',
        quantity: 1,
        price,
        total: price,
      },
    ]);
  };

  const removeProductRow = (index) => {
    if (products.length === 1) return;
    setProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const grandTotal = products.reduce((acc, curr) => acc + (curr.total || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (user.role === 'Salesman' && !orderFrom.trim()) {
      showError('Shop Name (Order From) is required');
      return;
    }

    if (!orderTo) {
      showError('Please select a recipient (Order To)');
      return;
    }

    if (products.some((p) => !p.itemId)) {
      showError('Please select a valid product for all rows');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        orderTo,
        orderFrom,
        products: products.map((p) => ({
          itemId: p.itemId,
          quantity: p.quantity,
        })),
      };

      if (initialData) {
        await api.put(`/orders/${initialData._id}`, payload);
        showSuccess('Order updated successfully');
      } else {
        await api.post('/orders', payload);
        showSuccess('Order created successfully');
      }

      onOrderSaved();
      onClose();
    } catch (err) {
      showError(err.message || 'Failed to save order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit Order #${initialData.orderNumber}` : 'Create New Order'}
      maxWidth="max-w-3xl"
    >
      {loading ? (
        <div className="flex items-center justify-center py-12" style={{ color: 'var(--c-text-muted)' }}>
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Info Banner */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border"
            style={{
              backgroundColor: 'var(--c-bg-elevated)',
              borderColor: 'var(--c-border)',
            }}
          >
            {/* Salesman banner */}
            {user.role === 'Salesman' && (
              <div className="sm:col-span-2 flex items-center gap-3 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold" style={{ color: 'var(--c-text-primary)' }}>
                    Ordering as: <span className="text-emerald-400">{user.name}</span>
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--c-text-muted)' }}>
                    This order will be sent directly to the selected Distributor
                  </p>
                </div>
              </div>
            )}

            {/* Distributor banner */}
            {user.role === 'Distributor' && (
              <div className="sm:col-span-2 flex items-center gap-3 px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <UserCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold" style={{ color: 'var(--c-text-primary)' }}>
                    Ordering as: <span className="text-indigo-400">{user.name}</span> (Distributor)
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--c-text-muted)' }}>
                    Order will be sent to the selected Super Stockist or RGDG Agro India (Company)
                  </p>
                </div>
              </div>
            )}

            {/* ASM banner */}
            {user.role === 'ASM' && (
              <div className="sm:col-span-2 flex items-center gap-3 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <UserCheck className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold" style={{ color: 'var(--c-text-primary)' }}>
                    Ordering as ASM: <span className="text-purple-400">{user.name}</span> (on behalf of Distributor)
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--c-text-muted)' }}>
                    Order will be sent to Super Stockist or RGDG Agro India (Company) at Distributor rates
                  </p>
                </div>
              </div>
            )}

            {/* Super Stockist banner */}
            {user.role === 'Super Stockist' && (
              <div className="sm:col-span-2 flex items-center gap-3 px-3 py-2 rounded-lg bg-sky-500/10 border border-sky-500/20">
                <UserCheck className="w-4 h-4 text-sky-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold" style={{ color: 'var(--c-text-primary)' }}>
                    Ordering as: <span className="text-sky-400">{user.name}</span> (Super Stockist)
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--c-text-muted)' }}>
                    This bulk replenishment order will be sent directly to RGDG Agro India (Company)
                  </p>
                </div>
              </div>
            )}

            {/* ASE banner */}
            {user.role === 'ASE' && (
              <div className="sm:col-span-2 flex items-center gap-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold" style={{ color: 'var(--c-text-primary)' }}>
                    Ordering as ASE: <span className="text-amber-400">{user.name}</span> (on behalf of Super Stockist)
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--c-text-muted)' }}>
                    This order will be sent directly to RGDG Agro India (Company) at Super Stockist rates
                  </p>
                </div>
              </div>
            )}

            <div className="sm:col-span-2">
              <label
                className="block text-xs font-semibold mb-1 flex items-center gap-1.5"
                style={{ color: 'var(--c-text-muted)' }}
              >
                <Store className="w-3.5 h-3.5 text-sky-400" />
                <span>
                  Order To ({(user.role === 'Super Stockist' || user.role === 'ASE') ? 'Company' : 'Super Stockist / Company'}) *
                </span>
              </label>
              {(user.role === 'Super Stockist' || user.role === 'ASE') ? (
                <input
                  type="text"
                  value="RGDG Agro India"
                  readOnly
                  className="w-full rounded-lg px-3.5 py-2 text-sm font-bold border"
                  style={{
                    backgroundColor: 'var(--c-bg-input)',
                    borderColor: 'var(--c-border)',
                    color: 'var(--c-text-primary)',
                  }}
                />
              ) : (
                <select
                  value={orderTo}
                  onChange={(e) => setOrderTo(e.target.value)}
                  required
                  className="w-full rounded-lg px-3 py-1.5 text-sm border focus:border-sky-500"
                  style={{
                    backgroundColor: 'var(--c-bg-input)',
                    borderColor: 'var(--c-border)',
                    color: 'var(--c-text-primary)',
                  }}
                >
                  <option value="">-- Select Recipient --</option>
                  {recipientUsers.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} {u.role ? `(${u.role})` : ''}
                    </option>
                  ))}
                </select>
              )}
              {user.role !== 'Super Stockist' && user.role !== 'ASE' && recipientUsers.length === 0 && (
                <p className="text-xs mt-1 text-rose-400">
                  No recipient accounts found. Contact Admin.
                </p>
              )}
            </div>

            {/* Shop Name — only shown for Salesman role */}
            {user.role === 'Salesman' && (
              <div className="sm:col-span-2">
                <label
                  className="block text-xs font-semibold mb-1 flex items-center gap-1.5"
                  style={{ color: 'var(--c-text-muted)' }}
                >
                  <Store className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Order From (Shop / Store Name) *</span>
                </label>
                <input
                  type="text"
                  value={orderFrom}
                  onChange={(e) => setOrderFrom(e.target.value)}
                  placeholder="e.g. Apex Supermarket, Main Street"
                  required
                  className="w-full rounded-lg px-3.5 py-2 text-sm border focus:border-sky-500"
                  style={{
                    backgroundColor: 'var(--c-bg-input)',
                    borderColor: 'var(--c-border)',
                    color: 'var(--c-text-primary)',
                  }}
                />
              </div>
            )}
          </div>

          {/* Products List Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4
                className="text-sm font-bold flex items-center gap-2"
                style={{ color: 'var(--c-text-primary)' }}
              >
                <ShoppingCart className="w-4 h-4 text-sky-400" />
                <span>Order Items</span>
              </h4>
              <button
                type="button"
                onClick={addProductRow}
                className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-3">
              {products.map((prod, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 items-center p-3 rounded-xl border"
                  style={{
                    backgroundColor: 'var(--c-bg-surface)',
                    borderColor: 'var(--c-border)',
                  }}
                >
                  <div className="col-span-12 sm:col-span-5">
                    <label
                      className="block text-[11px] mb-1 sm:hidden"
                      style={{ color: 'var(--c-text-muted)' }}
                    >
                      Product
                    </label>
                    <select
                      value={prod.itemId}
                      onChange={(e) => handleItemChange(idx, e.target.value)}
                      required
                      className="w-full rounded-lg px-2.5 py-1.5 text-xs border focus:border-sky-500"
                      style={{
                        backgroundColor: 'var(--c-bg-input)',
                        borderColor: 'var(--c-border)',
                        color: 'var(--c-text-primary)',
                      }}
                    >
                      <option value="">Select Item</option>
                      {itemsMaster.map((i) => (
                        <option key={i._id} value={i._id}>
                          {i.itemName} ({formatCurrency(calculateRolePrice(i.price, user.role))})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-4 sm:col-span-2">
                    <label
                      className="block text-[11px] mb-1 sm:hidden"
                      style={{ color: 'var(--c-text-muted)' }}
                    >
                      Qty
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={prod.quantity}
                      onChange={(e) => handleQuantityChange(idx, e.target.value)}
                      required
                      className="w-full rounded-lg px-2 py-1.5 text-xs text-center border focus:border-sky-500"
                      style={{
                        backgroundColor: 'var(--c-bg-input)',
                        borderColor: 'var(--c-border)',
                        color: 'var(--c-text-primary)',
                      }}
                    />
                  </div>

                  <div className="col-span-4 sm:col-span-2">
                    <label
                      className="block text-[11px] mb-1 sm:hidden"
                      style={{ color: 'var(--c-text-muted)' }}
                    >
                      Price
                    </label>
                    <div
                      className="rounded-lg px-2 py-1.5 text-xs text-center font-medium border"
                      style={{
                        backgroundColor: 'var(--c-bg-input)',
                        borderColor: 'var(--c-border)',
                        color: 'var(--c-text-secondary)',
                      }}
                    >
                      {formatCurrency(prod.price)}
                    </div>
                  </div>

                  <div className="col-span-3 sm:col-span-2 text-right">
                    <label
                      className="block text-[11px] mb-1 sm:hidden"
                      style={{ color: 'var(--c-text-muted)' }}
                    >
                      Total
                    </label>
                    <div className="text-xs font-bold text-sky-400">
                      {formatCurrency(prod.total)}
                    </div>
                  </div>

                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => removeProductRow(idx)}
                      disabled={products.length === 1}
                      className="p-1 transition-colors hover:text-rose-400 disabled:opacity-30"
                      style={{ color: 'var(--c-text-muted)' }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grand Total Footer */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-sky-950/20 border border-sky-500/30">
            <span
              className="text-sm font-bold"
              style={{ color: 'var(--c-text-secondary)' }}
            >
              Grand Total
            </span>
            <span className="text-xl font-extrabold text-sky-400 tracking-tight">
              {formatCurrency(grandTotal)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
              style={{
                backgroundColor: 'var(--c-bg-elevated)',
                color: 'var(--c-text-secondary)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : initialData ? 'Update Order' : 'Create Order'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
