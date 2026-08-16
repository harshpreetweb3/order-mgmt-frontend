import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import { Navbar } from './components/Layout/Navbar';
import { Sidebar } from './components/Layout/Sidebar';
import { MobileNav } from './components/Layout/MobileNav';

// Public Page
import { Login } from './pages/Login';

// Salesman Pages
import { SalesmanDashboard } from './pages/Salesman/SalesmanDashboard';
import { MyOrders } from './pages/Salesman/MyOrders';

// Distributor Pages
import { DistributorDashboard } from './pages/Distributor/DistributorDashboard';
import { SalesmenManagement } from './pages/Distributor/SalesmenManagement';
import { ReceivedOrders } from './pages/Distributor/ReceivedOrders';
import { SentOrders } from './pages/Distributor/SentOrders';

// Super Stockist Pages
import { SuperStockistDashboard } from './pages/SuperStockist/SuperStockistDashboard';
import { SuperStockistOrders } from './pages/SuperStockist/SuperStockistOrders';
import { SuperStockistSentOrders } from './pages/SuperStockist/SuperStockistSentOrders';

// Admin Pages
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { UserManagement } from './pages/Admin/UserManagement';
import { ItemManagement } from './pages/Admin/ItemManagement';
import { AllOrders } from './pages/Admin/AllOrders';
import { HierarchyOrders } from './pages/Admin/HierarchyOrders';

// ASM & ASE Pages
import { ASMDashboard } from './pages/ASM/ASMDashboard';
import { ASEDashboard } from './pages/ASE/ASEDashboard';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their default dashboard
    switch (user.role) {
      case 'Admin':
        return <Navigate to="/admin" replace />;
      case 'Super Stockist':
        return <Navigate to="/super-stockist" replace />;
      case 'Distributor':
        return <Navigate to="/distributor" replace />;
      case 'ASM':
        return <Navigate to="/asm" replace />;
      case 'ASE':
        return <Navigate to="/ase" replace />;
      case 'Salesman':
      default:
        return <Navigate to="/salesman" replace />;
    }
  }

  return children;
};

// Main Layout Wrapper
const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen text-slate-100 flex flex-col pb-16 lg:pb-0" style={{ backgroundColor: 'var(--c-bg-base)' }}>
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
};

export default function App() {
  const { user } = useAuth();

  const getDefaultRedirect = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'Admin':
        return '/admin';
      case 'Super Stockist':
        return '/super-stockist';
      case 'Distributor':
        return '/distributor';
      case 'ASM':
        return '/asm';
      case 'ASE':
        return '/ase';
      case 'Salesman':
      default:
        return '/salesman';
    }
  };

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to={getDefaultRedirect()} replace />} />

      {/* Salesman Routes */}
      <Route
        path="/salesman"
        element={
          <ProtectedRoute allowedRoles={['Salesman']}>
            <DashboardLayout>
              <SalesmanDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/salesman/create-order"
        element={
          <ProtectedRoute allowedRoles={['Salesman']}>
            <DashboardLayout>
              <SalesmanDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/salesman/orders"
        element={
          <ProtectedRoute allowedRoles={['Salesman']}>
            <DashboardLayout>
              <MyOrders />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Distributor Routes */}
      <Route
        path="/distributor"
        element={
          <ProtectedRoute allowedRoles={['Distributor']}>
            <DashboardLayout>
              <DistributorDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/distributor/salesmen"
        element={
          <ProtectedRoute allowedRoles={['Distributor']}>
            <DashboardLayout>
              <SalesmenManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/distributor/orders-received"
        element={
          <ProtectedRoute allowedRoles={['Distributor']}>
            <DashboardLayout>
              <ReceivedOrders />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/distributor/orders-sent"
        element={
          <ProtectedRoute allowedRoles={['Distributor']}>
            <DashboardLayout>
              <SentOrders />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Super Stockist Routes */}
      <Route
        path="/super-stockist"
        element={
          <ProtectedRoute allowedRoles={['Super Stockist']}>
            <DashboardLayout>
              <SuperStockistDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-stockist/orders"
        element={
          <ProtectedRoute allowedRoles={['Super Stockist']}>
            <DashboardLayout>
              <SuperStockistOrders />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-stockist/orders-sent"
        element={
          <ProtectedRoute allowedRoles={['Super Stockist']}>
            <DashboardLayout>
              <SuperStockistSentOrders />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout>
              <UserManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/items"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout>
              <ItemManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout>
              <AllOrders />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/hierarchy"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout>
              <HierarchyOrders />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      {/* ASM Routes */}
      <Route
        path="/asm"
        element={
          <ProtectedRoute allowedRoles={['ASM']}>
            <DashboardLayout>
              <ASMDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/asm/create-order"
        element={
          <ProtectedRoute allowedRoles={['ASM']}>
            <DashboardLayout>
              <ASMDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/asm/orders"
        element={
          <ProtectedRoute allowedRoles={['ASM']}>
            <DashboardLayout>
              <ASMDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* ASE Routes */}
      <Route
        path="/ase"
        element={
          <ProtectedRoute allowedRoles={['ASE']}>
            <DashboardLayout>
              <ASEDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ase/create-order"
        element={
          <ProtectedRoute allowedRoles={['ASE']}>
            <DashboardLayout>
              <ASEDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ase/orders"
        element={
          <ProtectedRoute allowedRoles={['ASE']}>
            <DashboardLayout>
              <ASEDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Default Catch-all */}
      <Route path="*" element={<Navigate to={getDefaultRedirect()} replace />} />
    </Routes>
  );
}
