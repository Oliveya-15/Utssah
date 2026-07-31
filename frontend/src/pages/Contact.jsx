import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, Phone, Send } from 'lucide-react';
import InstagramIcon from '../components/InstagramIcon.jsx';
import api from '../api/axios.js';
import { useToast } from '../context/ToastContext.jsx';

const Contact = () => {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/contact', form);
      showToast(data.message, 'success');
      setForm({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
      <Helmet><title>Contact Us — Utsaah</title></Helmet>
      <div className="text-center mb-12">
        <p className="font-hand text-2xl text-rani mb-1">say hello</p>
        <h1 className="font-display font-bold text-4xl text-ink">Get in Touch</h1>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.3fr] gap-8">
        <div className="space-y-4">
          {[
            { icon: <Mail size={20} />, title: 'Email Us', value: 'hello@utsaah.com', bg: 'bg-blush' },
            { icon: <Phone size={20} />, title: 'Call / WhatsApp', value: '+91 98765 43210', bg: 'bg-mint' },
            { icon: <InstagramIcon size={20} />, title: 'Instagram', value: '@utsaah_._', bg: 'bg-lavender' },
          ].map((c) => (
            <div key={c.title} className={`${c.bg} rounded-3xl p-6 flex items-center gap-4`}>
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-rani shrink-0">{c.icon}</div>
              <div>
                <p className="font-display font-semibold text-ink">{c.title}</p>
                <p className="text-sm text-ink/60">{c.value}</p>
              </div>
            </div>
          ))}
          <div className="bg-white rounded-3xl p-6 shadow-soft">
            <p className="text-sm text-ink/60 leading-relaxed">
              We usually respond within <span className="font-semibold text-ink">1 business day</span>. For urgent
              order queries, please include your order number 📦
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <input name="name" required placeholder="Your Name" value={form.name} onChange={handleChange} className="bg-blush/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rani/40" />
            <input type="email" name="email" required placeholder="Email Address" value={form.email} onChange={handleChange} className="bg-blush/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rani/40" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <input name="phone" placeholder="Phone (optional)" value={form.phone} onChange={handleChange} className="bg-blush/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rani/40" />
            <select name="subject" value={form.subject} onChange={handleChange} className="bg-blush/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rani/40">
              <option>General Inquiry</option>
              <option>Order Query</option>
              <option>Custom Order</option>
              <option>Return / Refund</option>
              <option>Partnership</option>
            </select>
          </div>
          <textarea name="message" required rows={5} placeholder="Your message…" value={form.message} onChange={handleChange} className="w-full bg-blush/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rani/40" />
          <button disabled={loading} className="btn-sticker bg-rani text-white px-7 py-3.5 hover:bg-rani-dark disabled:opacity-60">
            <Send size={16} /> {loading ? 'Sending…' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
