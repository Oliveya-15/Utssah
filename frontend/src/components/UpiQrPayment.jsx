import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { CheckCircle2, Smartphone, MessageCircle } from 'lucide-react';

// Builds a standard UPI deep link.
const buildUpiLink = ({ upiId, ownerName, amount, note }) => {
  const params = new URLSearchParams({
    pa: upiId,
    pn: ownerName,
    am: String(amount),
    cu: 'INR',
    tn: note,
  });
  return `upi://pay?${params.toString()}`;
};

const UpiQrPayment = ({
  upiId,
  ownerName,
  amount,
  orderNumber,
  whatsappNumber,
  onConfirmPaid,
  confirming,
}) => {
  const canvasRef = useRef(null);
  const [upiLink, setUpiLink] = useState('');

  useEffect(() => {
    const note = `Utsaah Order ${orderNumber}`;
    const link = buildUpiLink({ upiId, ownerName, amount, note });
    setUpiLink(link);

    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, link, {
        width: 220,
        margin: 1,
        color: { dark: '#2A1B3D', light: '#FFFFFF' },
      }).catch((err) => {
        console.error('Failed to generate QR Code:', err);
      });
    }
  }, [upiId, ownerName, amount, orderNumber]);

  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        `Hi! I've placed order ${orderNumber} on Utsaah (₹${amount}) and would like to confirm before/while paying.`
      )}`
    : null;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-card text-center">
      <p className="font-display font-semibold text-ink mb-1">Scan to Pay via UPI</p>
      <p className="text-2xl font-display font-bold text-rani mb-4">₹{amount}</p>

      <div className="inline-block bg-blush rounded-2xl p-4 mb-3">
        <canvas ref={canvasRef} />
      </div>
      <p className="text-xs text-ink/50 mb-1">
        Paying to <span className="font-semibold text-ink">{ownerName}</span>
      </p>
      <p className="text-[11px] text-ink/40 mb-4 font-mono break-all">{upiId}</p>

      {/* FIXED: Added missing '<a' */}
      <a
        href={upiLink}
        className="btn-sticker bg-marigold text-ink w-full py-3 text-sm mb-3 sm:hidden inline-flex items-center justify-center gap-2"
      >
        <Smartphone size={16} /> Open in UPI App
      </a>

      <button
        onClick={onConfirmPaid}
        disabled={confirming}
        className="btn-sticker bg-rani text-white w-full py-3.5 hover:bg-rani-dark disabled:opacity-60 inline-flex items-center justify-center gap-2"
      >
        <CheckCircle2 size={18} /> {confirming ? 'Notifying…' : "I've Paid — Notify Us"}
      </button>

      {whatsappHref && (
        /* FIXED: Added missing '<a' */
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-mehendi-dark mt-4 hover:underline"
        >
          <MessageCircle size={14} /> Prefer to confirm on WhatsApp instead?
        </a>
      )}
    </div>
  );
};

export default UpiQrPayment;