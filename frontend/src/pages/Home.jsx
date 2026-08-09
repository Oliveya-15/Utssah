import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Heart, Sparkles, Truck, PackageCheck } from 'lucide-react';
import InstagramIcon from '../components/InstagramIcon.jsx';
import api, { resolveImage } from '../api/axios.js';
import ProductCard from '../components/ProductCard.jsx';
import ScallopDivider from '../components/ScallopDivider.jsx';
import Loader from '../components/Loader.jsx';

const CATEGORY_STYLES = {
  'Crochet Items': { bg: 'bg-blush', icon: '🧶' },
  'Customized Gifts': { bg: 'bg-butter', icon: '🎁' },
  'Home Decor': { bg: 'bg-mint', icon: '🏡' },
  'Handmade Products': { bg: 'bg-lavender', icon: '✨' },
};

const Section = ({ id, bg = 'bg-canvas', children, scallopFrom, className = '' }) => (
  <section id={id} className={`${bg} ${className}`}>
    {scallopFrom && (
      <div style={{ '--scallop-color': scallopFrom }}>
        <ScallopDivider color={bg.includes('canvas') ? '#FFF8EF' : undefined} />
      </div>
    )}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">{children}</div>
  </section>
);

const SectionHeading = ({ eyebrow, title, subtitle, center }) => (
  <div className={`mb-10 ${center ? 'text-center' : ''}`}>
    {eyebrow && <p className="font-hand text-2xl text-rani mb-1">{eyebrow}</p>}
    <h2 className="font-display font-bold text-3xl sm:text-4xl text-ink mb-2">{title}</h2>
    {subtitle && <p className="text-ink/60 max-w-xl mx-auto">{subtitle}</p>}
  </div>
);

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState({ featured: [], newArrivals: [], bestSellers: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/categories'), api.get('/products/home/collections')])
      .then(([catRes, colRes]) => {
        setCategories(catRes.data);
        setCollections(colRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Helmet>
        <title>Utsaah</title>
        <meta
          name="description"
          content="Utsaah brings you handmade crochet, personalised gifts and cozy home decor — crafted with love, made to order, just for you."
        />
      </Helmet>

      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden bg-blush">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-20 sm:pt-20 sm:pb-28 grid md:grid-cols-2 gap-10 items-center">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur px-3.5 py-1.5 rounded-full text-xs font-display font-semibold text-rani shadow-soft mb-5">
              <Sparkles size={14} /> 100% Handmade · Made To Order
            </span>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-ink leading-[1.08] mb-5">
              Chhoti <span className="text-rani">Chotti</span>
              <br /> Khushiyan <span className="relative inline-block">
                Chuno...
                <svg className="absolute -bottom-1 left-0 w-full" height="10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0,7 Q25,0 50,7 T100,7" stroke="#F5A524" strokeWidth="5" fill="none" strokeLinecap="round" />
                </svg>
              </span>.
            </h1>
            <p className="text-ink/60 text-lg mb-8 max-w-md">
              At Utsaah — we create little things that bring big smiles.
              From handmade crochet treasures to thoughtful gifts and custom creations, every piece is crafted with love, care, and a personal touch.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/shop" className="btn-sticker bg-rani text-white px-7 py-3.5 hover:bg-rani-dark">
                Shop the Collection <ArrowRight size={18} />
              </Link>
              <Link to="/custom-orders" className="btn-sticker bg-white text-ink px-7 py-3.5 hover:bg-butter">
                Start a Custom Order
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-6 -right-6 w-40 h-40 bg-marigold/30 rounded-blob animate-floaty hidden sm:block" />
            <div className="absolute -bottom-8 -left-4 w-32 h-32 bg-mehendi/20 rounded-blob animate-floaty hidden sm:block" style={{ animationDelay: '1.5s' }} />
            <div className="relative grid grid-cols-2 gap-4">
              <div className="rounded-3xl overflow-hidden shadow-card bg-white p-4 translate-y-6">
                <img src={resolveImage('/uploads/products/placeholder-1.svg')} alt="Crochet handmade item" className="w-full aspect-square object-contain" />
              </div>
              <div className="rounded-3xl overflow-hidden shadow-card bg-white p-4">
                <img src={resolveImage('/uploads/products/placeholder-2.svg')} alt="Customised gift" className="w-full aspect-square object-contain" />
              </div>
              <div className="rounded-3xl overflow-hidden shadow-card bg-white p-4">
                <img src={resolveImage('/uploads/products/placeholder-3.svg')} alt="Home decor item" className="w-full aspect-square object-contain" />
              </div>
              <div className="rounded-3xl overflow-hidden shadow-card bg-white p-4 translate-y-6">
                <img src={resolveImage('/uploads/products/placeholder-4.svg')} alt="Handmade product" className="w-full aspect-square object-contain" />
              </div>
            </div>
          </div>
        </div>
        <div style={{ '--scallop-color': '#FDEDE7' }}>
          <ScallopDivider color="#FFF8EF" />
        </div>
      </section>

      {/* ---------------- TRUST STRIP ---------------- */}
      <div className="bg-canvas border-b-2 border-ink/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { icon: <Heart size={20} />, text: 'Made with Love' },
            { icon: <PackageCheck size={20} />, text: 'Made To Order' },
            { icon: <Truck size={20} />, text: 'Pan-India Delivery' },
            { icon: <Sparkles size={20} />, text: 'Gift-ready Packaging' },
          ].map((f) => (
            <div key={f.text} className="flex flex-col items-center gap-1.5 text-ink/60">
              <div className="text-rani">{f.icon}</div>
              <p className="text-xs font-display font-semibold">{f.text}</p>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <Loader fullScreen />
      ) : (
        <>
          {/* ---------------- CATEGORIES ---------------- */}
          <Section bg="bg-canvas">
            <SectionHeading eyebrow="shop by" title="Our Little Categories" center />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/shop?category=${cat._id}`}
                  className={`${CATEGORY_STYLES[cat.name]?.bg || 'bg-blush'} rounded-3xl p-6 text-center hover:-translate-y-1 transition-transform shadow-soft group`}
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform inline-block">
                    {cat.icon || CATEGORY_STYLES[cat.name]?.icon || '🧶'}
                  </div>
                  <h3 className="font-display font-semibold text-ink text-sm sm:text-base">{cat.name}</h3>
                </Link>
              ))}
            </div>
          </Section>

          {/* ---------------- FEATURED ---------------- */}
          {collections.featured.length > 0 && (
            <Section bg="bg-butter" scallopFrom="#FFF8EF">
              <SectionHeading eyebrow="our favourites" title="Featured Picks" subtitle="Little pieces we can't stop admiring — hand-picked for you." center />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {collections.featured.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
              <div className="text-center mt-10">
                <Link to="/shop?featured=true" className="btn-sticker bg-ink text-white px-6 py-3 hover:bg-ink/90">
                  View All Featured <ArrowRight size={16} />
                </Link>
              </div>
            </Section>
          )}

          {/* ---------------- NEW ARRIVALS ---------------- */}
          {collections.newArrivals.length > 0 && (
            <Section bg="bg-canvas" scallopFrom="#FFF7E0">
              <SectionHeading eyebrow="fresh off the hook" title="New Arrivals" center />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {collections.newArrivals.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            </Section>
          )}

          {/* ---------------- BEST SELLERS ---------------- */}
          {collections.bestSellers.length > 0 && (
            <Section bg="bg-mint" scallopFrom="#FFF8EF">
              <SectionHeading eyebrow="customer favourites" title="Best Sellers" center />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {collections.bestSellers.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            </Section>
          )}

          {/* ---------------- CUSTOM ORDER CTA ---------------- */}
          <Section bg="bg-indigo_ink" scallopFrom="#EFF6EC" className="text-white">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="font-hand text-2xl text-marigold mb-1">got something special in mind?</p>
                <h2 className="font-display font-bold text-3xl sm:text-4xl mb-4">We craft custom orders too 🎨</h2>
                <p className="text-white/60 mb-6 max-w-md">
                  Share a photo, pick your colours, tell us the occasion — our artisans will bring your idea to life, stitch by stitch.
                </p>
                <Link to="/custom-orders" className="btn-sticker bg-marigold text-ink px-7 py-3.5 hover:bg-marigold-light">
                  Start Your Custom Order <ArrowRight size={18} />
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {['🧸', '💐', '🎀'].map((emoji, i) => (
                  <div key={i} className={`aspect-square rounded-3xl bg-white/10 flex items-center justify-center text-5xl ${i === 1 ? '-translate-y-4' : ''}`}>
                    {emoji}
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* ---------------- INSTAGRAM ---------------- */}
          <Section bg="bg-canvas">
            <SectionHeading eyebrow="follow along" title="Utsaah on Instagram" subtitle="Behind-the-scenes crafting, new drops &amp; happy customers." center />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square rounded-3xl bg-blush flex items-center justify-center text-4xl overflow-hidden relative group">
                  {['🧶', '🎁', '🏡', '✨'][i - 1]}
                  <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-colors flex items-center justify-center">
                    <InstagramIcon className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={26} />
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <a
                href="https://www.instagram.com/utsaah_._"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-display font-semibold text-rani hover:text-rani-dark"
              >
                <InstagramIcon size={18} /> @utsaah_._ — Follow for more
              </a>
            </div>
          </Section>
        </>
      )}
    </div>
  );
};

export default Home;
