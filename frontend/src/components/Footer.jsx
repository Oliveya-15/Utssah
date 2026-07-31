import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import InstagramIcon from './InstagramIcon.jsx';
import api from '../api/axios.js';
import { useToast } from '../context/ToastContext.jsx';
import ScallopDivider from './ScallopDivider.jsx';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const { data } = await api.post('/newsletter', { email });
      showToast(data.message, 'success');
      setEmail('');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-indigo_ink text-white/90 pt-0">
      <div style={{ '--scallop-color': '#362A6B' }}>
        <ScallopDivider color="#FFF8EF" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-8">
        {/* Newsletter */}
        <div className="bg-indigo_ink-dark/60 border border-white/10 rounded-3xl p-6 sm:p-8 mb-14 flex flex-col md:flex-row items-center justify-between gap-5">
          <div>
            <h3 className="font-display font-bold text-2xl text-white mb-1">Join the Utsaah family 🌸</h3>
            <p className="text-white/60 text-sm">Get first dibs on new collections, festive offers &amp; behind-the-scenes crafting.</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 md:w-64 rounded-full px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-marigold"
            />
            <button
              disabled={loading}
              className="btn-sticker bg-marigold text-ink px-5 py-3 text-sm hover:bg-marigold-light disabled:opacity-60"
            >
              <Send size={16} /> {loading ? '...' : 'Join'}
            </button>
          </form>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🧶</span>
              <span className="font-display font-bold text-xl text-white">Utsaah</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Handcrafted with zeal — crochet, custom gifts &amp; decor made just for you.
            </p>
            <a
              href="https://www.instagram.com/utsaah_._"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-marigold hover:text-marigold-light"
            >
              <InstagramIcon size={16} /> @utsaah_._
            </a>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-3">Shop</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link to="/shop" className="hover:text-marigold">All Products</Link></li>
              <li><Link to="/shop?search=crochet" className="hover:text-marigold">Crochet Items</Link></li>
              <li><Link to="/shop?search=gift" className="hover:text-marigold">Customized Gifts</Link></li>
              <li><Link to="/custom-orders" className="hover:text-marigold">Custom Orders</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-3">Help</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link to="/contact" className="hover:text-marigold">Contact Us</Link></li>
              <li><Link to="/profile/orders" className="hover:text-marigold">Track Order</Link></li>
              <li><Link to="/profile/returns" className="hover:text-marigold">Returns &amp; Refunds</Link></li>
              <li><Link to="/about" className="hover:text-marigold">About Utsaah</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-3">Get in touch</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li className="flex items-center gap-2"><Mail size={14} /> hello@utsaah.com</li>
              <li className="flex items-center gap-2"><Phone size={14} /> +91 98765 43210</li>
              <li className="flex items-center gap-2"><MapPin size={14} /> Made with love, shipped anywhere in India</li>
            </ul>
          </div>
        </div>

        <hr className="border-white/10" />
        <p className="text-center text-xs text-white/40 pt-6">
          © {new Date().getFullYear()} Utsaah. All rights reserved. Handmade with 💛
        </p>
      </div>
    </footer>
  );
};

export default Footer;
