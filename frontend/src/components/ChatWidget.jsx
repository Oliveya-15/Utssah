import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

// A lightweight, rule-based FAQ assistant. It matches keywords in the
// visitor's message against a small knowledge base — no external AI API
// key required, so it works instantly out of the box. Swap `answerFor()`
// with a real LLM API call later if you want a smarter assistant.
const FAQS = [
  { keywords: ['shipping', 'deliver', 'delivery time', 'how long'], answer: 'Most items are handmade to order and take 2–10 days to craft (shown on each product page), plus 3–5 days for delivery across India. You can track your order anytime from My Orders 📦' },
  { keywords: ['return', 'refund'], answer: 'We accept returns within 7 days of delivery for damaged or defective items. Once approved, refunds are credited instantly to your Utsaah Wallet, or in 5–7 business days to your original payment method 💛' },
  { keywords: ['custom', 'personalise', 'personalize', 'customise', 'customize'], answer: 'We love custom orders! Head to our Custom Orders page to share your idea, inspiration photos, colours and size — our team replies within 1 business day 🧶' },
  { keywords: ['cancel'], answer: 'You can cancel an order anytime before we start crafting it (from My Orders → Cancel Order). Once production begins, cancellation isn\u2019t possible since each piece is made just for you.' },
  { keywords: ['payment', 'pay', 'razorpay', 'upi', 'card'], answer: 'We accept UPI, cards, netbanking and wallets securely via Razorpay. Your payment details are never stored on our servers 🔒' },
  { keywords: ['coupon', 'discount', 'offer', 'promo'], answer: 'Keep an eye on your inbox and our Instagram @utsaah_._ for seasonal offers! New here? Try code WELCOME10 at checkout for 10% off 🎉' },
  { keywords: ['wallet'], answer: 'Your Utsaah Wallet holds refunds and credits, which you can use directly at checkout to pay for future orders 💰' },
  { keywords: ['contact', 'whatsapp', 'phone', 'call', 'email'], answer: 'You can reach our team anytime via the Contact page, or email hello@utsaah.com — we typically respond within a business day 💌' },
  { keywords: ['material', 'yarn', 'fabric', 'made of'], answer: 'Our crochet pieces are handmade using soft, skin-friendly cotton and acrylic yarns. Exact material is listed under Specifications on each product page 🧵' },
  { keywords: ['track', 'order status', 'where is my order'], answer: 'You can track your order\u2019s live status — from crafting to shipping — anytime from My Orders → Order Details 📍' },
  { keywords: ['payment', 'pay', 'upi', 'card', 'qr'], answer: 'We keep payments simple — just scan our UPI QR code at checkout with any UPI app (GPay, PhonePe, Paytm...) and tap "I\'ve Paid" once done. Prefer to chat first? Choose "Confirm on WhatsApp" instead 💬' },
];

const DEFAULT_ANSWER =
  "That's a great question! For anything I can't help with, our team is happy to chat — visit the Contact page and we'll get back to you within a business day 💛";

const answerFor = (text) => {
  const lower = text.toLowerCase();
  const match = FAQS.find((f) => f.keywords.some((k) => lower.includes(k)));
  return match ? match.answer : DEFAULT_ANSWER;
};

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hi! I'm the Utsaah Assistant 🌸 Ask me about shipping, returns, custom orders or payments!" },
  ]);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { from: 'user', text: trimmed }]);
    setInput('');
    setTimeout(() => {
      setMessages((prev) => [...prev, { from: 'bot', text: answerFor(trimmed) }]);
    }, 500);
  };

  const quickQuestions = ['Shipping time?', 'Return policy?', 'Custom orders?'];

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 left-5 z-50 w-14 h-14 rounded-full bg-rani text-white shadow-card flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="Chat with Utsaah Assistant"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {open && (
        <div className="fixed bottom-24 left-5 z-50 w-[calc(100vw-2.5rem)] max-w-sm h-[28rem] bg-white rounded-3xl shadow-card border-2 border-ink/5 flex flex-col overflow-hidden animate-popIn">
          <div className="bg-rani text-white px-4 py-3.5 flex items-center gap-2">
            <Sparkles size={18} />
            <div>
              <p className="font-display font-bold text-sm leading-tight">Utsaah Assistant</p>
              <p className="text-[11px] text-white/80">Usually replies instantly</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 bg-blush/30">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-snug ${
                    m.from === 'user' ? 'bg-rani text-white rounded-br-sm' : 'bg-white text-ink rounded-bl-sm shadow-soft'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="px-3 pt-2 flex gap-1.5 flex-wrap bg-white">
            {quickQuestions.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="text-[11px] font-semibold bg-blush text-ink/70 px-2.5 py-1.5 rounded-full hover:bg-marigold/40"
              >
                {q}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="p-3 flex gap-2 bg-white border-t border-ink/5"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question…"
              className="flex-1 bg-blush/60 rounded-full px-4 py-2.5 text-sm focus:outline-none"
            />
            <button type="submit" className="w-10 h-10 rounded-full bg-rani text-white flex items-center justify-center shrink-0">
              <Send size={16} />
            </button>
          </form>
          <p className="text-center text-[10px] text-ink/30 pb-2">
            Need a human? <Link to="/contact" className="underline">Contact us</Link>
          </p>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
