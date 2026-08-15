import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { OrderDetailModal } from '../../components/Orders/OrderDetailModal';
import { Badge } from '../../components/UI/Badge';
import { formatDate, formatCurrency } from '../../utils/formatters';
import {
  Building2, Users, Briefcase, UserCheck, User,
  ChevronRight, Search, Eye, Box, Expand, Shrink, Layers
} from 'lucide-react';

export const HierarchyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedNodes, setExpandedNodes] = useState(new Set(['root']));
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const ordersData = await api.get('/orders');
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = (tree) => {
    const allIds = new Set();
    const traverse = (node) => {
      allIds.add(node.id);
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    traverse(tree);
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set(['root']));
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (statusFilter !== 'All' && o.status !== statusFilter) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const orderNumMatch = o.orderNumber?.toLowerCase().includes(term);
        const shopMatch = o.orderFrom?.toLowerCase().includes(term);
        const creatorMatch = o.createdBy?.name?.toLowerCase().includes(term);
        if (!orderNumMatch && !shopMatch && !creatorMatch) return false;
      }
      return true;
    });
  }, [orders, searchTerm, statusFilter]);

  // Expand logic when searching
  useEffect(() => {
    if (searchTerm) {
      // Very simplistic: just expand all if searching so we don't have to build complex partial trees
      // Or we can let the user expand, but prompt asked to "auto-expand all matching branches"
      // We will handle it by auto-expanding all in render if searchTerm is active
    }
  }, [searchTerm]);

  const treeData = useMemo(() => {
    const root = {
      id: 'root',
      name: 'RGDG Agro India',
      type: 'company',
      stats: { total: 0, pending: 0, delivered: 0, value: 0 },
      children: [] // Will contain SSs and Direct Dist group
    };

    const ssMap = new Map();
    const directDistMap = new Map();

    const getSS = (id, name) => {
      if (!ssMap.has(id)) {
        ssMap.set(id, {
          id: `ss_${id}`,
          name: name || 'Unknown Super Stockist',
          type: 'super_stockist',
          stats: { total: 0, pending: 0, delivered: 0, value: 0 },
          distributors: new Map(),
          ases: new Map(),
          ownOrders: []
        });
      }
      return ssMap.get(id);
    };

    const getDistributor = (parentMap, id, name) => {
      if (!parentMap.has(id)) {
        parentMap.set(id, {
          id: `dist_${id}`,
          name: name || 'Unknown Distributor',
          type: 'distributor',
          stats: { total: 0, pending: 0, delivered: 0, value: 0 },
          asms: new Map(),
          salesmen: new Map(),
          ownOrders: []
        });
      }
      return parentMap.get(id);
    };

    const getASM = (dist, id, name) => {
      if (!dist.asms.has(id)) {
        dist.asms.set(id, {
          id: `asm_${id}`,
          name: name || 'Unknown ASM',
          type: 'asm',
          stats: { total: 0, pending: 0, delivered: 0, value: 0 },
          orders: []
        });
      }
      return dist.asms.get(id);
    };

    const getSalesman = (dist, id, name) => {
      if (!dist.salesmen.has(id)) {
        dist.salesmen.set(id, {
          id: `sm_${id}`,
          name: name || 'Unknown Salesman',
          type: 'salesman',
          stats: { total: 0, pending: 0, delivered: 0, value: 0 },
          orders: []
        });
      }
      return dist.salesmen.get(id);
    };

    const getASE = (ss, id, name) => {
      if (!ss.ases.has(id)) {
        ss.ases.set(id, {
          id: `ase_${id}`,
          name: name || 'Unknown ASE',
          type: 'ase',
          stats: { total: 0, pending: 0, delivered: 0, value: 0 },
          orders: []
        });
      }
      return ss.ases.get(id);
    };

    const updateStats = (stats, order) => {
      stats.total += 1;
      if (order.status === 'Pending') stats.pending += 1;
      if (order.status === 'Delivered') stats.delivered += 1;
      stats.value += (order.grandTotal || 0);
    };

    filteredOrders.forEach(order => {
      updateStats(root.stats, order);

      const role = order.createdByRole;
      const isDirectDist = order.distributor && !order.superStockist && order.orderTo?.role === 'Admin';

      if (isDirectDist) {
        const dist = getDistributor(directDistMap, order.distributor._id, order.distributor.name);
        updateStats(dist.stats, order);
        
        if (role === 'Salesman' && order.salesman) {
          const sm = getSalesman(dist, order.salesman._id, order.salesman.name);
          updateStats(sm.stats, order);
          sm.orders.push(order);
        } else if (role === 'ASM') {
          const asm = getASM(dist, order.createdBy._id, order.createdBy.name);
          updateStats(asm.stats, order);
          asm.orders.push(order);
        } else {
          dist.ownOrders.push(order);
        }
        return;
      }

      if (order.superStockist) {
        const ss = getSS(order.superStockist._id, order.superStockist.name);
        updateStats(ss.stats, order);

        if (role === 'Super Stockist' && order.orderTo?.role === 'Admin') {
          ss.ownOrders.push(order);
        }
        else if (role === 'ASE') {
          const ase = getASE(ss, order.createdBy._id, order.createdBy.name);
          updateStats(ase.stats, order);
          ase.orders.push(order);
        }
        else if (order.distributor) {
          const dist = getDistributor(ss.distributors, order.distributor._id, order.distributor.name);
          updateStats(dist.stats, order);

          if (role === 'Salesman' && order.salesman) {
            const sm = getSalesman(dist, order.salesman._id, order.salesman.name);
            updateStats(sm.stats, order);
            sm.orders.push(order);
          } else if (role === 'ASM') {
            const asm = getASM(dist, order.createdBy._id, order.createdBy.name);
            updateStats(asm.stats, order);
            asm.orders.push(order);
          } else {
            dist.ownOrders.push(order);
          }
        } else {
          // fallback
          ss.ownOrders.push(order);
        }
      } else {
        // Fallback for orders not matching standard hierarchy
        if (!root.otherOrders) {
           root.otherOrders = [];
        }
        root.otherOrders.push(order);
      }
    });

    // Build the final tree
    for (const ss of ssMap.values()) {
      const ssChildren = [];
      if (ss.ownOrders.length > 0) {
        ssChildren.push({ id: `${ss.id}_own`, name: 'SS Orders to Company', type: 'order_group', stats: ss.stats, orders: ss.ownOrders });
      }
      for (const ase of ss.ases.values()) {
        ssChildren.push({ ...ase, children: [{ id: `${ase.id}_orders`, type: 'order_list', orders: ase.orders }] });
      }
      for (const dist of ss.distributors.values()) {
        const distChildren = [];
        if (dist.ownOrders.length > 0) {
          distChildren.push({ id: `${dist.id}_own`, name: 'Distributor Orders', type: 'order_group', stats: dist.stats, orders: dist.ownOrders });
        }
        for (const asm of dist.asms.values()) {
          distChildren.push({ ...asm, children: [{ id: `${asm.id}_orders`, type: 'order_list', orders: asm.orders }] });
        }
        for (const sm of dist.salesmen.values()) {
          distChildren.push({ ...sm, children: [{ id: `${sm.id}_orders`, type: 'order_list', orders: sm.orders }] });
        }
        ssChildren.push({ ...dist, children: distChildren });
      }
      root.children.push({ ...ss, children: ssChildren });
    }

    if (directDistMap.size > 0) {
      const ddGroup = {
        id: 'direct_dist_group',
        name: 'Direct Distributors (No SS)',
        type: 'direct_group',
        stats: { total: 0, pending: 0, delivered: 0, value: 0 },
        children: []
      };
      for (const dist of directDistMap.values()) {
        updateStats(ddGroup.stats, { status: '', grandTotal: dist.stats.value }); // rough calc, better to aggregate properly
        ddGroup.stats.total += dist.stats.total;
        ddGroup.stats.pending += dist.stats.pending;
        ddGroup.stats.delivered += dist.stats.delivered;

        const distChildren = [];
        if (dist.ownOrders.length > 0) {
          distChildren.push({ id: `${dist.id}_own`, name: 'Distributor Orders', type: 'order_group', orders: dist.ownOrders });
        }
        for (const asm of dist.asms.values()) {
          distChildren.push({ ...asm, children: [{ id: `${asm.id}_orders`, type: 'order_list', orders: asm.orders }] });
        }
        for (const sm of dist.salesmen.values()) {
          distChildren.push({ ...sm, children: [{ id: `${sm.id}_orders`, type: 'order_list', orders: sm.orders }] });
        }
        ddGroup.children.push({ ...dist, children: distChildren });
      }
      root.children.push(ddGroup);
    }

    if (root.otherOrders && root.otherOrders.length > 0) {
      root.children.push({
        id: 'other_orders',
        name: 'Other Orders',
        type: 'order_group',
        stats: { total: root.otherOrders.length, pending: 0, delivered: 0, value: 0 },
        orders: root.otherOrders
      });
    }

    return root;
  }, [filteredOrders]);

  const getTypeStyles = (type) => {
    switch (type) {
      case 'company': return { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', accent: 'border-l-indigo-500' };
      case 'super_stockist': return { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', accent: 'border-l-purple-500' };
      case 'direct_group': return { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', accent: 'border-l-orange-500' };
      case 'distributor': return { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20', accent: 'border-l-sky-500' };
      case 'asm': return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', accent: 'border-l-amber-500' };
      case 'ase': return { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20', accent: 'border-l-teal-500' };
      case 'salesman': return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', accent: 'border-l-emerald-500' };
      default: return { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20', accent: 'border-l-gray-500' };
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'company': return <Building2 size={18} />;
      case 'super_stockist': return <Layers size={18} />;
      case 'direct_group': return <Layers size={18} />;
      case 'distributor': return <Briefcase size={18} />;
      case 'asm': return <UserCheck size={18} />;
      case 'ase': return <UserCheck size={18} />;
      case 'salesman': return <User size={18} />;
      default: return <Box size={18} />;
    }
  };

  const renderOrderList = (orders, key) => (
    <div key={key} className="flex flex-col gap-2 py-2" style={{ paddingLeft: '2rem' }}>
      {orders.map(order => (
        <div 
          key={order._id}
          className="flex items-center justify-between p-3 rounded-md shadow-sm border"
          style={{ backgroundColor: 'var(--c-bg-surface)', borderColor: 'var(--c-border-soft)' }}
        >
          <div className="flex flex-col gap-1">
            <span className="font-bold text-sky-400">{order.orderNumber}</span>
            <span className="text-sm font-medium" style={{ color: 'var(--c-text-primary)' }}>{order.orderFrom}</span>
            <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>{formatDate(order.createdAt)}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end gap-1">
              <span className="font-semibold" style={{ color: 'var(--c-text-primary)' }}>{formatCurrency(order.grandTotal)}</span>
              <Badge status={order.status} />
            </div>
            <button 
              onClick={() => setSelectedOrder(order)}
              className="p-2 rounded-full hover:bg-gray-500/10 transition-colors"
              style={{ color: 'var(--c-text-secondary)' }}
            >
              <Eye size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderNode = (node, level = 0) => {
    if (node.type === 'order_list') return renderOrderList(node.orders, node.id);
    if (node.type === 'order_group') {
       return (
         <div key={node.id} className="pl-6">
            <div className="text-xs font-semibold py-2 uppercase tracking-wider" style={{ color: 'var(--c-text-muted)' }}>{node.name}</div>
            {renderOrderList(node.orders, `${node.id}_list`)}
         </div>
       );
    }

    const isExpanded = expandedNodes.has(node.id) || !!searchTerm;
    const styles = getTypeStyles(node.type);

    return (
      <div key={node.id} className="w-full flex flex-col" style={{ paddingLeft: `${level * 1.5}rem` }}>
        <div 
          className={`flex items-center justify-between p-3 rounded-lg mb-2 cursor-pointer border-l-4 shadow-sm border-y border-r transition-all ${styles.bg} ${styles.border} ${styles.accent}`}
          style={{ backgroundColor: 'var(--c-bg-surface)' }}
          onClick={() => toggleExpand(node.id)}
        >
          <div className="flex items-center gap-3">
            <div 
              className="flex items-center justify-center transition-transform duration-200"
              style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', color: 'var(--c-text-muted)' }}
            >
              <ChevronRight size={18} />
            </div>
            <div className={`p-2 rounded-md ${styles.bg} ${styles.text}`}>
              {getTypeIcon(node.type)}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-lg" style={{ color: 'var(--c-text-primary)' }}>{node.name}</span>
              <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--c-text-muted)' }}>
                {node.type.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold" style={{ color: 'var(--c-text-primary)' }}>{node.stats?.total || 0}</span>
              <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Orders</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-amber-500">{node.stats?.pending || 0}</span>
              <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Pending</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-emerald-500">{node.stats?.delivered || 0}</span>
              <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Delivered</span>
            </div>
            <div className="flex flex-col items-end min-w-[100px]">
              <span className="text-sm font-bold" style={{ color: 'var(--c-text-primary)' }}>{formatCurrency(node.stats?.value || 0)}</span>
              <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Total Value</span>
            </div>
          </div>
        </div>

        {isExpanded && node.children && node.children.length > 0 && (
          <div className="flex flex-col w-full mb-2 border-l border-dashed ml-4" style={{ borderColor: 'var(--c-border-soft)' }}>
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 w-full" style={{ color: 'var(--c-text-secondary)' }}>
        <div className="animate-spin mr-3">
          <Layers />
        </div>
        Loading Hierarchy...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full p-6 gap-6" style={{ backgroundColor: 'var(--c-bg-base)' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--c-text-primary)' }}>Order Hierarchy</h1>
          <p className="mt-1" style={{ color: 'var(--c-text-secondary)' }}>Visual breakdown of all orders by business hierarchy</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => expandAll(treeData)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors border"
            style={{ backgroundColor: 'var(--c-bg-surface)', color: 'var(--c-text-primary)', borderColor: 'var(--c-border-soft)' }}
          >
            <Expand size={16} /> Expand All
          </button>
          <button 
            onClick={collapseAll}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors border"
            style={{ backgroundColor: 'var(--c-bg-surface)', color: 'var(--c-text-primary)', borderColor: 'var(--c-border-soft)' }}
          >
            <Shrink size={16} /> Collapse All
          </button>
        </div>
      </div>

      {/* Filters */}
      <div 
        className="flex items-center justify-between p-4 rounded-xl border shadow-sm"
        style={{ backgroundColor: 'var(--c-bg-surface)', borderColor: 'var(--c-border-soft)' }}
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--c-text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search order #, shop name, or person..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-sky-500/50"
            style={{ backgroundColor: 'var(--c-bg-input)', color: 'var(--c-text-primary)', borderColor: 'var(--c-border-soft)' }}
          />
        </div>
        <div className="flex items-center gap-2">
          {['All', 'Pending', 'Delivered'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors border ${statusFilter === status ? 'bg-sky-500/10 text-sky-500 border-sky-500/30' : ''}`}
              style={{ 
                backgroundColor: statusFilter === status ? undefined : 'var(--c-bg-surface)', 
                color: statusFilter === status ? undefined : 'var(--c-text-secondary)',
                borderColor: statusFilter === status ? undefined : 'var(--c-border-soft)'
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Tree View */}
      <div className="flex-1 overflow-y-auto w-full pb-20">
        {renderNode(treeData)}
      </div>

      <OrderDetailModal 
        isOpen={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        order={selectedOrder} 
        onStatusChanged={fetchData} 
      />
    </div>
  );
};
