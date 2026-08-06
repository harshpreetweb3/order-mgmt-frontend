import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  PlusCircle,
  Inbox,
  Send,
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const getNavItems = () => {
    switch (role) {
      case 'Admin':
        return [
          { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
          { label: 'User Management', path: '/admin/users', icon: Users },
          { label: 'Items Master', path: '/admin/items', icon: Package },
          { label: 'All Orders', path: '/admin/orders', icon: ShoppingBag },
        ];
      case 'Distributor':
        return [
          { label: 'Dashboard', path: '/distributor', icon: LayoutDashboard },
          { label: 'Salesmen List', path: '/distributor/salesmen', icon: Users },
          { label: 'Orders Received', path: '/distributor/orders-received', icon: Inbox },
          { label: 'Orders to SS', path: '/distributor/orders-sent', icon: Send },
        ];
      case 'Super Stockist':
        return [
          { label: 'Dashboard', path: '/super-stockist', icon: LayoutDashboard },
          { label: 'Orders Received', path: '/super-stockist/orders', icon: Inbox },
          { label: 'Orders to Admin', path: '/super-stockist/orders-sent', icon: Send },
        ];
      case 'Salesman':
      default:
        return [
          { label: 'Dashboard', path: '/salesman', icon: LayoutDashboard },
          { label: 'Create Order', path: '/salesman/create-order', icon: PlusCircle },
          { label: 'My Orders', path: '/salesman/orders', icon: ShoppingBag },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside
      className="hidden lg:flex flex-col w-64 p-4 min-h-[calc(100vh-61px)] border-r transition-colors"
      style={{
        backgroundColor: 'var(--c-bg-surface)',
        borderColor: 'var(--c-border)',
      }}
    >
      <div
        className="text-xs font-semibold uppercase tracking-wider px-3 mb-3"
        style={{ color: 'var(--c-text-muted)' }}
      >
        {role} Navigation
      </div>
      <nav className="flex flex-col gap-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin' || item.path === '/distributor' || item.path === '/super-stockist' || item.path === '/salesman'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 font-semibold shadow-sm'
                    : 'hover:bg-slate-800/60'
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? {}
                  : { color: 'var(--c-text-secondary)' }
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
