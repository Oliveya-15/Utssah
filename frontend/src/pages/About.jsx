import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, Users } from 'lucide-react';
import InstagramIcon from '../components/InstagramIcon.jsx';
import ScallopDivider from '../components/ScallopDivider.jsx';

const About = () => (
  <div>
    <Helmet><title>About Us — Utsaah</title></Helmet>

    <section className="bg-blush py-16 sm:py-24 text-center px-4">
      <p className="font-hand text-3xl text-rani mb-2">our little story</p>
      <h1 className="font-display font-bold text-4xl sm:text-5xl text-ink mb-5">What is Utsaah?</h1>
      <p className="text-ink/60 max-w-xl mx-auto text-lg">
        <span className="font-hand text-2xl text-mehendi">"Utsaah"</span> means enthusiasm, zeal, and joyful energy —
        and that's exactly what goes into every stitch, bead and brushstroke of what we make.
      </p>
    </section>
    <div style={{ '--scallop-color': '#FDEDE7' }}><ScallopDivider color="#FFF8EF" /></div>

    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-6 text-ink/70 leading-relaxed text-lg">
      <p>
        Utsaah began as a small hobby — a handful of crochet flowers made for friends and family — and slowly grew
        into a home for handmade love. Every piece you find here is made to order, by hand, with the same care we'd
        put into a gift for someone we adore.
      </p>
      <p>
        We believe gifting should feel personal. That's why alongside our ready collection of crochet keepsakes,
        customised gifts and cozy home decor, we also craft made-to-order pieces designed just for you — down to the
        colours, the size, and the little details that make it truly yours.
      </p>
    </section>

    <section className="bg-mint py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-3 gap-8 text-center">
        {[
          { icon: <Heart size={26} />, title: '100% Handmade', desc: 'Every product is crafted by hand — no mass production, ever.' },
          { icon: <Sparkles size={26} />, title: 'Made To Order', desc: 'We craft your piece fresh once you order, ensuring quality and freshness.' },
          { icon: <Users size={26} />, title: 'Small & Personal', desc: 'A small team pouring big love into every single order we receive.' },
        ].map((f) => (
          <div key={f.title} className="bg-white rounded-3xl p-8 shadow-soft">
            <div className="w-14 h-14 rounded-full bg-rani/10 text-rani flex items-center justify-center mx-auto mb-4">{f.icon}</div>
            <h3 className="font-display font-semibold text-lg text-ink mb-2">{f.title}</h3>
            <p className="text-sm text-ink/60">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="py-16 text-center px-4">
      <h2 className="font-display font-bold text-3xl text-ink mb-4">Come say hi on Instagram</h2>
      <p className="text-ink/60 mb-6">See our crafting process, new drops, and happy customers.</p>
      <a
        href="https://www.instagram.com/utsaah_._"
        target="_blank" rel="noopener noreferrer"
        className="btn-sticker bg-rani text-white px-7 py-3.5 inline-flex hover:bg-rani-dark"
      >
        <InstagramIcon size={18} /> @utsaah_._
      </a>
      <p className="mt-8">
        <Link to="/shop" className="font-display font-semibold text-ink/60 hover:text-rani">Browse our collection →</Link>
      </p>
    </section>
  </div>
);

export default About;
