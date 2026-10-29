import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'motion/react';
import { useRef, useEffect, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import {
  Search, ArrowRight, ArrowUpRight,
  BookOpen, Laptop, Bike, Sofa, Shirt, Music, FileText, Dumbbell,
  Star, TrendingUp, Shield, Zap, Flame, Heart, Sparkles,
} from 'lucide-react';
import { TRENDING_SEARCHES } from '@/data/listings';

// ─── Data ────────────────────────────────────────────────────────────────────

const categories = [
  { label: 'Books', icon: BookOpen, color: 'from-orange-400 to-amber-500' },
  { label: 'Electronics', icon: Laptop, color: 'from-blue-500 to-indigo-600' },
  { label: 'Bikes', icon: Bike, color: 'from-green-400 to-emerald-500' },
  { label: 'Furniture', icon: Sofa, color: 'from-purple-400 to-violet-500' },
  { label: 'Clothing', icon: Shirt, color: 'from-pink-400 to-rose-500' },
  { label: 'Music', icon: Music, color: 'from-cyan-400 to-sky-500' },
  { label: 'Notes', icon: FileText, color: 'from-yellow-400 to-orange-400' },
  { label: 'Sports', icon: Dumbbell, color: 'from-red-400 to-rose-600' },
];

const listings = [
  {
    id: 1,
    title: 'Engineering Textbooks Bundle',
    price: '₹450',
    originalPrice: '₹1,200',
    condition: 'Good',
    conditionColor: 'bg-emerald-100 text-emerald-700',
    seller: 'Arjun M.',
    avatar: 'AM',
    avatarBg: 'bg-indigo-100 text-indigo-700',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80',
    tag: 'Hot Deal',
    tagColor: 'bg-red-500',
    rating: 4.8,
  },
  {
    id: 2,
    title: 'MacBook Air M1 (2021)',
    price: '₹52,000',
    originalPrice: '₹75,000',
    condition: 'Like New',
    conditionColor: 'bg-blue-100 text-blue-700',
    seller: 'Priya S.',
    avatar: 'PS',
    avatarBg: 'bg-pink-100 text-pink-700',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
    tag: 'Featured',
    tagColor: 'bg-primary',
    rating: 5.0,
  },
  {
    id: 3,
    title: 'Campus Bicycle',
    price: '₹3,200',
    originalPrice: '₹5,000',
    condition: 'Fair',
    conditionColor: 'bg-yellow-100 text-yellow-700',
    seller: 'Rohan K.',
    avatar: 'RK',
    avatarBg: 'bg-orange-100 text-orange-700',
    image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=900&q=80',
    tag: 'New',
    tagColor: 'bg-green-500',
    rating: 4.5,
  },
  {
    id: 4,
    title: 'Study Desk + Chair',
    price: '₹2,800',
    originalPrice: '₹4,500',
    condition: 'Good',
    conditionColor: 'bg-emerald-100 text-emerald-700',
    seller: 'Sneha T.',
    avatar: 'ST',
    avatarBg: 'bg-teal-100 text-teal-700',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    tag: null,
    tagColor: '',
    rating: 4.7,
  },
  {
    id: 5,
    title: 'Sony WH-1000XM4',
    price: '₹12,500',
    originalPrice: '₹20,000',
    condition: 'Like New',
    conditionColor: 'bg-blue-100 text-blue-700',
    seller: 'Dev P.',
    avatar: 'DP',
    avatarBg: 'bg-purple-100 text-purple-700',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80',
    tag: 'Popular',
    tagColor: 'bg-violet-500',
    rating: 4.9,
  },
  {
    id: 6,
    title: 'College Hoodie (L)',
    price: '₹650',
    originalPrice: '₹1,200',
    condition: 'Good',
    conditionColor: 'bg-emerald-100 text-emerald-700',
    seller: 'Ananya R.',
    avatar: 'AR',
    avatarBg: 'bg-rose-100 text-rose-700',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
    tag: null,
    tagColor: '',
    rating: 4.3,
  },
];

const stats = [
  { value: '1,200+', label: 'Active Listings', icon: TrendingUp },
  { value: '500+', label: 'Students', icon: Star },
  { value: '100%', label: 'Free to Use', icon: Zap },
  { value: 'Verified', label: 'Campus Only', icon: Shield },
];

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedNumber({ value }: { value: string }) {
  const [display, setDisplay] = useState('0');
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const num = parseInt(value.replace(/[^0-9]/g, ''));
    if (isNaN(num)) { setDisplay(value); return; }
    let start = 0;
    const duration = 1200;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value.replace(/[0-9,]+/, Math.floor(eased * num).toLocaleString()));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, value]);

  return <span ref={ref}>{display}</span>;
}

// ─── Magnetic Button ──────────────────────────────────────────────────────────

function MagneticButton({ children, className, to }: { children: React.ReactNode; className?: string; to: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.25);
    y.set((e.clientY - cy) * 0.25);
  };

  return (
    <div onMouseMove={handleMouseMove} onMouseLeave={() => { x.set(0); y.set(0); }}>
      <motion.div style={{ x: springX, y: springY }}>
        <Link to={to} className={className}>{children}</Link>
      </motion.div>
    </div>
  );
}

// ─── Listing Card ─────────────────────────────────────────────────────────────

function ListingCard({ listing, index }: { listing: typeof listings[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -8, transition: { duration: 0.25, ease: 'easeOut' as const } }}
      className="group relative bg-card rounded-3xl border border-border overflow-hidden cursor-pointer flex flex-col"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
    >
      {/* Image */}
      <div className="relative w-full h-48 overflow-hidden bg-muted flex-shrink-0">
        <img
          src={listing.image}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Tag */}
        {listing.tag && (
          <span className={`absolute top-3 left-3 ${listing.tagColor} text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide`}>
            {listing.tag}
          </span>
        )}

        {/* Quick view on hover */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ opacity: 1, scale: 1 }}
          className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200"
        >
          <div className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <ArrowUpRight size={15} className="text-foreground" />
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <Star size={11} className="fill-amber-400 text-amber-400" />
          <span className="text-xs font-semibold text-muted-foreground">{listing.rating}</span>
        </div>

        <h3 className="text-sm font-bold text-foreground font-heading leading-snug mb-1 line-clamp-2">
          {listing.title}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-primary">{listing.price}</span>
          <span className="text-xs text-muted-foreground line-through">{listing.originalPrice}</span>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${listing.conditionColor}`}>
            {listing.condition}
          </span>
          <div className="flex items-center gap-1.5">
            <div className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center ${listing.avatarBg}`}>
              {listing.avatar}
            </div>
            <span className="text-xs text-muted-foreground">{listing.seller}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Category Card ────────────────────────────────────────────────────────────

function CategoryCard({ cat, index }: { cat: typeof categories[0]; index: number }) {
  const Icon = cat.icon;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: 'backOut' as const }}
      whileHover={{ scale: 1.06, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.97 }}
    >
      <Link
        to={`/listings?category=${cat.label.toLowerCase()}`}
        className="flex flex-col items-center gap-3 group cursor-pointer"
      >
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200`}>
          <Icon size={22} className="text-white" />
        </div>
        <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors duration-150 text-center">
          {cat.label}
        </span>
      </Link>
    </motion.div>
  );
}

// ─── Ticker ───────────────────────────────────────────────────────────────────

function Ticker() {
  const items = ['Books', 'Laptops', 'Bicycles', 'Furniture', 'Headphones', 'Clothing', 'Notes', 'Sports Gear', 'Calculators', 'Dorm Essentials'];
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden py-4 border-y border-border bg-muted/20">
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        className="flex gap-8 whitespace-nowrap w-max"
      >
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <>
      <Helmet>
        <title>CampusKart — Smart Student Marketplace</title>
        <meta name="description" content="Buy and sell items within your campus. Books, electronics, furniture, bikes and more — all from fellow students." />
        <link rel="canonical" href="https://campusKart.in/" />
        <meta property="og:title" content="CampusKart — Smart Student Marketplace" />
        <meta property="og:description" content="Buy and sell items within your campus. Books, electronics, furniture, bikes and more — all from fellow students." />
        <meta property="og:url" content="https://campusKart.in/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://campusKart.in/og-home.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://campusKart.in/og-home.png" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "CampusKart",
          "url": "https://campusKart.in",
          "description": "Smart student marketplace — buy and sell books, electronics, bikes, furniture and more within your campus.",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://campusKart.in/listings?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })}</script>
      </Helmet>

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-[92vh] flex items-center overflow-hidden bg-background">

        {/* Animated mesh background */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Dot grid — uses CSS variable so it adapts to dark mode */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, hsl(var(--primary)/0.12) 1.5px, transparent 1.5px)',
              backgroundSize: '32px 32px',
            }}
          />
          {/* Large blobs */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], rotate: [0, 15, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' as const }}
            className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(circle, hsl(var(--primary)/0.12) 0%, transparent 70%)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' as const, delay: 4 }}
            className="absolute -bottom-40 -left-20 w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, hsl(var(--accent)/0.10) 0%, transparent 70%)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' as const, delay: 2 }}
            className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full"
            style={{ background: 'radial-gradient(circle, hsl(var(--primary)/0.07) 0%, transparent 70%)' }}
          />
          {/* Extra dark-mode glow — subtle top-left accent */}
          <div className="absolute top-0 left-0 w-[400px] h-[300px] opacity-0 dark:opacity-100 transition-opacity duration-300"
            style={{ background: 'radial-gradient(ellipse at 0% 0%, hsl(var(--primary)/0.18) 0%, transparent 65%)' }}
          />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="container mx-auto px-4 relative z-10 pt-12 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 items-center">

            {/* Left */}
            <div>
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' as const }}
                className="mb-7"
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
                  <motion.span
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-green-500 inline-block"
                  />
                  Student-to-Student Marketplace
                </span>
              </motion.div>

              {/* Headline */}
              <div className="overflow-hidden mb-3">
                <motion.h1
                  initial={{ y: 80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="text-6xl lg:text-7xl font-bold text-foreground font-heading leading-[1.05] tracking-tight"
                >
                  Your Campus.
                </motion.h1>
              </div>
              <div className="overflow-hidden mb-7">
                <motion.h1
                  initial={{ y: 80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="text-6xl lg:text-7xl font-bold font-heading leading-[1.05] tracking-tight"
                >
                  <span className="relative inline-block">
                    <span className="text-primary">Your Marketplace.</span>
                    {/* Underline squiggle */}
                    <motion.svg
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' as const }}
                      className="absolute -bottom-2 left-0 w-full"
                      viewBox="0 0 300 12"
                      fill="none"
                    >
                      <motion.path
                        d="M2 8 Q75 2 150 8 Q225 14 298 8"
                        stroke="#F59E0B"
                        strokeWidth="3"
                        strokeLinecap="round"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.8, delay: 0.7 }}
                      />
                    </motion.svg>
                  </span>
                </motion.h1>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' as const }}
                className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-lg"
              >
                Buy and sell textbooks, electronics, furniture, and more — all within your college campus. Fast, free, and trusted.
              </motion.p>

              {/* Search */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' as const }}
                className="flex gap-3 max-w-lg mb-8"
              >
                <div className="flex-1 relative">
                  <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search books, laptops, bikes..."
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm font-medium"
                  />
                </div>
                <MagneticButton
                  to="/listings"
                  className="px-7 py-4 rounded-2xl bg-primary text-primary-foreground text-sm font-bold transition-all duration-150 hover:shadow-lg hover:shadow-primary/25 whitespace-nowrap"
                >
                  Search
                </MagneticButton>
              </motion.div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5, ease: 'easeOut' as const }}
                className="flex flex-wrap items-center gap-4"
              >
                <MagneticButton
                  to="/sell"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-accent text-accent-foreground text-sm font-bold hover:shadow-lg hover:shadow-accent/30 transition-all duration-150"
                >
                  + Post an Item Free
                  <ArrowRight size={15} />
                </MagneticButton>
                <Link to="/listings" className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors group">
                  Browse all listings
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-150" />
                </Link>
              </motion.div>
            </div>

            {/* Right: Stacked listing cards */}
            <div className="hidden lg:block relative h-[480px]">
              {/* Card 1 — back */}
              <motion.div
                initial={{ opacity: 0, x: 60, rotate: 6 }}
                animate={{ opacity: 1, x: 0, rotate: 6 }}
                transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-8 right-0 w-64 bg-card rounded-3xl border border-border shadow-xl dark:shadow-black/40 overflow-hidden"
              >
                <div className="h-36 bg-muted overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=900&q=80" alt="Bicycle" className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <p className="font-bold text-sm font-heading text-foreground">Campus Bicycle</p>
                  <p className="text-primary font-bold text-base mt-1">₹3,200</p>
                </div>
              </motion.div>

              {/* Card 2 — middle */}
              <motion.div
                initial={{ opacity: 0, x: 40, rotate: -3 }}
                animate={{ opacity: 1, x: 0, rotate: -3 }}
                transition={{ duration: 0.7, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-24 right-8 w-64 bg-card rounded-3xl border border-border shadow-xl dark:shadow-black/40 overflow-hidden"
              >
                <div className="h-36 bg-muted overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80" alt="Laptop" className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <p className="font-bold text-sm font-heading text-foreground">MacBook Air M1</p>
                  <p className="text-primary font-bold text-base mt-1">₹52,000</p>
                </div>
              </motion.div>

              {/* Card 3 — front */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-44 right-4 w-72 bg-card rounded-3xl border border-border shadow-2xl dark:shadow-black/50 dark:border-border/80 overflow-hidden"
              >
                <div className="h-40 bg-muted overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80" alt="Textbooks" className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-sm font-heading text-foreground">Engineering Textbooks</p>
                    <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">Hot</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-primary font-bold text-lg">₹450</p>
                    <div className="flex items-center gap-1">
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                      <span className="text-xs text-muted-foreground font-medium">4.8</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.1, type: 'spring', stiffness: 200 }}
                className="absolute top-2 left-0 bg-card border border-border rounded-2xl px-4 py-3 shadow-lg dark:shadow-black/40"
              >
                <p className="text-xs text-muted-foreground font-medium">Active listings</p>
                <p className="text-xl font-bold text-foreground font-heading">1,200+</p>
              </motion.div>

              {/* Floating badge 2 */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.25, type: 'spring', stiffness: 200 }}
                className="absolute bottom-0 left-4 bg-primary text-primary-foreground rounded-2xl px-4 py-3 shadow-lg"
              >
                <p className="text-xs font-medium opacity-80">Students selling</p>
                <p className="text-xl font-bold font-heading">500+</p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── TICKER ── */}
      <Ticker />

      {/* ── STATS ── */}
      <section className="py-14 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08, ease: 'easeOut' as const }}
                  className="flex flex-col items-center text-center p-6 rounded-3xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200"
                >
                  <div className="w-11 h-11 rounded-2xl bg-secondary flex items-center justify-center mb-3">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <p className="text-3xl font-bold text-foreground font-heading tracking-tight">
                    <AnimatedNumber value={stat.value} />
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 font-medium">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section id="categories" className="py-16 bg-muted/20 border-y border-border">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">What are you looking for?</p>
            <h2 className="text-3xl font-bold text-foreground font-heading tracking-tight">Browse by Category</h2>
          </motion.div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-6 max-w-3xl mx-auto">
            {categories.map((cat, i) => (
              <CategoryCard key={cat.label} cat={cat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED LISTINGS ── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Fresh on Campus</p>
              <h2 className="text-3xl font-bold text-foreground font-heading tracking-tight">Featured Listings</h2>
            </div>
            <Link
              to="/listings"
              className="flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/80 transition-colors group"
            >
              View all
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-150" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 bg-muted/20 border-y border-border overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Simple Process</p>
            <h2 className="text-3xl font-bold text-foreground font-heading tracking-tight">How it Works</h2>
            <p className="text-muted-foreground mt-2">Three steps to buy or sell anything on campus</p>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            {/* Connecting line */}
            <div
              aria-hidden="true"
              className="hidden md:block absolute top-12 left-[calc(16.67%+3rem)] right-[calc(16.67%+3rem)] h-px"
              style={{ background: 'repeating-linear-gradient(90deg, #CBD5E1 0, #CBD5E1 8px, transparent 8px, transparent 18px)' }}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { step: '01', title: 'Post Your Item', desc: 'Take a photo, set a price, and list your item in under 2 minutes.', color: 'from-indigo-500 to-primary' },
                { step: '02', title: 'Browse & Discover', desc: 'Explore listings from students on your campus. Filter by category or price.', color: 'from-amber-400 to-orange-500' },
                { step: '03', title: 'Connect & Deal', desc: 'Message the seller, agree on a price, and meet on campus to exchange.', color: 'from-emerald-400 to-green-500' },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center text-center"
                >
                  <motion.div
                    whileHover={{ scale: 1.08, rotate: -3 }}
                    transition={{ duration: 0.2 }}
                    className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-lg relative z-10`}
                  >
                    <span className="text-3xl font-bold text-white font-heading">{item.step}</span>
                  </motion.div>
                  <h3 className="text-base font-bold text-foreground font-heading mb-2 tracking-tight">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trending Searches ─────────────────────────────────────────────── */}
      <section className="py-14 bg-card border-y border-border overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-6"
          >
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Flame size={16} className="text-primary" />
              </div>
              <span className="text-sm font-bold text-foreground font-heading whitespace-nowrap">Trending Now</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRENDING_SEARCHES.map((term, i) => (
                <motion.div
                  key={term}
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.3, type: 'spring', stiffness: 260 }}
                >
                  <Link
                    to={`/listings`}
                    className="group flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary border border-primary/15 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-150 shadow-sm"
                  >
                    <TrendingUp size={12} className="opacity-60 group-hover:opacity-100" />
                    {term}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Recommended For You ───────────────────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Sparkles size={14} className="text-amber-600" />
                </div>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">Picked for you</p>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-heading tracking-tight">
                Recommended Items
              </h2>
              <p className="text-muted-foreground mt-2 text-sm">
                Top picks from students on your campus right now
              </p>
            </div>
            <Link
              to="/listings"
              className="flex items-center gap-1.5 text-sm font-bold text-primary hover:underline flex-shrink-0"
            >
              See all listings
              <ArrowRight size={14} />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} index={i} />
            ))}
          </div>

          {/* Wishlist CTA strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 bg-secondary border border-primary/15 rounded-3xl px-8 py-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Heart size={18} className="text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground text-sm font-heading">Save items to your Wishlist</p>
                <p className="text-xs text-muted-foreground mt-0.5">Tap the heart on any listing to save it for later</p>
              </div>
            </div>
            <Link
              to="/profile"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 hover:shadow-md transition-all duration-150 flex-shrink-0"
            >
              View Saved Items
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section className="relative py-20 overflow-hidden bg-primary">
        {/* Animated background shapes */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' as const }}
            className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5"
          />
          <motion.div
            animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' as const, delay: 3 }}
            className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full bg-white/5"
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-primary-foreground/60 text-xs font-bold uppercase tracking-widest mb-3">It's completely free</p>
              <h2 className="text-4xl lg:text-5xl font-bold text-primary-foreground font-heading tracking-tight leading-tight">
                Got something<br />to sell?
              </h2>
              <p className="text-primary-foreground/75 mt-3 text-lg">
                Reach hundreds of students on your campus — no fees, no hassle.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <MagneticButton
                to="/sell"
                className="flex items-center gap-2.5 px-8 py-5 rounded-2xl bg-accent text-foreground text-base font-bold hover:shadow-2xl hover:shadow-accent/40 transition-all duration-200 whitespace-nowrap"
              >
                Post an Item Free
                <ArrowRight size={18} />
              </MagneticButton>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
