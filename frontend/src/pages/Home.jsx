import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Heart, Sparkles, Truck, PackageCheck, Package, Gift, Home as HomeIcon, Scissors, Star } from 'lucide-react';
import InstagramIcon from '../components/InstagramIcon.jsx';
import api, { resolveImage } from '../api/axios.js';
import ProductCard from '../components/ProductCard.jsx';
import ScallopDivider from '../components/ScallopDivider.jsx';
import Loader from '../components/Loader.jsx';

const CATEGORY_STYLES = {
  'Crochet Items': { bg: 'bg-blush', icon: <Package size={40} className="text-ink" /> },
  'Customized Gifts': { bg: 'bg-butter', icon: <Gift size={40} className="text-ink" /> },
  'Home Decor': { bg: 'bg-mint', icon: <HomeIcon size={40} className="text-ink" /> },
  'Handmade Products': { bg: 'bg-lavender', icon: <Sparkles size={40} className="text-ink" /> },
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
        {/* Display serif used only for the hero tagline — professional, warm, theme-appropriate */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,600;0,700;0,900;1,600&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden bg-blush">
        <style>{`
          @keyframes utsaah-mandala-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .utsaah-mandala-spin {
            animation: utsaah-mandala-spin 70s linear infinite;
            will-change: transform;
          }
          @media (prefers-reduced-motion: reduce) {
            .utsaah-mandala-spin { animation: none; }
          }
        `}</style>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-20 sm:pt-20 sm:pb-28 grid md:grid-cols-2 gap-10 items-center">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur px-3.5 py-1.5 rounded-full text-xs font-display font-semibold text-rani shadow-soft mb-5">
              <Sparkles size={14} /> 100% Handmade · Made To Order
            </span>
            <h1
              className="font-bold text-4xl sm:text-5xl lg:text-6xl text-ink leading-[1.08] tracking-tight mb-5"
              style={{ fontFamily: "'Fraunces', ui-serif, Georgia, 'Times New Roman', serif" }}
            >
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
            {/* soft floating background blobs */}
            <div className="absolute -top-8 -right-4 w-36 h-36 bg-marigold/25 rounded-blob animate-floaty hidden sm:block" />
            <div className="absolute -bottom-10 -left-6 w-32 h-32 bg-mehendi/20 rounded-blob animate-floaty hidden sm:block" style={{ animationDelay: '1.5s' }} />
            <div className="absolute top-1/3 -left-3 w-14 h-14 bg-lavender/30 rounded-blob animate-floaty hidden md:block" style={{ animationDelay: '0.8s' }} />

            {/* Hero visual: rotating mandala with the craft photo layered in front — no product imagery */}
            <div className="relative mx-auto w-full max-w-[420px] sm:max-w-[500px] aspect-square">
              {/* soft glow behind the mandala */}
              <div className="absolute inset-8 bg-white/50 rounded-full blur-3xl" />

              {/* rotating mandala */}
              <img
                src="/banner/mandala.png"
                alt=""
                aria-hidden="true"
                className="utsaah-mandala-spin absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
              />
             
              {/* craft photo layered on top of the mandala, in the lower portion, grounded with a soft shadow */}
              <img
                src="/banner/craft-girls.png"
                alt="Two friends happily crocheting and painting handmade crafts together"
                className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[88%] max-w-[420px] drop-shadow-[0_28px_22px_rgba(120,20,45,0.28)]"
              />
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
                  <div className="mb-3 group-hover:scale-110 transition-transform inline-block">
                    {CATEGORY_STYLES[cat.name]?.icon || <Sparkles size={40} className="text-ink" />}
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
                {[
                  { src: '/cat/p1.jpg', alt: 'Custom order 1' },
                  { src: '/cat/p2.jpg', alt: 'Custom order 2' },
                  { src: '/cat/p3.jpg', alt: 'Custom order 3' },
                ].map((img, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-3xl bg-white/10 overflow-hidden ${i === 1 ? '-translate-y-4' : ''}`}
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-cover"
                    />
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
              <div key={i} className="aspect-square rounded-3xl bg-blush flex items-center justify-center overflow-hidden relative group">
                <img
                  src={`/uinsta/u${i}.png`}
                  alt={`Utsaah Instagram ${i}`}
                  className="w-full h-full object-cover"
                />
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