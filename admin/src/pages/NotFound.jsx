import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="text-center py-24">
    <p className="text-6xl mb-4">🧵</p>
    <h1 className="font-display font-bold text-2xl text-ink mb-2">Page not found</h1>
    <Link to="/" className="text-rani font-semibold hover:underline">Back to Dashboard</Link>
  </div>
);

export default NotFound;
