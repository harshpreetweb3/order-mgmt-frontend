// Currency formatting (INR ₹)
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

// Date formatting
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatDateOnly = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

// Status Badge styling helper
export const getStatusBadgeStyle = (status) => {
  if (status === 'Delivered') {
    return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  }
  return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
};
