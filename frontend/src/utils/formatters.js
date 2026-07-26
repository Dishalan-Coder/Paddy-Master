export const formatCurrency = (a) => `Rs. ${Number(a).toLocaleString('en-LK', {minimumFractionDigits: 0, maximumFractionDigits: 2})}`;
export const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-LK', {year:'numeric',month:'short',day:'numeric'}) : '—';
export const formatDateTime = (d) => d ? new Date(d).toLocaleDateString('en-LK', {year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) : '—';
export const daysUntil = (d) => Math.ceil((new Date(d) - new Date()) / (1000*60*60*24));
export const formatGrowthStage = (s) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
export const formatOrderStatus = formatGrowthStage;
