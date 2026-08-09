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
      <h1 className="font-display font-bold text-4xl sm:text-5xl text-ink mb-5">
        What is <img src="/images/navbar_logo.png" alt="Utsaah" className="h-12 w-auto inline-block align-middle" />?
      </h1>
      <p className="text-ink/60 max-w-xl mx-auto text-lg">
        <span className="font-hand text-2xl text-mehendi">"Utsaah"</span> means excitement, enthusiasm, and joyful energy — and that is exactly what Utsaah has been for us.
      </p>
    </section>
    <div style={{ '--scallop-color': '#FDEDE7' }}><ScallopDivider color="#FFF8EF" /></div>

    {/* ── Story + Image section ── */}
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
      <div className="flex flex-col md:flex-row items-start gap-10 md:gap-14">

        {/* Larger Image with soft curvy frame */}
        <div className="relative shrink-0 w-full max-w-[320px] sm:max-w-[360px] md:w-[400px] mx-auto md:mx-0">

          {/* soft outer glow */}
          <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-br from-rani/20 via-mehendi/15 to-blush/50 blur-md opacity-80" />

          {/* main elegant frame */}
          <div className="relative rounded-[2.8rem] overflow-hidden border-[7px] border-white 
                          shadow-[0_20px_50px_-12px_rgba(180,80,100,0.22)] 
                          ring-1 ring-rani/10 bg-white">
            <img
              src="/images/Utsaah.jpeg"
              alt="The two creators of Utsaah"
              className="w-full aspect-[4/5] object-cover object-center"
            />
          </div>

          {/* decorative heart accent */}
          <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full 
                          bg-mint border-[5px] border-white shadow-lg 
                          flex items-center justify-center">
            <Heart size={20} className="text-rani fill-rani/30" />
          </div>
        </div>

        {/* Text content with beautiful emphasis */}
        <div className="flex-1 space-y-5 text-ink/70 leading-relaxed text-lg min-w-0 pt-1">
          <p>
            It is the dream of two girls who grew up with crayons, origami, colourful papers, stitches, model-making and endless art & craft experiments. From making <span className="font-hand text-xl text-mehendi">handmade gifts</span> for family and friends to dreaming of becoming fashion designers and owning our own <span className="font-semibold text-rani">creative space</span>, Utsaah began long before it had a name.
          </p>
          <p>
            Like many Indian families, studies came first. Our creative dreams slowly took a back seat as we pursued our BCA and worked towards building a corporate career. But during our third year, we decided to give our <span className="font-hand text-xl text-mehendi">childhood dream</span> a little space again. What started as a simple hobby with an Instagram page and a few handmade creations soon turned into something we never expected.
          </p>
          <p>
            Today, we have delivered <span className="font-semibold text-rani">100+ orders</span>, created customised pieces from our customers' ideas, and made products for people we never even knew before. The love from our friends, family, strangers and our wonderful repeat customers gave <span className="font-hand text-xl text-mehendi">Utsaah</span> its wings. And now, this website is our next step — bringing together our love for creativity and the tech skills we've learned along the way.
          </p>
          <p className="text-ink/80">
            Utsaah is our little reminder that pursuing a dream doesn't mean leaving your responsibilities behind. You can study, build a career, and still make space for the things that make your <span className="font-hand text-xl text-rani">heart happy</span>. We are excited to keep creating, keep learning, and keep turning your ideas into little <span className="font-semibold text-mehendi">handmade joys</span>. This is only the beginning, and we're so happy to have you along for the journey. 💗
          </p>
        </div>
      </div>
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