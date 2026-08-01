import React from 'react';
import { Search, Filter, X } from 'lucide-react';

export const OrderFilterBar = ({
  search,
  setSearch,
  status,
  setStatus,
  date,
  setDate,
  distributor,
  setDistributor,
  distributorsList = [],
  superStockist,
  setSuperStockist,
  superStockistsList = [],
  onReset,
}) => {
  const hasActiveFilters = search || status !== 'All' || date || distributor || superStockist;

  const inputStyle = {
    backgroundColor: 'var(--c-bg-input)',
    borderColor: 'var(--c-border)',
    color: 'var(--c-text-primary)',
  };

  const selectStyle = {
    ...inputStyle,
    WebkitAppearance: 'auto',
  };

  return (
    <div
      className="rounded-2xl p-4 mb-6 shadow-md border"
      style={{
        backgroundColor: 'var(--c-bg-surface)',
        borderColor: 'var(--c-border)',
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search input */}
        <div className="relative lg:col-span-2">
          <Search
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--c-text-muted)' }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order #, Shop, Salesman..."
            className="w-full rounded-xl pl-10 pr-3 py-2 text-sm border focus:outline-none focus:border-sky-500 transition-colors"
            style={inputStyle}
          />
        </div>

        {/* Status Dropdown */}
        <div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-xl px-3 py-2 text-sm border focus:outline-none focus:border-sky-500 transition-colors"
            style={selectStyle}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending (Orange)</option>
            <option value="Delivered">Delivered (Green)</option>
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl px-3 py-2 text-sm border focus:outline-none focus:border-sky-500 transition-colors"
            style={inputStyle}
          />
        </div>

        {/* Clear Filters Button */}
        <div>
          {hasActiveFilters ? (
            <button
              onClick={onReset}
              className="w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors"
              style={{
                backgroundColor: 'var(--c-bg-elevated)',
                color: 'var(--c-text-secondary)',
              }}
            >
              <X className="w-4 h-4" />
              <span>Clear Filters</span>
            </button>
          ) : (
            <div
              className="hidden lg:flex items-center justify-center text-xs gap-1.5 h-full"
              style={{ color: 'var(--c-text-muted)' }}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter Results</span>
            </div>
          )}
        </div>
      </div>

      {/* Advanced filters row */}
      {(distributorsList.length > 0 || superStockistsList.length > 0) && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3"
          style={{ borderTop: '1px solid var(--c-border)' }}
        >
          {distributorsList.length > 0 && (
            <div>
              <label
                className="block text-[11px] font-semibold mb-1"
                style={{ color: 'var(--c-text-muted)' }}
              >
                Filter by Distributor
              </label>
              <select
                value={distributor}
                onChange={(e) => setDistributor(e.target.value)}
                className="w-full rounded-xl px-3 py-1.5 text-xs border focus:outline-none focus:border-sky-500"
                style={selectStyle}
              >
                <option value="">All Distributors</option>
                {distributorsList.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {superStockistsList.length > 0 && (
            <div>
              <label
                className="block text-[11px] font-semibold mb-1"
                style={{ color: 'var(--c-text-muted)' }}
              >
                Filter by Super Stockist
              </label>
              <select
                value={superStockist}
                onChange={(e) => setSuperStockist(e.target.value)}
                className="w-full rounded-xl px-3 py-1.5 text-xs border focus:outline-none focus:border-sky-500"
                style={selectStyle}
              >
                <option value="">All Super Stockists</option>
                {superStockistsList.map((ss) => (
                  <option key={ss._id} value={ss._id}>
                    {ss.name} ({ss.email})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
