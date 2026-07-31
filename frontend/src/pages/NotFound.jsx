import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
    <p className="text-7xl mb-4">🧵</p>
    <h1 className="font-display font-bold text-4xl text-ink mb-2">Oops, thread's cut!</h1>
    <p className="text-ink/50 mb-8 max-w-sm">We couldn't find the page you're looking for. Let's get you back to something lovely.</p>
    <Link to="/" className="btn-sticker bg-rani text-white px-7 py-3.5">Back to Home</Link>
  </div>
);

export default NotFound;
