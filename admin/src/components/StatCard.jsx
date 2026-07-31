const StatCard = ({ icon, label, value, sub, accent = 'bg-rani' }) => (
  <div className="bg-white rounded-3xl p-5 shadow-soft">
    <div className={`w-10 h-10 rounded-xl ${accent} text-white flex items-center justify-center mb-3`}>{icon}</div>
    <p className="text-2xl font-display font-bold text-ink">{value}</p>
    <p className="text-xs font-semibold text-ink/50 mt-0.5">{label}</p>
    {sub && <p className="text-[11px] text-ink/40 mt-1">{sub}</p>}
  </div>
);

export default StatCard;
