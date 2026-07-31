const Loader = ({ label = 'Loading…', fullScreen = false }) => (
  <div className={`flex flex-col items-center justify-center gap-3 ${fullScreen ? 'min-h-[60vh]' : 'py-16'}`}>
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 rounded-full border-4 border-blush" />
      <div className="absolute inset-0 rounded-full border-4 border-rani border-t-transparent animate-spin" />
    </div>
    <p className="text-sm font-semibold text-ink/50">{label}</p>
  </div>
);

export default Loader;
