import React, { useState, useEffect } from 'react';
import { Badge } from '../../components/UI/Badge';
import { UserModal } from '../../components/Users/UserModal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Plus, Users, Mail, CheckCircle2, XCircle } from 'lucide-react';

export const SalesmenManagement = () => {
  const { showSuccess, showError } = useToast();
  const [salesmen, setSalesmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const fetchSalesmen = async () => {
    setLoading(true);
    try {
      const data = await api.get('/users?role=Salesman');
      setSalesmen(data);
    } catch (err) {
      showError(err.message || 'Failed to fetch salesmen');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesmen();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Salesmen Management</h1>
          <p className="text-sm text-slate-400">Manage field salesmen accounts under your distribution zone</p>
        </div>

        <button
          onClick={() => setIsUserModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-lg shadow-sky-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Salesman</span>
        </button>
      </div>

      {/* Salesmen Cards List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : salesmen.length === 0 ? (
          <div className="col-span-full bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            No salesmen registered yet. Click 'Register New Salesman' above to add one.
          </div>
        ) : (
          salesmen.map((salesman) => (
            <div
              key={salesman._id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                    {salesman.name.charAt(0).toUpperCase()}
                  </div>
                  <Badge status={salesman.status} />
                </div>
                <h3 className="text-base font-bold text-white">{salesman.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  <span>{salesman.email}</span>
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Role: Salesman</span>
                <span className="text-slate-400">Assigned to You</span>
              </div>
            </div>
          ))
        )}
      </div>

      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onUserSaved={fetchSalesmen}
      />
    </div>
  );
};
