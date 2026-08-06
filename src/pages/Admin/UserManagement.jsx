import React, { useState, useEffect } from 'react';
import { Badge } from '../../components/UI/Badge';
import { UserModal } from '../../components/Users/UserModal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Plus, Search, Edit, Trash2, Power } from 'lucide-react';

export const UserManagement = () => {
  const { showSuccess, showError } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.get('/users', {
        role: roleFilter,
        status: statusFilter,
      });
      setUsers(data);
    } catch (err) {
      showError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleToggleStatus = async (usr) => {
    try {
      const nextStatus = usr.status === 'Active' ? 'Inactive' : 'Active';
      await api.put(`/users/${usr._id}`, { status: nextStatus });
      showSuccess(`User ${usr.name} status changed to ${nextStatus}`);
      fetchUsers();
    } catch (err) {
      showError(err.message || 'Failed to update user status');
    }
  };

  const handleDelete = async (usr) => {
    if (!window.confirm(`Are you sure you want to delete user ${usr.name}?`)) return;

    try {
      await api.delete(`/users/${usr._id}`);
      showSuccess(`User ${usr.name} deleted successfully`);
      fetchUsers();
    } catch (err) {
      showError(err.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || u.role.toLowerCase().includes(s);
  });

  const inputStyle = {
    backgroundColor: 'var(--c-bg-input)',
    borderColor: 'var(--c-border)',
    color: 'var(--c-text-primary)',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--c-text-primary)' }}>
            User Management
          </h1>
          <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
            Create accounts for Salesmen (assigned to Distributors), Distributors (assigned to Super Stockists), and Super Stockists
          </p>
        </div>

        <button
          onClick={() => {
            setEditingUser(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-lg shadow-sky-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create User Account</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div
        className="rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 shadow-md border"
        style={{
          backgroundColor: 'var(--c-bg-surface)',
          borderColor: 'var(--c-border)',
        }}
      >
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--c-text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email..."
            className="w-full rounded-xl pl-10 pr-3 py-2 text-sm border focus:outline-none focus:border-sky-500"
            style={inputStyle}
          />
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full rounded-xl px-3 py-2 text-sm border focus:outline-none focus:border-sky-500"
            style={inputStyle}
          >
            <option value="">All User Roles</option>
            <option value="Admin">Admin</option>
            <option value="Super Stockist">Super Stockist</option>
            <option value="Distributor">Distributor</option>
            <option value="Salesman">Salesman</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-xl px-3 py-2 text-sm border focus:outline-none focus:border-sky-500"
            style={inputStyle}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
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
                <th className="p-3 sm:px-4">Name</th>
                <th className="p-3 sm:px-4">Email</th>
                <th className="p-3 sm:px-4">Role</th>
                <th className="p-3 sm:px-4">Assigned Parent</th>
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
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12" style={{ color: 'var(--c-text-muted)' }}>
                    No users match search criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((usr) => (
                  <tr key={usr._id} className="transition-colors hover:bg-slate-800/20">
                    <td className="p-3 sm:px-4 font-bold" style={{ color: 'var(--c-text-primary)' }}>{usr.name}</td>
                    <td className="p-3 sm:px-4" style={{ color: 'var(--c-text-secondary)' }}>{usr.email}</td>
                    <td className="p-3 sm:px-4">
                      <span className="font-semibold text-sky-400">{usr.role}</span>
                    </td>
                    <td className="p-3 sm:px-4" style={{ color: 'var(--c-text-muted)' }}>
                      {usr.distributorId?.name ? `Dist: ${usr.distributorId.name}` : usr.superStockistId?.name ? `SS: ${usr.superStockistId.name}` : '-'}
                    </td>
                    <td className="p-3 sm:px-4 text-center">
                      <Badge status={usr.status} />
                    </td>
                    <td className="p-3 sm:px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(usr)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            usr.status === 'Active'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                          }`}
                          title={usr.status === 'Active' ? 'Deactivate User' : 'Activate User'}
                        >
                          <Power className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setEditingUser(usr);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-colors"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(usr)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
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

      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        onUserSaved={fetchUsers}
        initialData={editingUser}
      />
    </div>
  );
};
