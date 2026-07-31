import { X } from 'lucide-react';

const Modal = ({ title, onClose, children, wide = false }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
    <div className={`relative bg-canvas rounded-3xl shadow-card w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto`}>
      <div className="sticky top-0 bg-canvas flex items-center justify-between px-6 py-4 border-b-2 border-ink/5 z-10">
        <h3 className="font-display font-bold text-lg text-ink">{title}</h3>
        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-blush flex items-center justify-center"><X size={18} /></button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

export default Modal;
