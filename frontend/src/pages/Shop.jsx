import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios.js';
import ProductCard from '../components/ProductCard.jsx';
import Loader from '../components/Loader.jsx';

const SORT_OPTIONS = [
  { value: '', label: 'Newest First' },
  { value: 'best_reviewed', label: 'Best Reviewed' },
  { value: 'fast_delivery', label: 'Fastest to Craft' },
  { value: 'best_seller', label: 'Best Selling' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data));
  }, []);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = Object.fromEntries(searchParams.entries());
    api
      .get('/products', { params })
      .then((res) => {
        setProducts(res.data.products);
        setPages(res.data.pages);
        setTotal(res.data.total);
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchProducts]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  const applyPriceFilter = () => {
    const next = new URLSearchParams(searchParams);
    if (minPrice) next.set('minPrice', minPrice); else next.delete('minPrice');
    if (maxPrice) next.set('maxPrice', maxPrice); else next.delete('maxPrice');
    next.delete('page');
    setSearchParams(next);
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({});
  };

  const activeCategory = searchParams.get('category') || '';
  const activeSort = searchParams.get('sort') || '';
  const searchTerm = searchParams.get('search') || '';
  const page = Number(searchParams.get('page')) || 1;

  const hasActiveFilters = activeCategory || searchParams.get('minPrice') || searchParams.get('maxPrice') || searchParams.get('bestSeller') || searchParams.get('featured');

  const FiltersPanel = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-display font-semibold text-ink mb-3">Category</h4>
        <div className="space-y-1.5">
          <button
            onClick={() => updateParam('category', '')}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold ${!activeCategory ? 'bg-rani text-white' : 'text-ink/70 hover:bg-blush'}`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => updateParam('category', cat._id)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 ${activeCategory === cat._id ? 'bg-rani text-white' : 'text-ink/70 hover:bg-blush'}`}
            >
              <span>{cat.icon}</span> {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-display font-semibold text-ink mb-3">Price Range (₹)</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full bg-blush/60 rounded-xl px-3 py-2 text-sm focus:outline-none"
          />
          <span className="text-ink/40">–</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full bg-blush/60 rounded-xl px-3 py-2 text-sm focus:outline-none"
          />
        </div>
        <button onClick={applyPriceFilter} className="mt-3 w-full btn-sticker bg-ink text-white py-2 text-sm">
          Apply
        </button>
      </div>

      <div>
        <h4 className="font-display font-semibold text-ink mb-3">Quick Filters</h4>
        <div className="flex flex-wrap gap-2">
          {[{ key: 'bestSeller', label: 'Bestsellers' }, { key: 'newArrival', label: 'New Arrivals' }, { key: 'featured', label: 'Featured' }].map((f) => (
            <button
              key={f.key}
              onClick={() => updateParam(f.key, searchParams.get(f.key) === 'true' ? '' : 'true')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${searchParams.get(f.key) === 'true' ? 'bg-marigold text-ink' : 'bg-blush text-ink/60'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <button onClick={clearFilters} className="text-sm font-semibold text-rani hover:underline flex items-center gap-1">
          <X size={14} /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <Helmet>
        <title>Shop All Handmade Products — Utsaah</title>
      </Helmet>

      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-ink mb-2">
          {searchTerm ? `Results for "${searchTerm}"` : 'Shop All Products'}
        </h1>
        <p className="text-ink/50 text-sm">{loading ? 'Searching…' : `${total} handcrafted piece${total !== 1 ? 's' : ''} found`}</p>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="bg-white rounded-3xl p-5 shadow-soft sticky top-24">
            <FiltersPanel />
          </div>
        </aside>

        <div>
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <button
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden btn-sticker bg-white text-ink px-4 py-2.5 text-sm shadow-soft"
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
            <select
              value={activeSort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="ml-auto bg-white rounded-full px-4 py-2.5 text-sm font-semibold shadow-soft focus:outline-none"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {loading ? (
            <Loader />
          ) : products.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-5xl mb-4">🧶</p>
              <p className="font-display font-semibold text-xl text-ink mb-1">No products found</p>
              <p className="text-ink/50 text-sm mb-5">Try adjusting your filters or search term.</p>
              <button onClick={clearFilters} className="btn-sticker bg-rani text-white px-6 py-2.5 text-sm">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>

              {pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button
                    disabled={page <= 1}
                    onClick={() => updateParam('page', String(page - 1))}
                    className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center disabled:opacity-30"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="font-display font-semibold text-sm text-ink/70 px-3">Page {page} of {pages}</span>
                  <button
                    disabled={page >= pages}
                    onClick={() => updateParam('page', String(page + 1))}
                    className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center disabled:opacity-30"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filters drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-canvas p-5 overflow-y-auto animate-popIn">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-lg text-ink">Filters</h3>
              <button onClick={() => setFiltersOpen(false)}><X size={22} /></button>
            </div>
            <FiltersPanel />
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;