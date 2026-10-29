import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  Crown, Zap, Star, Check, X, Sparkles,
  TrendingUp, Bell, Eye, Rocket,
  BadgeCheck, Infinity as InfinityIcon, ChevronRight, Users
} from 'lucide-react';
import { authClient } from '@/lib/auth/auth-client';
import { toast } from 'sonner';
import { Helmet } from '@dr.pogodin/react-helmet';

const FREE_FEATURES = [
  { label: 'Post up to 3 listings', included: true },
  { label: 'Basic search & browse', included: true },
  { label: 'Save up to 10 items', included: true },
  { label: 'Standard listing visibility', included: true },
  { label: 'Chat with sellers', included: true },
  { label: 'Unlimited listings', included: false },
  { label: 'Boosted listing placement', included: false },
  { label: 'Verified seller badge', included: false },
  { label: 'Priority in search results', included: false },
  { label: 'Advanced analytics', included: false },
  { label: 'No ads', included: false },
];

const PRO_FEATURES = [
  { label: 'Unlimited listings', included: true },
  { label: 'Boosted listing placement', included: true },
  { label: 'Verified seller badge', included: true },
  { label: 'Priority in search results', included: true },
  { label: 'Advanced analytics dashboard', included: true },
  { label: 'No ads experience', included: true },
  { label: 'Early access to new features', included: true },
  { label: 'Dedicated support', included: true },
  { label: 'Custom profile banner', included: true },
  { label: 'Bulk listing tools', included: true },
  { label: 'Price drop alerts', included: true },
];

const PERKS = [
  { icon: Rocket, title: 'Boosted Listings', desc: 'Your items appear at the top of search results and category pages, getting 5x more views.' },
  { icon: BadgeCheck, title: 'Verified Badge', desc: 'A gold verified badge on your profile builds trust and increases buyer confidence instantly.' },
  { icon: TrendingUp, title: 'Analytics Dashboard', desc: 'See views, saves, and message rates for every listing. Know what\'s working and optimize.' },
  { icon: Bell, title: 'Smart Alerts', desc: 'Get instant notifications when someone saves your listing or when a saved item drops in price.' },
  { icon: Eye, title: 'Profile Spotlight', desc: 'Your seller profile is featured in the "Top Sellers" section on the homepage every week.' },
  { icon: InfinityIcon, title: 'Unlimited Listings', desc: 'Post as many items as you want. No caps, no limits. Sell your entire hostel room if needed.' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Sold 14 items', avatar: 'PS', avatarBg: 'bg-pink-100 text-pink-700', text: 'CampusKart Pro helped me sell my old laptop in 2 hours. The boosted listing made all the difference!', rating: 5 },
  { name: 'Karan Singh', role: 'Power Seller', avatar: 'KS', avatarBg: 'bg-blue-100 text-blue-700', text: 'The analytics dashboard is incredible. I can see exactly which listings get the most interest and price accordingly.', rating: 5 },
  { name: 'Ananya Reddy', role: 'Top Rated Seller', avatar: 'AR', avatarBg: 'bg-rose-100 text-rose-700', text: 'The verified badge made buyers trust me immediately. My response rate went from 40% to 90% after going Pro.', rating: 5 },
];

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 99,
    period: 'month',
    badge: null,
    savings: null,
  },
  {
    id: 'semester',
    name: 'Semester',
    price: 249,
    period: '6 months',
    badge: 'Most Popular',
    savings: 'Save ₹345',
  },
  {
    id: 'annual',
    name: 'Annual',
    price: 399,
    period: 'year',
    badge: 'Best Value',
    savings: 'Save ₹789',
  },
];

export default function PremiumPage() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const handleSubscribe = (planId: string) => {
    if (!user) {
      toast.error('Please log in to subscribe');
      return;
    }
    toast.success(`🎉 Welcome to CampusKart Pro! (${planId} plan)`, {
      description: 'Your Pro features are now active.',
      duration: 4000,
    });
  };

  return (
    <>
      <Helmet>
        <title>CampusKart Pro — Sell Faster, Earn More</title>
        <meta name="description" content="Upgrade to CampusKart Pro for unlimited listings, boosted placement, verified badge, and advanced analytics." />
        <link rel="canonical" href="https://campusKart.in/premium" />
        <meta property="og:title" content="CampusKart Pro — Sell Faster, Earn More" />
        <meta property="og:description" content="Upgrade to CampusKart Pro for unlimited listings, boosted placement, verified badge, and advanced analytics." />
        <meta property="og:url" content="https://campusKart.in/premium" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://campusKart.in/og-home.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://campusKart.in/og-home.png" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "CampusKart Pro",
          "description": "Premium plan for CampusKart — unlimited listings, boosted placement, verified badge, and advanced analytics.",
          "url": "https://campusKart.in/premium",
          "offers": [
            { "@type": "Offer", "name": "Monthly", "priceCurrency": "INR", "price": "99" },
            { "@type": "Offer", "name": "Semester", "priceCurrency": "INR", "price": "249" },
            { "@type": "Offer", "name": "Annual", "priceCurrency": "INR", "price": "399" }
          ]
        })}</script>
      </Helmet>

      <div className="bg-background">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900 text-white py-24 px-4">
          {/* Decorative blobs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="container mx-auto max-w-4xl text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-semibold mb-6 backdrop-blur-sm">
                <Crown size={14} className="text-amber-400" />
                CampusKart Pro
              </div>
              <h1 className="text-5xl md:text-6xl font-bold font-heading tracking-tight mb-6 leading-tight">
                Sell Faster.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                  Earn More.
                </span>
              </h1>
              <p className="text-xl text-indigo-200 max-w-2xl mx-auto mb-10 leading-relaxed">
                Unlock unlimited listings, boosted placement, verified badge, and powerful analytics. Join 500+ campus sellers who upgraded their game.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="#plans"
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 text-gray-900 font-bold text-lg hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-200 hover:-translate-y-0.5"
                >
                  <Sparkles size={18} />
                  Get Pro — Starting ₹99/mo
                </a>
                <a
                  href="#compare"
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/20 text-white font-semibold hover:bg-white/10 transition-all duration-200"
                >
                  Compare Plans
                  <ChevronRight size={16} />
                </a>
              </div>
            </motion.div>

            {/* Stats strip */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-3 gap-6 mt-16 pt-10 border-t border-white/10"
            >
              {[
                { value: '500+', label: 'Pro Sellers' },
                { value: '5x', label: 'More Views' },
                { value: '₹2L+', label: 'Sold This Month' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-indigo-300 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Perks Grid ───────────────────────────────────────────────────── */}
        <section className="py-20 px-4 bg-background">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-14">
              <p className="text-xs font-bold tracking-widest uppercase text-primary mb-3">What You Get</p>
              <h2 className="text-3xl md:text-4xl font-bold font-heading tracking-tight text-foreground">
                Everything you need to dominate campus sales
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PERKS.map((perk, i) => (
                <motion.div
                  key={perk.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-200 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <perk.icon size={22} className="text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground font-heading mb-2">{perk.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{perk.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing Plans ────────────────────────────────────────────────── */}
        <section id="plans" className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-14">
              <p className="text-xs font-bold tracking-widest uppercase text-primary mb-3">Pricing</p>
              <h2 className="text-3xl md:text-4xl font-bold font-heading tracking-tight text-foreground mb-4">
                Simple, student-friendly pricing
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                No hidden fees. Cancel anytime. All plans include every Pro feature.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PLANS.map((plan, i) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className={`relative bg-card rounded-3xl border-2 p-8 flex flex-col ${
                    plan.badge === 'Most Popular'
                      ? 'border-primary shadow-xl shadow-primary/10 scale-105'
                      : 'border-border'
                  }`}
                >
                  {plan.badge && (
                    <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                      plan.badge === 'Most Popular'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-amber-400 text-gray-900'
                    }`}>
                      {plan.badge}
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-foreground font-heading mb-1">{plan.name}</h3>
                    {plan.savings && (
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        {plan.savings}
                      </span>
                    )}
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-foreground font-heading">₹{plan.price}</span>
                    <span className="text-muted-foreground text-sm ml-1">/ {plan.period}</span>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {PRO_FEATURES.slice(0, 6).map((f) => (
                      <li key={f.label} className="flex items-center gap-2.5 text-sm text-foreground">
                        <Check size={15} className="text-green-500 flex-shrink-0" />
                        {f.label}
                      </li>
                    ))}
                    <li className="text-xs text-muted-foreground pt-1">+ 5 more features</li>
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                      plan.badge === 'Most Popular'
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md'
                        : 'bg-muted text-foreground hover:bg-primary hover:text-primary-foreground'
                    }`}
                  >
                    {user ? `Get ${plan.name} Plan` : 'Sign Up & Subscribe'}
                  </button>
                </motion.div>
              ))}
            </div>

            <p className="text-center text-sm text-muted-foreground mt-8">
              🔒 Secure payment · Cancel anytime · Student ID verification may be required
            </p>
          </div>
        </section>

        {/* ── Free vs Pro Comparison ───────────────────────────────────────── */}
        <section id="compare" className="py-20 px-4 bg-background">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-14">
              <p className="text-xs font-bold tracking-widest uppercase text-primary mb-3">Compare</p>
              <h2 className="text-3xl font-bold font-heading tracking-tight text-foreground">
                Free vs Pro
              </h2>
            </div>

            <div className="bg-card border border-border rounded-3xl overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-3 bg-muted/50 border-b border-border">
                <div className="p-5 font-semibold text-muted-foreground text-sm">Feature</div>
                <div className="p-5 text-center font-bold text-foreground border-l border-border">Free</div>
                <div className="p-5 text-center font-bold text-primary border-l border-border flex items-center justify-center gap-1.5">
                  <Crown size={14} className="text-amber-500" /> Pro
                </div>
              </div>

              {/* Rows */}
              {FREE_FEATURES.map((feature, i) => (
                <div
                  key={feature.label}
                  className={`grid grid-cols-3 border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}
                >
                  <div className="p-4 text-sm text-foreground">{feature.label}</div>
                  <div className="p-4 flex items-center justify-center border-l border-border">
                    {feature.included
                      ? <Check size={16} className="text-green-500" />
                      : <X size={16} className="text-muted-foreground/40" />
                    }
                  </div>
                  <div className="p-4 flex items-center justify-center border-l border-border">
                    <Check size={16} className="text-green-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ─────────────────────────────────────────────────── */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-14">
              <p className="text-xs font-bold tracking-widest uppercase text-primary mb-3">Testimonials</p>
              <h2 className="text-3xl font-bold font-heading tracking-tight text-foreground">
                Loved by campus sellers
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="bg-card border border-border rounded-2xl p-6"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} size={14} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed mb-5">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${t.avatarBg}`}>
                      {t.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────────────── */}
        <section className="py-20 px-4 bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900 text-white">
          <div className="container mx-auto max-w-2xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-400/20 flex items-center justify-center mx-auto mb-6">
                <Crown size={28} className="text-amber-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold font-heading tracking-tight mb-4">
                Ready to go Pro?
              </h2>
              <p className="text-indigo-200 mb-8 text-lg">
                Join 500+ campus sellers. Start with a monthly plan and upgrade anytime.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="#plans"
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 text-gray-900 font-bold text-lg hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-200 hover:-translate-y-0.5"
                >
                  <Zap size={18} />
                  Upgrade Now
                </a>
                <Link
                  to="/listings"
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/20 text-white font-semibold hover:bg-white/10 transition-all duration-200"
                >
                  <Users size={16} />
                  Browse as Free User
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

      </div>
    </>
  );
}
