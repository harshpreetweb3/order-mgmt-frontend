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
  Network,
} from 'lucide-react';

export const MobileNav = () => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const getNavItems = () => {
    switch (role) {
      case 'Admin':
        return [
          { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
          { label: 'Users', path: '/admin/users', icon: Users },
          { label: 'Items', path: '/admin/items', icon: Package },
          { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
          { label: 'Hierarchy', path: '/admin/hierarchy', icon: Network },
        ];
      case 'Distributor':
        return [
          { label: 'Dashboard', path: '/distributor', icon: LayoutDashboard },
          { label: 'Salesmen', path: '/distributor/salesmen', icon: Users },
          { label: 'Received', path: '/distributor/orders-received', icon: Inbox },
          { label: 'Sent', path: '/distributor/orders-sent', icon: Send },
        ];
      case 'Super Stockist':
        return [
          { label: 'Dashboard', path: '/super-stockist', icon: LayoutDashboard },
          { label: 'Received', path: '/super-stockist/orders', icon: Inbox },
          { label: 'Sent', path: '/super-stockist/orders-sent', icon: Send },
        ];
      case 'ASM':
        return [
          { label: 'Dashboard', path: '/asm', icon: LayoutDashboard },
          { label: 'New Order', path: '/asm/create-order', icon: PlusCircle },
          { label: 'Orders', path: '/asm/orders', icon: ShoppingBag },
        ];
      case 'ASE':
        return [
          { label: 'Dashboard', path: '/ase', icon: LayoutDashboard },
          { label: 'New Order', path: '/ase/create-order', icon: PlusCircle },
          { label: 'Orders', path: '/ase/orders', icon: ShoppingBag },
        ];
      case 'Salesman':
      default:
        return [
          { label: 'Dashboard', path: '/salesman', icon: LayoutDashboard },
          { label: 'New Order', path: '/salesman/create-order', icon: PlusCircle },
          { label: 'Orders', path: '/salesman/orders', icon: ShoppingBag },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <div
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-lg px-2 py-1.5 shadow-2xl transition-colors"
      style={{
        backgroundColor: 'var(--c-bg-surface)',
        borderColor: 'var(--c-border)',
      }}
    >
      <nav className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin' || item.path === '/distributor' || item.path === '/super-stockist' || item.path === '/salesman'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'text-sky-400 font-semibold scale-105'
                    : ''
                }`
              }
              style={({ isActive }) =>
                isActive ? {} : { color: 'var(--c-text-muted)' }
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
