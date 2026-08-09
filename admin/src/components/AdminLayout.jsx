import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Layers, ShoppingBag, Users, Tag, RotateCcw,
  Sparkles, Star, MessageSquare, LogOut, Menu, X,
} from 'lucide-react';
import { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext.jsx';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/categories', label: 'Categories', icon: Layers },
  { to: '/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/coupons', label: 'Coupons', icon: Tag },
  { to: '/returns', label: 'Returns & Refunds', icon: RotateCcw },
  { to: '/custom-requests', label: 'Custom Requests', icon: Sparkles },
  { to: '/reviews', label: 'Reviews', icon: Star },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
];

const AdminLayout = () => {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <>
      <div className="px-5 py-6 flex flex-col items-start gap-1">
        <img src="/navbar_logo_white.svg" alt="Utsaah" className="h-10 w-auto" />
        <p className="text-[12px] text-white/40 ml-3">Admin Panel</p>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-display font-semibold transition-colors ${isActive ? 'bg-rani text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon size={17} /> {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-2.5 mb-3 px-1">
          <div className="w-8 h-8 rounded-full bg-rani text-white font-display font-bold text-xs flex items-center justify-center shrink-0">
            {admin?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{admin?.name}</p>
            <p className="text-[10px] text-white/40 truncate">{admin?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:bg-white/5 hover:text-white">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-canvas">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-indigo_ink shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-indigo_ink flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden sticky top-0 z-30 bg-indigo_ink px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/favicon_white.svg" alt="Utsaah" className="h-8 w-auto inline-block" />
            <span className="font-display font-bold text-white">Utsaah Admin</span>
          </div>
          <button onClick={() => setMobileOpen(true)} className="text-white"><Menu size={22} /></button>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
