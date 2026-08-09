import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { User, Mail, Lock, Phone, Cake } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const Register = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', birthday: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      showToast('Welcome to Utsaah! 🎉', 'success');
      navigate('/');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-blush">
      <Helmet><title>Create Account — Utsaah</title></Helmet>
      <div className="w-full max-w-md bg-white rounded-3xl shadow-card p-8 sm:p-10">
        <div className="text-center mb-8">
          <img src="/favicon.png" alt="Utsaah" className="h-12 w-auto mx-auto" />
          <h1 className="font-display font-bold text-2xl text-ink mt-2">Join Utsaah</h1>
          <p className="text-ink/50 text-sm mt-1">Create your account to start shopping handmade</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
            <input name="name" required placeholder="Full Name" value={form.name} onChange={handleChange}
              className="w-full bg-blush/60 rounded-full pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-rani/40" />
          </div>
          <div className="relative">
            <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
            <input type="email" name="email" required placeholder="Email address" value={form.email} onChange={handleChange}
              className="w-full bg-blush/60 rounded-full pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-rani/40" />
          </div>
          <div className="relative">
            <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
            <input type="password" name="password" required minLength={6} placeholder="Password (min 6 characters)" value={form.password} onChange={handleChange}
              className="w-full bg-blush/60 rounded-full pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-rani/40" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Phone size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
              <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange}
                className="w-full bg-blush/60 rounded-full pl-11 pr-3 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-rani/40" />
            </div>
            <div className="relative">
              <Cake size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
              <input type="date" name="birthday" value={form.birthday} onChange={handleChange}
                className="w-full bg-blush/60 rounded-full pl-11 pr-3 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-rani/40" />
            </div>
          </div>
          <p className="text-[11px] text-ink/40 -mt-1">🎂 Add your birthday for a surprise treat every year!</p>

          <button disabled={loading} className="btn-sticker bg-rani text-white w-full py-3.5 hover:bg-rani-dark disabled:opacity-60">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-ink/50 mt-6">
          Already have an account? <Link to="/login" className="font-semibold text-rani hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
