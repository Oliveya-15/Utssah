import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Upload, X, Sparkles } from 'lucide-react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const CustomOrders = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: user?.name || '', email: user?.email || '', phone: user?.phone || '',
    productType: '', preferredColors: '', preferredSize: '', notes: '', contactPreference: 'WhatsApp',
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFiles = (e) => {
    const files = Array.from(e.target.files).slice(0, 5 - images.length);
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (idx) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach((img) => fd.append('inspirationImages', img));
      await api.post('/custom-requests', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSubmitted(true);
      showToast('Custom order request sent! 🧶', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <p className="text-6xl mb-4">🎉</p>
        <h1 className="font-display font-bold text-3xl text-ink mb-3">Request Received!</h1>
        <p className="text-ink/60 mb-8">
          Thank you, {form.name.split(' ')[0]}! Our team will reach out via {form.contactPreference} within 1 business day
          with ideas and a quote for your custom piece.
        </p>
        <button onClick={() => setSubmitted(false)} className="btn-sticker bg-rani text-white px-6 py-3">
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <Helmet><title>Custom Orders — Utsaah</title></Helmet>
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 bg-blush px-3.5 py-1.5 rounded-full text-xs font-display font-semibold text-rani mb-4">
          <Sparkles size={14} /> Made just for you
        </span>
        <h1 className="font-display font-bold text-4xl text-ink mb-3">Let's Create Something Special</h1>
        <p className="text-ink/60 max-w-lg mx-auto">
          Tell us your idea — a crochet look-alike doll, a personalised gift, custom decor — and our artisans will
          bring it to life.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <input name="name" required placeholder="Your Name" value={form.name} onChange={handleChange} className="bg-blush/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rani/40" />
          <input type="email" name="email" required placeholder="Email Address" value={form.email} onChange={handleChange} className="bg-blush/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rani/40" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <input name="phone" required placeholder="Phone / WhatsApp Number" value={form.phone} onChange={handleChange} className="bg-blush/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rani/40" />
          <input name="productType" required placeholder="What would you like made? (e.g. Crochet Doll)" value={form.productType} onChange={handleChange} className="bg-blush/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rani/40" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <input name="preferredColors" placeholder="Preferred Colours" value={form.preferredColors} onChange={handleChange} className="bg-blush/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rani/40" />
          <input name="preferredSize" placeholder="Preferred Size" value={form.preferredSize} onChange={handleChange} className="bg-blush/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rani/40" />
        </div>
        <textarea name="notes" rows={4} placeholder="Tell us more — occasion, inspiration, any specific details…" value={form.notes} onChange={handleChange} className="w-full bg-blush/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rani/40" />

        <div>
          <label className="block text-sm font-display font-semibold text-ink mb-2">Inspiration Photos (optional, up to 5)</label>
          <div className="flex flex-wrap gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden bg-blush">
                <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 w-5 h-5 bg-ink/70 rounded-full text-white flex items-center justify-center">
                  <X size={12} />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-ink/20 flex flex-col items-center justify-center cursor-pointer hover:border-rani text-ink/40 hover:text-rani">
                <Upload size={18} />
                <span className="text-[10px] mt-1">Upload</span>
                <input type="file" accept="image/*" multiple hidden onChange={handleFiles} />
              </label>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-display font-semibold text-ink mb-2">Preferred Contact Method</label>
          <div className="flex gap-3">
            {['WhatsApp', 'Email'].map((opt) => (
              <button
                type="button"
                key={opt}
                onClick={() => setForm({ ...form, contactPreference: opt })}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold ${form.contactPreference === opt ? 'bg-rani text-white' : 'bg-blush text-ink/60'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <button disabled={loading} className="btn-sticker bg-rani text-white w-full py-3.5 hover:bg-rani-dark disabled:opacity-60">
          {loading ? 'Sending…' : 'Submit Custom Order Request'}
        </button>
      </form>
    </div>
  );
};

export default CustomOrders;
