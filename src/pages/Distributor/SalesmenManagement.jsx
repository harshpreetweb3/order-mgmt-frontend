import React, { useState, useEffect } from 'react';
import { Badge } from '../../components/UI/Badge';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Mail, Users } from 'lucide-react';

export const SalesmenManagement = () => {
  const { showError } = useToast();
  const [salesmen, setSalesmen] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--c-text-primary)' }}>
          Salesmen Directory
        </h1>
        <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
          Field salesmen assigned to your distribution zone by Admin
        </p>
      </div>

      {/* Salesmen Cards List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : salesmen.length === 0 ? (
          <div
            className="col-span-full border rounded-2xl p-12 text-center"
            style={{
              backgroundColor: 'var(--c-bg-surface)',
              borderColor: 'var(--c-border)',
              color: 'var(--c-text-muted)',
            }}
          >
            No salesmen assigned to your distribution zone yet. Admin can assign salesmen to you from the Admin User Management panel.
          </div>
        ) : (
          salesmen.map((salesman) => (
            <div
              key={salesman._id}
              className="border rounded-2xl p-5 shadow-lg flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--c-bg-surface)',
                borderColor: 'var(--c-border)',
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                    {salesman.name.charAt(0).toUpperCase()}
                  </div>
                  <Badge status={salesman.status} />
                </div>
                <h3 className="text-base font-bold" style={{ color: 'var(--c-text-primary)' }}>
                  {salesman.name}
                </h3>
                <p className="text-xs flex items-center gap-1.5 mt-1" style={{ color: 'var(--c-text-muted)' }}>
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  <span>{salesman.email}</span>
                </p>
              </div>

              <div
                className="mt-4 pt-3 border-t flex items-center justify-between text-xs"
                style={{
                  borderColor: 'var(--c-border)',
                  color: 'var(--c-text-muted)',
                }}
              >
                <span>Role: Salesman</span>
                <span className="font-semibold text-emerald-500">Assigned to You</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
