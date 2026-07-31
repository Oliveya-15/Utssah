const variants = {
  bestseller: 'bg-marigold text-ink',
  new: 'bg-mehendi text-white',
  madeToOrder: 'bg-indigo_ink text-white',
  sale: 'bg-rani text-white',
  unavailable: 'bg-ink/70 text-white',
};

const Badge = ({ children, variant = 'bestseller', className = '' }) => (
  <span
    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-display font-semibold tracking-wide shadow-sticker ${variants[variant]} ${className}`}
  >
    {children}
  </span>
);

export default Badge;
