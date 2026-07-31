// Signature "crochet-edge" scalloped divider used between homepage sections.
// `color` = the color of the section ABOVE the divider (fill of the scallops),
// `next`  = the background color of the section BELOW (page bg shows through the notches).
const ScallopDivider = ({ color = '#FFF8EF', flip = false }) => (
  <div className={`w-full overflow-hidden leading-[0] ${flip ? 'rotate-180' : ''}`} aria-hidden="true">
    <svg viewBox="0 0 1200 30" preserveAspectRatio="none" className="w-full h-[22px] block">
      <path
        d="M0,0 
           C 20,26 40,26 60,0 
           C 80,26 100,26 120,0 
           C 140,26 160,26 180,0 
           C 200,26 220,26 240,0 
           C 260,26 280,26 300,0 
           C 320,26 340,26 360,0 
           C 380,26 400,26 420,0 
           C 440,26 460,26 480,0 
           C 500,26 520,26 540,0 
           C 560,26 580,26 600,0 
           C 620,26 640,26 660,0 
           C 680,26 700,26 720,0 
           C 740,26 760,26 780,0 
           C 800,26 820,26 840,0 
           C 860,26 880,26 900,0 
           C 920,26 940,26 960,0 
           C 980,26 1000,26 1020,0 
           C 1040,26 1060,26 1080,0 
           C 1100,26 1120,26 1140,0 
           C 1160,26 1180,26 1200,0 
           L1200,0 L0,0 Z"
        fill={color}
      />
    </svg>
  </div>
);

export default ScallopDivider;
