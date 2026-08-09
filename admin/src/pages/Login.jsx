import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const Login = () => {
  const { login, isAuthenticated } = useAdminAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigate('/', { replace: true });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      showToast('Welcome back!', 'success');
      navigate('/');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-indigo_ink flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-card p-8 sm:p-10">
        <div className="text-center mb-8">
          <img src="/favicon.png" alt="Utsaah" className="h-12 w-auto inline-block" />
          <h1 className="font-display font-bold text-2xl text-ink mt-2">Utsaah Admin</h1>
          <p className="text-ink/50 text-sm mt-1 flex items-center justify-center gap-1.5">
            <ShieldCheck size={14} /> Authorised personnel only
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              type="email" required placeholder="Admin email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-blush/60 rounded-full pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-rani/40"
            />
          </div>
          <div className="relative">
            <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              type={showPassword ? 'text' : 'password'} required placeholder="Password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-blush/60 rounded-full pl-11 pr-11 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-rani/40"
            />
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/40">
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          <button disabled={loading} className="btn-sticker w-full bg-rani text-white py-3.5 rounded-full font-display font-semibold hover:bg-rani-dark disabled:opacity-60">
            {loading ? 'Logging in…' : 'Login to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
