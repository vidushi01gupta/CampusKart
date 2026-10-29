import { useState, useMemo, useEffect, useCallback } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, AnimatePresence } from 'motion/react';
import { Search, SlidersHorizontal, X, ChevronDown, TrendingUp, RefreshCw } from 'lucide-react';
import ListingCard from '@/components/ListingCard';
import SkeletonCard from '@/components/SkeletonCard';
import { CATEGORIES, TRENDING_SEARCHES } from '@/data/listings';
import { fetchListings, formatListing, type ApiListing } from '@/lib/api';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default function ListingsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [condition, setCondition] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const [listings, setListings] = useState<ApiListing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string> = { sort };
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      if (condition.length === 1) params.condition = condition[0];
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const data = await fetchListings(params);
      setListings(data.listings);
      setTotal(data.total);
    } catch {
      setError('Failed to load listings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, condition, minPrice, maxPrice]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [load]);

  const toggleCondition = (c: string) =>
    setCondition(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const clearFilters = () => {
    setCondition([]);
    setMinPrice('');
    setMaxPrice('');
    setCategory('All');
    setSearch('');
  };

  const formatted = useMemo(() => listings.map(formatListing), [listings]);

  return (
    <>
      <Helmet>
        <title>Browse Listings — CampusKart</title>
        <meta name="description" content="Browse student listings on CampusKart. Filter by category, price, and condition to find books, electronics, bikes, furniture and more." />
        <link rel="canonical" href="https://campusKart.in/listings" />
        <meta property="og:title" content="Browse Listings — CampusKart" />
        <meta property="og:description" content="Browse student listings on CampusKart. Filter by category, price, and condition." />
        <meta property="og:url" content="https://campusKart.in/listings" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://campusKart.in/og-home.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://campusKart.in/og-home.png" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Browse Listings — CampusKart",
          "url": "https://campusKart.in/listings",
          "description": "Browse all student listings on CampusKart."
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Sticky filter bar */}
        <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative max-w-lg">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search listings..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X size={14} className="text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>

              <div className="relative hidden sm:block">
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-border bg-card text-sm font-medium focus:outline-none focus:border-primary cursor-pointer"
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-150 ${
                  showFilters ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-card text-foreground hover:border-primary/50'
                }`}
              >
                <SlidersHorizontal size={15} />
                Filters
              </button>
            </div>

            {/* Category pills */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-150 flex-shrink-0 ${
                    category === cat
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-6">
            {/* Sidebar */}
            <AnimatePresence>
              {showFilters && (
                <motion.aside
                  initial={{ opacity: 0, x: -20, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: 260 }}
                  exit={{ opacity: 0, x: -20, width: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' as const }}
                  className="flex-shrink-0 overflow-hidden"
                >
                  <div className="w-64 bg-card border border-border rounded-3xl p-5 sticky top-36 space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-foreground font-heading mb-3">Price Range</h3>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={minPrice}
                          onChange={e => setMinPrice(e.target.value)}
                          placeholder="Min ₹"
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary"
                        />
                        <span className="text-muted-foreground text-sm">–</span>
                        <input
                          type="number"
                          value={maxPrice}
                          onChange={e => setMaxPrice(e.target.value)}
                          placeholder="Max ₹"
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-foreground font-heading mb-3">Condition</h3>
                      <div className="space-y-2">
                        {['Like New', 'Good', 'Fair', 'Poor'].map(c => (
                          <label key={c} className="flex items-center gap-2.5 cursor-pointer group">
                            <div
                              onClick={() => toggleCondition(c)}
                              className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all duration-150 cursor-pointer ${
                                condition.includes(c) ? 'bg-primary border-primary' : 'border-border group-hover:border-primary/50'
                              }`}
                            >
                              {condition.includes(c) && <div className="w-2 h-2 rounded-sm bg-white" />}
                            </div>
                            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{c}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={clearFilters}
                      className="w-full py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>

            {/* Main */}
            <div className="flex-1 min-w-0">
              {/* Trending */}
              {!search && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={14} className="text-primary" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Trending</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {TRENDING_SEARCHES.map(t => (
                      <button
                        key={t}
                        onClick={() => setSearch(t)}
                        className="px-3 py-1.5 rounded-full bg-secondary border border-primary/20 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-150"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Count */}
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-muted-foreground">
                  {loading ? (
                    <span className="inline-block w-16 h-4 bg-muted rounded animate-pulse" />
                  ) : (
                    <><span className="font-bold text-foreground">{total}</span> listings found</>
                  )}
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl mb-5">
                  <p className="text-sm text-red-600 flex-1">{error}</p>
                  <button onClick={load} className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-800">
                    <RefreshCw size={13} /> Retry
                  </button>
                </div>
              )}

              {/* Grid */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : formatted.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-24 text-center"
                >
                  <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-4">
                    <Search size={28} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground font-heading mb-2">No listings found</h3>
                  <p className="text-muted-foreground text-sm mb-4">Try adjusting your filters or search terms</p>
                  <button onClick={clearFilters} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all">
                    Clear Filters
                  </button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <AnimatePresence mode="popLayout">
                    {formatted.map((listing, i) => (
                      <ListingCard key={listing.id} listing={listing as any} index={i} />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
