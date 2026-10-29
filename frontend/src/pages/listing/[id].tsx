import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Heart, Share2, Star, Shield, MessageCircle,
  MapPin, Clock, CheckCircle, ChevronLeft, ChevronRight, Flag, Send, Loader2,
} from 'lucide-react';
import { fetchListing, toggleSave, postReview, type ApiListing, type ApiReview } from '@/lib/api';
import ListingCard from '@/components/ListingCard';
import { toast } from 'sonner';
import { useSession } from '@/lib/auth/auth-client';
import RedeemPoints from '@/components/RedeemPoints';

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isPending: sessionPending } = useSession();
  const [listing, setListing] = useState<ApiListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imgIndex, setImgIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [chatLoading, setChatLoading] = useState(false);
  const [soldLoading, setSoldLoading] = useState(false);
  const [markedSold, setMarkedSold] = useState(false);

  // Points / discount state
  const [dbUserId, setDbUserId] = useState<number | null>(null);
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const [pointsApplied, setPointsApplied] = useState(false);

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  
useEffect(() => {
  if (!id) return;

  setLoading(true);
  setError('');

  fetchListing(id)
    .then(data => {
      setListing(data);
      setSaved(data.saved);
    })
    .catch(() => setError('Listing not found'))
    .finally(() => setLoading(false));
}, [id]);


  // Resolve DB user id for points
  useEffect(() => {
    if (!user?.email) return;
    fetch(`/api/users/by-email?email=${encodeURIComponent(user.email)}`)
      .then(r => r.json())
      .then(d => setDbUserId(d.id ?? null))
      .catch(() => {});
  }, [user?.email]);

  const handleApplyPoints = (discount: number, _pts: number) => {
    setPointsDiscount(discount);
    setPointsApplied(true);
    toast.success(`₹${discount} discount applied using ${_pts} points!`);
  };

  const handleRemovePoints = () => {
    setPointsDiscount(0);
    setPointsApplied(false);
  };

  const handleSave = async () => {
    if (!listing) return;
    try {
      const result = await toggleSave(listing.id);
      setSaved(result.saved);
      toast.success(result.saved ? 'Saved to wishlist!' : 'Removed from wishlist');
    } catch {
      toast.error('Failed to save');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied!');
  };

  const handleMarkSold = async () => {
    if (!listing || !dbUserId) return;
    setSoldLoading(true);
    try {
      const res = await fetch(`/api/listings/${listing.id}/sold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerUserId: dbUserId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setMarkedSold(true);
      toast.success(`Listing marked as sold! +${data.pointsAwarded} Campus Points earned 🎉`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to mark as sold');
    } finally {
      setSoldLoading(false);
    }
  };

  const handleChat = async () => {
    if (!listing) return;

    // Not logged in → send to login
    if (!sessionPending && !user) {
      toast.error('Please log in to message the seller');
      navigate('/auth/login', { state: { from: { pathname: `/listing/${listing.id}` } } });
      return;
    }

    setChatLoading(true);
    try {
      // Resolve buyer's DB id from email
      let buyerId: number | null = null;
      if (user?.email) {
        const res = await fetch(`/api/users/by-email?email=${encodeURIComponent(user.email)}`);
        if (res.ok) {
          const data = await res.json();
          buyerId = data.id ?? null;
        }
      }
      if (!buyerId) buyerId = 1; // demo fallback

      const sellerId = (listing as ApiListing & { sellerId?: string }).sellerId;
      if (!sellerId) {
        toast.error('Seller info unavailable');
        return;
      }

      // Create or fetch existing conversation
      const convRes = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerId, sellerId, listingId: listing.id }),
      });

      if (!convRes.ok) throw new Error('Failed to start conversation');
      const conv = await convRes.json();

      // Send an opening message
      await fetch(`/api/conversations/${conv.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: buyerId,
          text: `Hi! I'm interested in your listing "${listing.title}". Is it still available?`,
        }),
      });

      navigate('/chat');
    } catch {
      toast.error('Could not start conversation. Please try again.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!listing || !reviewText.trim()) return;
    setSubmittingReview(true);
    try {
      const newReview = await postReview(listing.id, { rating: reviewRating, text: reviewText });
      const reviews = Array.isArray(listing.reviews) ? listing.reviews : [];
      setListing({ ...listing, reviews: [newReview, ...reviews] });
      setReviewText('');
      setReviewRating(5);
      toast.success('Review posted!');
    } catch {
      toast.error('Failed to post review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
            <div>
              <div className="w-full rounded-3xl bg-muted animate-pulse" style={{ aspectRatio: '16/9' }} />
              <div className="mt-6 space-y-3">
                <div className="h-5 bg-muted rounded-full w-3/4 animate-pulse" />
                <div className="h-4 bg-muted rounded-full w-1/2 animate-pulse" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-48 bg-muted rounded-3xl animate-pulse" />
              <div className="h-32 bg-muted rounded-3xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground font-heading mb-2">Listing not found</h2>
          <Link to="/listings" className="text-primary hover:underline text-sm">Back to listings</Link>
        </div>
      </div>
    );
  }

  const reviews = Array.isArray(listing.reviews) ? listing.reviews as ApiReview[] : [];
  const related = listing.related ?? [];
  const images = listing.images ?? [listing.image];
  const canonicalUrl = `https://campusbazaar.in/listing/${listing.id}`;
  const ogImage = listing.image?.startsWith('http') ? listing.image : `https://campusbazaar.in${listing.image}`;

  return (
    <>
      <Helmet>
        <title>{listing.title} — CampusKart</title>
        <meta name="description" content={(listing.description ?? '').slice(0, 160)} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${listing.title} — CampusKart`} />
        <meta property="og:description" content={(listing.description ?? '').slice(0, 160)} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="product" />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImage} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": listing.title,
          "description": listing.description,
          "image": ogImage,
          "url": canonicalUrl,
          "offers": {
            "@type": "Offer",
            "priceCurrency": "INR",
            "price": listing.price,
            "availability": (listing as ApiListing & { active?: boolean }).active === false
              ? "https://schema.org/SoldOut"
              : "https://schema.org/InStock",
            "itemCondition": listing.condition === 'Like New'
              ? "https://schema.org/LikeNewCondition"
              : listing.condition === 'Good'
              ? "https://schema.org/UsedCondition"
              : "https://schema.org/DamagedCondition"
          },
          "seller": {
            "@type": "Person",
            "name": listing.seller
          }
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 mb-6"
          >
            <Link to="/listings" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors group">
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform duration-150" />
              Back to listings
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-sm text-muted-foreground">{listing.category}</span>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-sm text-foreground font-medium truncate max-w-xs">{listing.title}</span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
            {/* Left */}
            <div>
              {/* Image gallery */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative rounded-3xl overflow-hidden bg-muted mb-4"
                style={{ aspectRatio: '16/9' }}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={imgIndex}
                    src={images[imgIndex]}
                    alt={listing.title}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.35 }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>

                {images.length > 1 && (
                  <>
                    <button onClick={() => setImgIndex(i => Math.max(0, i - 1))} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-105 transition-transform">
                      <ChevronLeft size={16} />
                    </button>
                    <button onClick={() => setImgIndex(i => Math.min(images.length - 1, i + 1))} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-105 transition-transform">
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}

                {listing.tag && (
                  <span className={`absolute top-4 left-4 ${listing.tagColor} text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide`}>
                    {listing.tag}
                  </span>
                )}
              </motion.div>

              {/* Tabs */}
              <div className="flex gap-1 mb-5 bg-muted/50 p-1 rounded-2xl w-fit">
                {(['description', 'reviews'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all duration-150 ${
                      activeTab === tab ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab === 'reviews' ? `Reviews (${reviews.length})` : 'Description'}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'description' ? (
                  <motion.div
                    key="desc"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="text-muted-foreground leading-relaxed text-sm">{listing.description}</p>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      {[
                        { label: 'Category', value: listing.category },
                        { label: 'Condition', value: listing.condition },
                        { label: 'Location', value: listing.location },
                        { label: 'Posted', value: listing.postedAt ?? 'Recently' },
                      ].map(item => (
                        <div key={item.label} className="bg-muted/50 rounded-2xl p-3">
                          <p className="text-xs text-muted-foreground font-medium mb-0.5">{item.label}</p>
                          <p className="text-sm font-bold text-foreground">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="reviews"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    {/* Write a review */}
                    <div className="bg-card border border-border rounded-2xl p-4">
                      <h4 className="text-sm font-bold text-foreground font-heading mb-3">Write a Review</h4>
                      <div className="flex gap-1 mb-3">
                        {[1,2,3,4,5].map(star => (
                          <button key={star} onClick={() => setReviewRating(star)}>
                            <Star size={20} className={star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'} />
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={reviewText}
                        onChange={e => setReviewText(e.target.value)}
                        rows={3}
                        placeholder="Share your experience with this seller..."
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all resize-none mb-3"
                      />
                      <button
                        onClick={handleSubmitReview}
                        disabled={!reviewText.trim() || submittingReview}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold disabled:opacity-50 hover:bg-primary/90 transition-all"
                      >
                        <Send size={13} />
                        {submittingReview ? 'Posting...' : 'Post Review'}
                      </button>
                    </div>

                    {/* Review list */}
                    {reviews.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">No reviews yet. Be the first!</p>
                    ) : (
                      reviews.map((r, i) => (
                        <motion.div
                          key={r.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.07 }}
                          className="bg-card border border-border rounded-2xl p-4"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${r.reviewerAvatarBg ?? 'bg-indigo-100 text-indigo-700'}`}>
                              {r.reviewerAvatar ?? r.reviewerName?.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-bold text-foreground">{r.reviewerName}</span>
                                <span className="text-xs text-muted-foreground">
                                  {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                                </span>
                              </div>
                              <div className="flex gap-0.5 mb-2">
                                {Array.from({ length: 5 }).map((_, j) => (
                                  <Star key={j} size={11} className={j < r.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'} />
                                ))}
                              </div>
                              <p className="text-sm text-muted-foreground">{r.text}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: Price + Seller */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-card border border-border rounded-3xl p-6"
              >
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <div className="flex items-baseline gap-2">
                      {pointsApplied ? (
                        <>
                          <span className="text-4xl font-bold text-primary font-heading">
                            ₹{(listing.price - pointsDiscount).toLocaleString()}
                          </span>
                          <span className="text-lg text-muted-foreground line-through">
                            ₹{listing.price.toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span className="text-4xl font-bold text-primary font-heading">₹{listing.price.toLocaleString()}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground line-through">₹{listing.originalPrice.toLocaleString()}</span>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        {Math.round((1 - listing.price / listing.originalPrice) * 100)}% off
                      </span>
                      {pointsApplied && (
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                          −₹{pointsDiscount} pts
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                    listing.condition === 'Like New'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                      : listing.condition === 'Good'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
                  }`}>
                    {listing.condition}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-3 mb-5">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={13} className={i < Math.floor(parseFloat(listing.rating)) ? 'fill-amber-400 text-amber-400' : 'text-muted'} />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-foreground">{listing.rating}</span>
                  <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <MapPin size={13} className="text-primary" />
                  {listing.location}
                  <span className="mx-1">·</span>
                  <Clock size={13} className="text-primary" />
                  {listing.postedAt ?? 'Recently'}
                </div>

                {/* Redeem Points */}
                <div className="mb-4">
                  <RedeemPoints
                    userId={dbUserId}
                    listingPrice={listing.price}
                    onApply={handleApplyPoints}
                    onRemove={handleRemovePoints}
                    applied={pointsApplied}
                  />
                </div>

                <button
                  onClick={handleChat}
                  disabled={chatLoading || markedSold}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 transition-all duration-150 mb-3 disabled:opacity-70"
                >
                  {chatLoading
                    ? <><Loader2 size={16} className="animate-spin" /> Starting chat...</>
                    : <><MessageCircle size={16} /> Chat with Seller</>
                  }
                </button>

                {/* Mark as Sold — only visible to the seller */}
                {dbUserId !== null && dbUserId === (listing as ApiListing & { sellerId?: number }).sellerId && (
                  <button
                    onClick={handleMarkSold}
                    disabled={soldLoading || markedSold}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-bold transition-all duration-150 mb-3 ${
                      markedSold
                        ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 cursor-default'
                        : 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/40 disabled:opacity-60'
                    }`}
                  >
                    {soldLoading
                      ? <><Loader2 size={15} className="animate-spin" /> Marking sold...</>
                      : markedSold
                      ? <><CheckCircle size={15} /> Sold · +100 pts earned</>
                      : <><CheckCircle size={15} /> Mark as Sold (+100 pts)</>
                    }
                  </button>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-semibold transition-all duration-150 ${
                      saved ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50 text-red-500' : 'border-border text-muted-foreground hover:border-primary/50 hover:text-primary'
                    }`}
                  >
                    <Heart size={15} className={saved ? 'fill-red-500' : ''} />
                    {saved ? 'Saved' : 'Save'}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-border text-sm font-semibold text-muted-foreground hover:border-primary/50 hover:text-primary transition-all duration-150"
                  >
                    <Share2 size={15} />
                    Share
                  </button>
                </div>
              </motion.div>

              {/* Seller card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-card border border-border rounded-3xl p-5"
              >
                <h3 className="text-sm font-bold text-foreground font-heading mb-4">Seller Info</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold ${listing.sellerAvatarBg ?? 'bg-indigo-100 text-indigo-700'}`}>
                    {listing.sellerAvatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-foreground text-sm">{listing.seller}</span>
                      {listing.sellerVerified && (
                        <CheckCircle size={14} className="text-primary fill-primary/10" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                      <span className="text-xs font-semibold text-muted-foreground">{listing.sellerRating}</span>
                      <span className="text-xs text-muted-foreground">· {listing.sellerSales ?? 0} sales</span>
                    </div>
                  </div>
                </div>

                {listing.sellerVerified && (
                  <div className="flex items-center gap-2 p-3 bg-secondary rounded-xl mb-4">
                    <Shield size={14} className="text-primary flex-shrink-0" />
                    <span className="text-xs font-semibold text-primary">Verified Campus Seller</span>
                  </div>
                )}
              </motion.div>

              {/* Safety tip */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4"
              >
                <div className="flex items-start gap-2">
                  <Flag size={14} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">Safety Tip</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400/80 leading-relaxed">Always meet in a public campus area. Never pay in advance. Inspect the item before completing the deal.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Related listings */}
          {related.length > 0 && (
            <div className="mt-16">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">You might like</p>
                  <h2 className="text-2xl font-bold text-foreground font-heading tracking-tight">Similar Listings</h2>
                </div>
                <Link to="/listings" className="text-sm font-semibold text-primary hover:underline">View all</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {related.map((l, i) => <ListingCard key={l.id} listing={l as any} index={i} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
