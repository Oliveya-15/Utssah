const COLORS = {
  // order statuses
  'Order Received': 'bg-blush text-ink/70',
  'Payment Successful': 'bg-mint text-mehendi-dark',
  'Confirmation Sent': 'bg-lavender text-indigo_ink',
  'Acknowledgement Pending': 'bg-butter text-marigold-dark',
  'Production Started': 'bg-butter text-marigold-dark',
  'Gift Packaging': 'bg-lavender text-indigo_ink',
  'Packed': 'bg-lavender text-indigo_ink',
  'Shipping Assigned': 'bg-lavender text-indigo_ink',
  'Shipped': 'bg-indigo_ink text-white',
  'Delivered': 'bg-mehendi text-white',
  'Completed': 'bg-mehendi text-white',
  'Return Requested': 'bg-marigold text-ink',
  'Return Approved': 'bg-marigold text-ink',
  'Refund Initiated': 'bg-rani/20 text-rani-dark',
  'Refund Completed': 'bg-mehendi text-white',
  'Cancelled': 'bg-ink/10 text-ink/50',
  // generic
  New: 'bg-blush text-ink/70',
  Active: 'bg-mehendi text-white',
  Inactive: 'bg-ink/10 text-ink/50',
};

const StatusPill = ({ status }) => (
  <span className={`inline-block text-[11px] font-display font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${COLORS[status] || 'bg-blush text-ink/60'}`}>
    {status}
  </span>
);

export default StatusPill;
