import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, ShoppingBag, User, Search, Menu, X, Bell, LogOut, Package, MapPin, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import api from '../api/axios.js';

const navLinks = [
  { to: '/shop', label: 'Shop' },
  { to: '/custom-orders', label: 'Custom Orders' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const { products: wishlistProducts } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchNotifs = () => {
      api
        .get('/notifications')
        .then((res) => {
          setNotifications(res.data.notifications);
          setUnreadCount(res.data.unreadCount);
        })
        .catch(() => {});
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/shop?search=${encodeURIComponent(searchTerm)}`);
    setSearchTerm('');
  };

  const openNotifs = async () => {
    setNotifOpen((v) => !v);
    if (!notifOpen && unreadCount > 0) {
      await api.put('/notifications/read-all');
      setUnreadCount(0);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-canvas/95 backdrop-blur border-b-2 border-ink/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-[72px] gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-3xl">🧶</span>
            <span className="font-display font-bold text-2xl text-rani">Utsaah</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-full font-display font-semibold text-sm transition-colors ${
                  location.pathname === link.to ? 'bg-rani text-white' : 'text-ink/70 hover:bg-blush'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search - desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xs">
            <div className="relative w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for crochet, gifts…"
                className="w-full bg-blush/70 rounded-full pl-9 pr-4 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-rani/40"
              />
            </div>
          </form>

          {/* Right icons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={openNotifs}
                  className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-blush transition-colors"
                  aria-label="Notifications"
                >
                  <Bell size={20} className="text-ink/70" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rani rounded-full border-2 border-canvas" />
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-2xl shadow-card border-2 border-ink/5 p-2 animate-popIn">
                    <p className="px-3 py-2 font-display font-semibold text-ink">Notifications</p>
                    {notifications.length === 0 ? (
                      <p className="px-3 py-6 text-center text-sm text-ink/40">No notifications yet</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n._id} className="px-3 py-2.5 rounded-xl hover:bg-blush/60">
                          <p className="text-sm font-semibold text-ink">{n.title}</p>
                          <p className="text-xs text-ink/60 mt-0.5">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            <Link
              to="/wishlist"
              className="relative w-10 h-10 hidden sm:flex items-center justify-center rounded-full hover:bg-blush transition-colors"
              aria-label="Wishlist"
            >
              <Heart size={20} className="text-ink/70" />
              {wishlistProducts.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rani text-white text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center">
                  {wishlistProducts.length}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-blush transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag size={20} className="text-ink/70" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rani text-white text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-rani text-white font-display font-bold text-sm"
                >
                  {user?.name?.[0]?.toUpperCase() || <User size={18} />}
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-card border-2 border-ink/5 p-2 animate-popIn">
                    <p className="px-3 py-2 text-sm font-semibold text-ink truncate">Hi, {user?.name?.split(' ')[0]} 👋</p>
                    <hr className="stitch-rule my-1" />
                    <Link to="/profile/orders" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-ink/80 hover:bg-blush">
                      <Package size={16} /> My Orders
                    </Link>
                    <Link to="/profile/addresses" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-ink/80 hover:bg-blush">
                      <MapPin size={16} /> Addresses
                    </Link>
                    <Link to="/profile/wallet" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-ink/80 hover:bg-blush">
                      <Wallet size={16} /> Wallet {user?.walletBalance ? `(₹${user.walletBalance})` : ''}
                    </Link>
                    <Link to="/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-ink/80 hover:bg-blush">
                      <User size={16} /> My Profile
                    </Link>
                    <hr className="stitch-rule my-1" />
                    <button
                      onClick={() => { logout(); navigate('/'); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-rani hover:bg-blush"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-sticker bg-rani text-white px-4 py-2 text-sm hover:bg-rani-dark">
                Login
              </Link>
            )}

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-blush"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t-2 border-ink/5 bg-canvas px-4 py-4 space-y-1 animate-popIn">
          <form onSubmit={handleSearch} className="relative mb-3">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search…"
              className="w-full bg-blush/70 rounded-full pl-9 pr-4 py-2.5 text-sm focus:outline-none"
            />
          </form>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block px-4 py-3 rounded-xl font-display font-semibold text-ink/80 hover:bg-blush"
            >
              {link.label}
            </Link>
          ))}
          <Link to="/wishlist" className="block px-4 py-3 rounded-xl font-display font-semibold text-ink/80 hover:bg-blush">
            Wishlist ({wishlistProducts.length})
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
