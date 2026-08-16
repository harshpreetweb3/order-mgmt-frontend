import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { OrderDetailModal } from '../../components/Orders/OrderDetailModal';
import { Badge } from '../../components/UI/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Building2,
  Users,
  Briefcase,
  UserCheck,
  User,
  ChevronRight,
  ChevronDown,
  Search,
  Eye,
  Box,
  Layers,
  ShoppingBag,
  Send,
  Inbox,
  RefreshCw,
} from 'lucide-react';

export const HierarchyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedNodes, setExpandedNodes] = useState(new Set(['root']));
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersData, usersData] = await Promise.all([
        api.get('/orders'),
        api.get('/users'),
      ]);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      console.error('Error fetching hierarchy data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (nodeId) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const expandAll = (nodes) => {
    const allIds = new Set(['root']);
    const collectIds = (items) => {
      if (!items) return;
      items.forEach((item) => {
        if (item.id) allIds.add(item.id);
        if (item.children) collectIds(item.children);
      });
    };
    collectIds(nodes);
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set(['root']));
  };

  // Filter orders by search & status
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== 'All' && o.status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const numMatch = o.orderNumber?.toLowerCase().includes(term);
        const fromMatch = o.orderFrom?.toLowerCase().includes(term);
        const creatorMatch = o.createdBy?.name?.toLowerCase().includes(term);
        const salesmanMatch = o.salesman?.name?.toLowerCase().includes(term);
        const distMatch = o.distributor?.name?.toLowerCase().includes(term);
        const ssMatch = o.superStockist?.name?.toLowerCase().includes(term);
        if (!numMatch && !fromMatch && !creatorMatch && !salesmanMatch && !distMatch && !ssMatch) {
          return false;
        }
      }
      return true;
    });
  }, [orders, searchTerm, statusFilter]);

  // Build the complete hierarchical tree
  const treeData = useMemo(() => {
    const superStockists = users.filter((u) => u.role === 'Super Stockist');
    const distributors = users.filter((u) => u.role === 'Distributor');

    // Create SS nodes map
    const ssMap = new Map();
    superStockists.forEach((ss) => {
      ssMap.set(ss._id.toString(), {
        id: `ss_${ss._id}`,
        name: ss.name,
        email: ss.email,
        type: 'super_stockist',
        distributorsMap: new Map(),
        asesMap: new Map(),
        ssOrders: [],
        stats: { total: 0, pending: 0, delivered: 0, value: 0 },
      });
    });

    // Create Direct Distributors group
    const directDistMap = new Map();

    // Map Distributors to their respective SS or Direct map
    distributors.forEach((dist) => {
      const distNode = {
        id: `dist_${dist._id}`,
        name: dist.name,
        email: dist.email,
        type: 'distributor',
        salesmenMap: new Map(),
        asmsMap: new Map(),
        distOrders: [], // Orders placed by distributor themselves
        stats: { total: 0, pending: 0, delivered: 0, value: 0 },
      };

      const parentSSId = dist.superStockistId ? dist.superStockistId.toString() : null;
      if (parentSSId && ssMap.has(parentSSId)) {
        ssMap.get(parentSSId).distributorsMap.set(dist._id.toString(), distNode);
      } else {
        directDistMap.set(dist._id.toString(), distNode);
      }
    });

    const updateStats = (stats, order) => {
      stats.total += 1;
      if (order.status === 'Pending') stats.pending += 1;
      if (order.status === 'Delivered') stats.delivered += 1;
      stats.value += order.grandTotal || 0;
    };

    // Helper to find or create a distributor node if not in map
    const resolveDistributorNode = (distId, distName) => {
      if (!distId) return null;
      const dIdStr = distId.toString();

      // Check in SS maps
      for (const ssNode of ssMap.values()) {
        if (ssNode.distributorsMap.has(dIdStr)) {
          return ssNode.distributorsMap.get(dIdStr);
        }
      }
      // Check in Direct Dist map
      if (directDistMap.has(dIdStr)) {
        return directDistMap.get(dIdStr);
      }
      // If distributor wasn't in users list, create under Direct Dist
      const newNode = {
        id: `dist_${dIdStr}`,
        name: distName || 'Unknown Distributor',
        type: 'distributor',
        salesmenMap: new Map(),
        asmsMap: new Map(),
        distOrders: [],
        stats: { total: 0, pending: 0, delivered: 0, value: 0 },
      };
      directDistMap.set(dIdStr, newNode);
      return newNode;
    };

    // Process each order into the hierarchy
    filteredOrders.forEach((order) => {
      const role = order.createdByRole;
      const creatorId = order.createdBy?._id?.toString() || order.createdBy?.toString();
      const creatorName = order.createdBy?.name || 'User';

      // 1. Salesman Order
      if (role === 'Salesman' || order.salesman) {
        const distId = order.distributor?._id || order.distributor || order.orderTo?._id || order.orderTo;
        const distName = order.distributor?.name || order.orderTo?.name || 'Distributor';
        const distNode = resolveDistributorNode(distId, distName);

        if (distNode) {
          updateStats(distNode.stats, order);

          const smId = order.salesman?._id?.toString() || creatorId || 'unknown_sm';
          const smName = order.salesman?.name || creatorName;

          if (!distNode.salesmenMap.has(smId)) {
            distNode.salesmenMap.set(smId, {
              id: `sm_${distNode.id}_${smId}`,
              name: smName,
              type: 'salesman',
              orders: [],
              stats: { total: 0, pending: 0, delivered: 0, value: 0 },
            });
          }
          const smNode = distNode.salesmenMap.get(smId);
          updateStats(smNode.stats, order);
          smNode.orders.push(order);
        }
      }
      // 2. ASM Order (placed on behalf of Distributor)
      else if (role === 'ASM') {
        const distId = order.distributor?._id || order.distributor;
        const distName = order.distributor?.name || 'Distributor';
        const distNode = resolveDistributorNode(distId, distName);

        if (distNode) {
          updateStats(distNode.stats, order);

          if (!distNode.asmsMap.has(creatorId)) {
            distNode.asmsMap.set(creatorId, {
              id: `asm_${distNode.id}_${creatorId}`,
              name: creatorName,
              type: 'asm',
              orders: [],
              stats: { total: 0, pending: 0, delivered: 0, value: 0 },
            });
          }
          const asmNode = distNode.asmsMap.get(creatorId);
          updateStats(asmNode.stats, order);
          asmNode.orders.push(order);
        }
      }
      // 3. Distributor Order (placed by Distributor to SS or Company)
      else if (role === 'Distributor') {
        const distId = creatorId;
        const distName = creatorName;
        const distNode = resolveDistributorNode(distId, distName);

        if (distNode) {
          updateStats(distNode.stats, order);
          distNode.distOrders.push(order);
        }
      }
      // 4. ASE Order (placed on behalf of Super Stockist)
      else if (role === 'ASE') {
        const ssId = order.superStockist?._id?.toString() || order.superStockist?.toString();
        if (ssId && ssMap.has(ssId)) {
          const ssNode = ssMap.get(ssId);
          updateStats(ssNode.stats, order);

          if (!ssNode.asesMap.has(creatorId)) {
            ssNode.asesMap.set(creatorId, {
              id: `ase_${ssNode.id}_${creatorId}`,
              name: creatorName,
              type: 'ase',
              orders: [],
              stats: { total: 0, pending: 0, delivered: 0, value: 0 },
            });
          }
          const aseNode = ssNode.asesMap.get(creatorId);
          updateStats(aseNode.stats, order);
          aseNode.orders.push(order);
        }
      }
      // 5. Super Stockist Order (placed by SS to Company)
      else if (role === 'Super Stockist') {
        const ssId = creatorId;
        if (ssMap.has(ssId)) {
          const ssNode = ssMap.get(ssId);
          updateStats(ssNode.stats, order);
          ssNode.ssOrders.push(order);
        }
      }
    });

    // Assemble SS tree nodes
    const ssNodes = [];
    for (const ssNode of ssMap.values()) {
      const children = [];

      // SS Sent Orders
      if (ssNode.ssOrders.length > 0) {
        children.push({
          id: `${ssNode.id}_sent`,
          name: 'Orders to RGDG Agro India',
          type: 'order_group',
          orders: ssNode.ssOrders,
          stats: {
            total: ssNode.ssOrders.length,
            pending: ssNode.ssOrders.filter((o) => o.status === 'Pending').length,
            delivered: ssNode.ssOrders.filter((o) => o.status === 'Delivered').length,
            value: ssNode.ssOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0),
          },
        });
      }

      // ASEs
      for (const aseNode of ssNode.asesMap.values()) {
        children.push({
          ...aseNode,
          children: [
            {
              id: `${aseNode.id}_list`,
              type: 'order_list',
              orders: aseNode.orders,
            },
          ],
        });
      }

      // Distributors under SS
      for (const distNode of ssNode.distributorsMap.values()) {
        const distChildren = [];

        // Salesmen
        for (const smNode of distNode.salesmenMap.values()) {
          distChildren.push({
            ...smNode,
            children: [
              {
                id: `${smNode.id}_list`,
                type: 'order_list',
                orders: smNode.orders,
              },
            ],
          });
        }

        // ASMs
        for (const asmNode of distNode.asmsMap.values()) {
          distChildren.push({
            ...asmNode,
            children: [
              {
                id: `${asmNode.id}_list`,
                type: 'order_list',
                orders: asmNode.orders,
              },
            ],
          });
        }

        // Distributor Sent Orders
        if (distNode.distOrders.length > 0) {
          distChildren.push({
            id: `${distNode.id}_sent`,
            name: 'Distributor Orders to SS / Company',
            type: 'order_group',
            orders: distNode.distOrders,
            stats: {
              total: distNode.distOrders.length,
              pending: distNode.distOrders.filter((o) => o.status === 'Pending').length,
              delivered: distNode.distOrders.filter((o) => o.status === 'Delivered').length,
              value: distNode.distOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0),
            },
          });
        }

        // Bubble up distributor stats to SS
        updateStats(ssNode.stats, { status: '', grandTotal: distNode.stats.value });
        ssNode.stats.total += distNode.stats.total;
        ssNode.stats.pending += distNode.stats.pending;
        ssNode.stats.delivered += distNode.stats.delivered;

        children.push({ ...distNode, children: distChildren });
      }

      ssNodes.push({ ...ssNode, children });
    }

    // Assemble Direct Distributors group
    const directDistNodes = [];
    const directStats = { total: 0, pending: 0, delivered: 0, value: 0 };

    for (const distNode of directDistMap.values()) {
      const distChildren = [];

      for (const smNode of distNode.salesmenMap.values()) {
        distChildren.push({
          ...smNode,
          children: [
            {
              id: `${smNode.id}_list`,
              type: 'order_list',
              orders: smNode.orders,
            },
          ],
        });
      }

      for (const asmNode of distNode.asmsMap.values()) {
        distChildren.push({
          ...asmNode,
          children: [
            {
              id: `${asmNode.id}_list`,
              type: 'order_list',
              orders: asmNode.orders,
            },
          ],
        });
      }

      if (distNode.distOrders.length > 0) {
        distChildren.push({
          id: `${distNode.id}_sent`,
          name: 'Distributor Direct Orders to Company',
          type: 'order_group',
          orders: distNode.distOrders,
          stats: {
            total: distNode.distOrders.length,
            pending: distNode.distOrders.filter((o) => o.status === 'Pending').length,
            delivered: distNode.distOrders.filter((o) => o.status === 'Delivered').length,
            value: distNode.distOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0),
          },
        });
      }

      directStats.total += distNode.stats.total;
      directStats.pending += distNode.stats.pending;
      directStats.delivered += distNode.stats.delivered;
      directStats.value += distNode.stats.value;

      directDistNodes.push({ ...distNode, children: distChildren });
    }

    const rootChildren = [...ssNodes];
    if (directDistNodes.length > 0) {
      rootChildren.push({
        id: 'direct_dist_group',
        name: 'Direct Distributors (No SS)',
        type: 'direct_group',
        stats: directStats,
        children: directDistNodes,
      });
    }

    // Calculate Root Overall Stats
    const rootStats = { total: 0, pending: 0, delivered: 0, value: 0 };
    filteredOrders.forEach((o) => {
      rootStats.total += 1;
      if (o.status === 'Pending') rootStats.pending += 1;
      if (o.status === 'Delivered') rootStats.delivered += 1;
      rootStats.value += o.grandTotal || 0;
    });

    return {
      id: 'root',
      name: 'RGDG Agro India (Company)',
      type: 'company',
      stats: rootStats,
      children: rootChildren,
    };
  }, [orders, users, filteredOrders]);

  // Role style configuration
  const getNodeConfig = (type) => {
    switch (type) {
      case 'company':
        return {
          icon: Building2,
          colorClass: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
          badgeText: 'Company Root',
        };
      case 'super_stockist':
        return {
          icon: Box,
          colorClass: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
          badgeText: 'Super Stockist',
        };
      case 'distributor':
        return {
          icon: Briefcase,
          colorClass: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
          badgeText: 'Distributor',
        };
      case 'asm':
        return {
          icon: UserCheck,
          colorClass: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
          badgeText: 'ASM',
        };
      case 'ase':
        return {
          icon: UserCheck,
          colorClass: 'text-teal-400 border-teal-500/30 bg-teal-500/10',
          badgeText: 'ASE',
        };
      case 'salesman':
        return {
          icon: User,
          colorClass: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
          badgeText: 'Salesman',
        };
      case 'direct_group':
        return {
          icon: Layers,
          colorClass: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
          badgeText: 'Direct Channel',
        };
      case 'order_group':
      default:
        return {
          icon: Send,
          colorClass: 'text-slate-400 border-slate-700 bg-slate-800/40',
          badgeText: 'Orders Group',
        };
    }
  };

  // Render recursive tree node
  const renderTreeNode = (node, depth = 0) => {
    const isExpanded = expandedNodes.has(node.id) || !!searchTerm;
    const config = getNodeConfig(node.type);
    const IconComponent = config.icon;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="space-y-2">
        <div
          onClick={() => hasChildren && toggleExpand(node.id)}
          className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer select-none hover:brightness-110 ${config.colorClass}`}
          style={{
            marginLeft: `${depth * 18}px`,
            backgroundColor: 'var(--c-bg-surface)',
            borderColor: 'var(--c-border)',
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {hasChildren ? (
              <span className="p-1 rounded-lg transition-transform" style={{ backgroundColor: 'var(--c-bg-elevated)' }}>
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </span>
            ) : (
              <span className="w-6" />
            )}
            <IconComponent className="w-5 h-5 shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm sm:text-base tracking-tight" style={{ color: 'var(--c-text-primary)' }}>
                  {node.name}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border" style={{ color: 'var(--c-text-muted)', borderColor: 'var(--c-border)' }}>
                  {config.badgeText}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium shrink-0">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              {node.stats?.pending || 0} Pending
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {node.stats?.delivered || 0} Delivered
            </span>
            <span className="font-bold hidden sm:inline" style={{ color: 'var(--c-text-primary)' }}>
              {formatCurrency(node.stats?.value || 0)}
            </span>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="space-y-2 mt-1">
            {node.children.map((child) => {
              if (child.type === 'order_list') {
                return (
                  <div key={child.id} className="space-y-2" style={{ marginLeft: `${(depth + 1) * 18}px` }}>
                    {child.orders.map((ord) => (
                      <div
                        key={ord._id}
                        className="flex flex-wrap items-center justify-between p-3 rounded-xl border transition-all hover:border-sky-500/40 gap-3"
                        style={{
                          backgroundColor: 'var(--c-bg-elevated)',
                          borderColor: 'var(--c-border)',
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <ShoppingBag className="w-4 h-4 text-sky-400 shrink-0" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sky-400 text-xs sm:text-sm">{ord.orderNumber}</span>
                              <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
                                ({formatDate(ord.createdAt)})
                              </span>
                            </div>
                            <div className="text-xs font-semibold" style={{ color: 'var(--c-text-primary)' }}>
                              From: {ord.orderFrom}
                            </div>
                            <div className="text-[11px]" style={{ color: 'var(--c-text-muted)' }}>
                              By: {ord.createdBy?.name || 'User'} ({ord.createdByRole})
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 ml-auto sm:ml-0">
                          <span className="font-bold text-sm" style={{ color: 'var(--c-text-primary)' }}>
                            {formatCurrency(ord.grandTotal)}
                          </span>
                          <Badge status={ord.status} />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(ord);
                            }}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{
                              backgroundColor: 'var(--c-bg-surface)',
                              color: 'var(--c-text-secondary)',
                            }}
                            title="View Order Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }
              return renderTreeNode(child, depth + 1);
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--c-text-primary)' }}>
            Order Hierarchy View
          </h1>
          <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
            Complete breakdown of orders grouped by Super Stockists, Distributors, ASMs, ASEs, and Salesmen
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => expandAll(treeData.children)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium border transition-all"
            style={{ backgroundColor: 'var(--c-bg-surface)', borderColor: 'var(--c-border)', color: 'var(--c-text-secondary)' }}
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 rounded-xl text-xs font-medium border transition-all"
            style={{ backgroundColor: 'var(--c-bg-surface)', borderColor: 'var(--c-border)', color: 'var(--c-text-secondary)' }}
          >
            Collapse All
          </button>
          <button
            onClick={fetchData}
            className="p-2 rounded-xl border transition-all"
            style={{ backgroundColor: 'var(--c-bg-surface)', borderColor: 'var(--c-border)', color: 'var(--c-text-secondary)' }}
            title="Refresh Hierarchy"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className="p-4 rounded-2xl border shadow-sm flex flex-col sm:flex-row items-center gap-4"
        style={{
          backgroundColor: 'var(--c-bg-surface)',
          borderColor: 'var(--c-border)',
        }}
      >
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--c-text-muted)' }} />
          <input
            type="text"
            placeholder="Search by order #, shop name, salesman, or distributor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border outline-none focus:ring-2 focus:ring-sky-500/50"
            style={{
              backgroundColor: 'var(--c-bg-input)',
              borderColor: 'var(--c-border)',
              color: 'var(--c-text-primary)',
            }}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['All', 'Pending', 'Delivered'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                statusFilter === st
                  ? 'bg-sky-500/15 text-sky-400 border-sky-500/30 font-bold'
                  : 'hover:bg-slate-800/40'
              }`}
              style={statusFilter === st ? {} : { color: 'var(--c-text-muted)', borderColor: 'var(--c-border)' }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Tree Content */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
            Building order hierarchy tree...
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {renderTreeNode(treeData, 0)}
        </div>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onStatusChanged={fetchData}
      />
    </div>
  );
};
