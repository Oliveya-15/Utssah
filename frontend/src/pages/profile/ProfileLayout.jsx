import { NavLink, Outlet } from 'react-router-dom';
import { User, MapPin, Wallet, Package, Star, RotateCcw, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const navItems = [
  { to: '/profile', label: 'Personal Info', icon: User, end: true },
  { to: '/profile/addresses', label: 'Addresses', icon: MapPin },
  { to: '/profile/orders', label: 'My Orders', icon: Package },
  { to: '/profile/wallet', label: 'Wallet', icon: Wallet },
  { to: '/profile/reviews', label: 'My Reviews', icon: Star },
  { to: '/profile/returns', label: 'Returns & Refunds', icon: RotateCcw },
  { to: '/profile/custom-requests', label: 'Custom Requests', icon: Sparkles },
];

const ProfileLayout = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-rani text-white font-display font-bold text-2xl flex items-center justify-center shrink-0">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">Hi, {user?.name}! 👋</h1>
          <p className="text-ink/50 text-sm">{user?.email}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-8 items-start">
        <nav className="bg-white rounded-3xl p-3 shadow-soft lg:sticky lg:top-24 flex lg:flex-col gap-1 overflow-x-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-display font-semibold whitespace-nowrap transition-colors ${
                  isActive ? 'bg-rani text-white' : 'text-ink/60 hover:bg-blush'
                }`
              }
            >
              <item.icon size={16} /> {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;
