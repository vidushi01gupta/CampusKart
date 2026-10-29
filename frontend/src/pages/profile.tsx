import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star, CheckCircle, Package, Heart, Settings,
  Edit3, Plus, MapPin, Clock, Trash2, LogOut, LogIn,
  Crown, Eye, MessageCircle, ShoppingBag, Award, Camera,
  Phone, Mail, Globe, Instagram, Twitter, Linkedin,
  BarChart2, ArrowUpRight, Zap, BadgeCheck, Coins,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchSaved, fetchUserListings, deleteListing, type ApiListing } from '@/lib/api';
import { authClient } from '@/lib/auth/auth-client';
import { toast } from 'sonner';
import { Helmet } from '@dr.pogodin/react-helmet';

const TABS = [
  { id: 'listings', label: 'My Listings', icon: Package },
  { id: 'saved', label: 'Saved Items', icon: Heart },
  { id: 'stats', label: 'Analytics', icon: BarChart2 },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const;

type TabId = typeof TABS[number]['id'];

const STAT_CARDS = [
  { label: 'Total Earnings', value: '₹18,450', sub: '8 items sold', color: 'text-primary', bg: 'bg-primary/10', icon: ShoppingBag, trend: '+12%' },
  { label: 'Active Listings', value: '3', sub: 'Currently live', color: 'text-green-600', bg: 'bg-green-50', icon: Package, trend: '+1' },
  { label: 'Profile Views', value: '142', sub: 'This month', color: 'text-amber-600', bg: 'bg-amber-50', icon: Eye, trend: '+28%' },
  { label: 'Avg. Rating', value: '4.8', sub: '12 reviews', color: 'text-violet-600', bg: 'bg-violet-50', icon: Star, trend: '★★★★★' },
  { label: 'Messages', value: '24', sub: 'Unread: 3', color: 'text-blue-600', bg: 'bg-blue-50', icon: MessageCircle, trend: '+5' },
  { label: 'Response Rate', value: '92%', sub: 'Avg. 1.2 hrs', color: 'text-teal-600', bg: 'bg-teal-50', icon: Award, trend: 'Excellent' },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('listings');
  const [myListings, setMyListings] = useState<ApiListing[]>([]);
  const [savedItems, setSavedItems] = useState<ApiListing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState('Final year CS student. Selling stuff before graduation. Quick meetups near library or hostel gate. ✌️');
  const [pointsBalance, setPointsBalance] = useState<number | null>(null);

  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const sessionUser = session?.user;

  useEffect(() => {
  if (sessionLoading) return;

  if (!sessionUser?.email) {
    setMyListings([]);
    setLoadingListings(false);
    return;
  }

  setLoadingListings(true);

  fetch(`/api/users/by-email?email=${encodeURIComponent(sessionUser.email)}`)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('Failed to find user');
      }

      return response.json();
    })
    .then((user) => {
      const userId = user.id ?? user._id;

      if (!userId) {
        throw new Error('Database user ID not found');
      }

      return fetchUserListings(userId);
    })
    .then(setMyListings)
    .catch((error) => {
      console.error('Failed to load listings:', error);
      toast.error('Failed to load listings');
    })
    .finally(() => setLoadingListings(false));
}, [sessionLoading, sessionUser?.email]);

  useEffect(() => {
  if (activeTab !== 'saved' || sessionLoading) return;

  if (!sessionUser?.email) {
    setSavedItems([]);
    setLoadingSaved(false);
    return;
  }

  setLoadingSaved(true);

  fetch(`/api/users/by-email?email=${encodeURIComponent(sessionUser.email)}`)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('Failed to find user');
      }

      return response.json();
    })
    .then((user) => {
      const userId = user.id ?? user._id;

      if (!userId) {
        throw new Error('Database user ID not found');
      }

      return fetchSaved(userId);
    })
    .then(setSavedItems)
    .catch((error) => {
      console.error('Failed to load saved items:', error);
      toast.error('Failed to load saved items');
    })
    .finally(() => setLoadingSaved(false));
}, [activeTab, sessionLoading, sessionUser?.email]);

  // Resolve DB user id and load points balance
  useEffect(() => {
    if (!sessionUser?.email) return;
    fetch(`/api/users/by-email?email=${encodeURIComponent(sessionUser.email)}`)
      .then(r => r.json())
      .then(d => {
        if (d.id) {
          return fetch(`/api/points?userId=${d.id}`);
        }
      })
      .then(r => r?.json())
      .then(d => { if (d?.balance !== undefined) setPointsBalance(d.balance); })
      .catch(() => {});
  }, [sessionUser?.email]);

  const handleSignOut = async () => {
    await authClient.signOut();
    toast.success('Signed out');
    navigate('/');
  };

  
const removeListingHandler = async (id: string) => {
  try {
    await deleteListing(id);

    setMyListings(prev => prev.filter(l => l.id !== id));
    toast.success('Listing deleted successfully');
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : 'Failed to delete listing'
    );
  }
};


  const unsaveHandler = async (id: string) => {
    setSavedItems(prev => prev.filter(l => l.id !== id));
    toast.success('Removed from saved');
  };

  const initials = sessionUser
    ? sessionUser.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'CB';

  const joinDate = sessionUser
  ? new Date(
      (sessionUser as { createdAt?: string }).createdAt || Date.now()
    ).toLocaleDateString('en-IN', {
      month: 'long',
      year: 'numeric',
    })
  : '';

  return (
    <>
      <Helmet>
        <title>My Profile — CampusKart</title>
        <meta name="description" content="Manage your CampusKart profile, listings, saved items, and account settings." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">

        {/* ── Profile Hero Banner ─────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900 h-36 md:h-48">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 50%)' }}
          />
          {sessionUser && (
            <button className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-semibold hover:bg-white/20 transition-colors backdrop-blur-sm">
              <Camera size={12} />
              Edit Banner
            </button>
          )}
        </div>

        {/* ── Profile Card ────────────────────────────────────────────────── */}
        <div className="bg-card border-b border-border">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Avatar row — overlaps banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 -mt-12 pb-6">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 rounded-3xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-3xl font-bold border-4 border-card shadow-xl">
                    {initials}
                  </div>
                  {sessionUser && (
                    <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:scale-105 transition-transform">
                      <Edit3 size={13} />
                    </button>
                  )}
                </div>

                {/* Name + badges */}
                <div className="flex-1 pt-2 sm:pt-0">
                  {sessionLoading ? (
                    <div className="space-y-2">
                      <div className="h-6 w-40 bg-muted rounded-full animate-pulse" />
                      <div className="h-4 w-56 bg-muted rounded-full animate-pulse" />
                    </div>
                  ) : sessionUser ? (
                    <>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h1 className="text-2xl font-bold text-foreground font-heading">{sessionUser.name}</h1>
                        <CheckCircle size={18} className="text-primary" />
                        <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-semibold text-muted-foreground">Free Plan</span>
                      </div>
                      <p className="text-muted-foreground text-sm">{sessionUser.email} · Joined {joinDate}</p>
                      {pointsBalance !== null && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/50">
                            <Coins size={13} className="text-amber-600 dark:text-amber-400" />
                            <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                              {pointsBalance} Campus Points
                            </span>
                          </div>
                          {pointsBalance > 0 && (
                            <span className="text-xs text-muted-foreground">· worth ₹{pointsBalance}</span>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <h1 className="text-2xl font-bold text-foreground font-heading mb-1">Guest User</h1>
                      <p className="text-muted-foreground text-sm">Log in to manage your listings and profile</p>
                    </>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-shrink-0 mt-2 sm:mt-0">
                  <Link
                    to="/premium"
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 text-gray-900 text-sm font-bold hover:shadow-md hover:shadow-amber-400/30 transition-all duration-150"
                  >
                    <Crown size={14} />
                    Go Pro
                  </Link>
                  <Link
                    to="/sell"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 hover:shadow-md transition-all duration-150"
                  >
                    <Plus size={15} />
                    New Listing
                  </Link>
                  {sessionUser ? (
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-border text-sm font-semibold text-muted-foreground hover:text-red-500 hover:border-red-200 transition-all duration-150"
                    >
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  ) : (
                    <Link
                      to="/auth/login"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-border text-sm font-semibold text-muted-foreground hover:text-primary hover:border-primary/50 transition-all duration-150"
                    >
                      <LogIn size={15} />
                      Log In
                    </Link>
                  )}
                </div>
              </div>

              {/* Stats strip */}
              <div className="flex flex-wrap items-center gap-6 pb-5 border-t border-border pt-4">
                <div className="flex items-center gap-1.5">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold text-foreground">4.8</span>
                  <span className="text-sm text-muted-foreground">(12 reviews)</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Package size={14} className="text-primary" />
                  <span><span className="font-bold text-foreground">{myListings.length}</span> listings</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <ShoppingBag size={14} className="text-primary" />
                  <span><span className="font-bold text-foreground">8</span> sold</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin size={14} className="text-primary" />
                  <span>Hostel Block A</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Award size={14} className="text-primary" />
                  <span>92% response rate</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Main Content ────────────────────────────────────────────────── */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ── Left Sidebar ──────────────────────────────────────────── */}
            <aside className="lg:w-72 flex-shrink-0 space-y-4">

              {/* Bio card */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-foreground">About</h3>
                  <button
                    onClick={() => setEditingBio(!editingBio)}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Edit3 size={13} />
                  </button>
                </div>
                {editingBio ? (
                  <div className="space-y-2">
                    <textarea
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingBio(false); toast.success('Bio updated!'); }}
                        className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingBio(false)}
                        className="flex-1 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
                )}
              </div>

              {/* Contact info */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="text-sm font-bold text-foreground mb-3">Contact</h3>
                <div className="space-y-3">
                  {[
                    { icon: Mail, label: sessionUser?.email ?? 'Not logged in', href: '#' },
                    { icon: Phone, label: '+91 98765 43210', href: '#' },
                    { icon: MapPin, label: 'Hostel Block A, Campus', href: '#' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <item.icon size={14} className="text-primary flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social links */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="text-sm font-bold text-foreground mb-3">Social</h3>
                <div className="space-y-2">
                  {[
                    { icon: Instagram, label: '@arjun.campus', color: 'text-pink-500' },
                    { icon: Twitter, label: '@arjunmehta', color: 'text-sky-500' },
                    { icon: Linkedin, label: 'arjun-mehta', color: 'text-blue-600' },
                    { icon: Globe, label: 'arjun.dev', color: 'text-primary' },
                  ].map((s, i) => (
                    <button
                      key={i}
                      onClick={() => toast.info('Social links coming soon!')}
                      className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
                    >
                      <s.icon size={14} className={s.color} />
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pro upgrade card */}
              <div className="bg-gradient-to-br from-indigo-950 to-violet-900 rounded-2xl p-5 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Crown size={16} className="text-amber-400" />
                  <span className="text-sm font-bold">CampusKart Pro</span>
                </div>
                <p className="text-xs text-indigo-200 mb-4 leading-relaxed">
                  Unlock unlimited listings, verified badge, and 5x more views with Pro.
                </p>
                <div className="space-y-2 mb-4">
                  {['Unlimited listings', 'Verified badge', 'Priority placement', 'Analytics dashboard'].map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs text-indigo-100">
                      <Zap size={11} className="text-amber-400 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
                <Link
                  to="/premium"
                  className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 text-gray-900 text-xs font-bold hover:shadow-lg hover:shadow-amber-400/30 transition-all"
                >
                  <BadgeCheck size={13} />
                  Upgrade — ₹99/mo
                </Link>
              </div>
            </aside>

            {/* ── Right Main Panel ──────────────────────────────────────── */}
            <div className="flex-1 min-w-0">
              {/* Tabs */}
              <div className="flex gap-1 bg-muted/40 p-1 rounded-2xl mb-6 w-fit overflow-x-auto">
                {TABS.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
                        activeTab === tab.id ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon size={14} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">

                {/* ── My Listings ─────────────────────────────────────── */}
                {activeTab === 'listings' && (
                  <motion.div
                    key="listings"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="font-bold text-foreground font-heading">My Listings <span className="text-muted-foreground font-normal text-sm">({myListings.length})</span></h2>
                      <Link to="/sell" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all">
                        <Plus size={13} /> New Listing
                      </Link>
                    </div>

                    {loadingListings ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="bg-card border border-border rounded-3xl overflow-hidden animate-pulse">
                            <div className="h-40 bg-muted" />
                            <div className="p-4 space-y-2">
                              <div className="h-4 bg-muted rounded-full w-3/4" />
                              <div className="h-5 bg-muted rounded-full w-1/3" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : myListings.length === 0 ? (
                      <div className="text-center py-20 bg-card border border-border rounded-3xl">
                        <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-4">
                          <Package size={24} className="text-muted-foreground" />
                        </div>
                        <h3 className="font-bold text-foreground font-heading mb-2">No listings yet</h3>
                        <p className="text-muted-foreground text-sm mb-5">Post your first item and start selling</p>
                        <Link to="/sell" className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all">
                          Post an Item
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                        {myListings.map((listing, i) => (
                          <motion.div
                            key={listing.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: i * 0.07 }}
                            className="bg-card border border-border rounded-3xl overflow-hidden group"
                          >
                            <div className="relative h-40 overflow-hidden bg-muted">
                              <img src={listing.image} alt={listing.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              <div className="absolute top-2 right-2 flex gap-1.5">
                                <span className="px-2 py-0.5 rounded-full bg-green-500 text-white text-xs font-bold">Active</span>
                              </div>
                            </div>
                            <div className="p-4">
                              <h3 className="font-bold text-sm text-foreground font-heading mb-1 line-clamp-1">{listing.title}</h3>
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-primary font-bold text-base">₹{listing.price.toLocaleString()}</p>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Eye size={11} />
                                  <span>24 views</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Clock size={11} />
                                  {listing.postedAt}
                                </div>
                                <div className="flex gap-2">
                                  <Link
                                    to={`/listing/${listing.id}`}
                                    className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"
                                  >
                                    View
                                  </Link>
                                  
                               <button type="button" onClick={() => {
                                if (window.confirm(`Delete "${listing.title}"?`)) {
                               removeListingHandler(listing.id);
                                }
                              }}
                             className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-all">
                           <Trash2 size={13} />
                                Delete
                                </button>

                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── Saved Items ─────────────────────────────────────── */}
                {activeTab === 'saved' && (
                  <motion.div
                    key="saved"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="font-bold text-foreground font-heading">Saved Items <span className="text-muted-foreground font-normal text-sm">({savedItems.length})</span></h2>
                      <Link to="/listings" className="text-xs font-semibold text-primary hover:underline">Browse more</Link>
                    </div>

                    {savedItems.length === 0 ? (
                      <div className="text-center py-20 bg-card border border-border rounded-3xl">
                        <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-4">
                          <Heart size={24} className="text-muted-foreground" />
                        </div>
                        <h3 className="font-bold text-foreground font-heading mb-2">No saved items</h3>
                        <p className="text-muted-foreground text-sm mb-5">Browse listings and save items you like</p>
                        <Link to="/listings" className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all">
                          Browse Listings
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                        {savedItems.map((listing, i) => (
                          <motion.div
                            key={listing.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: i * 0.07 }}
                            className="bg-card border border-border rounded-3xl overflow-hidden group"
                          >
                            <Link to={`/listing/${listing.id}`} className="block relative h-40 overflow-hidden bg-muted">
                              <img src={listing.image} alt={listing.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            </Link>
                            <div className="p-4">
                              <Link to={`/listing/${listing.id}`}>
                                <h3 className="font-bold text-sm text-foreground font-heading mb-1 line-clamp-1 hover:text-primary transition-colors">{listing.title}</h3>
                              </Link>
                              <p className="text-primary font-bold text-base mb-3">₹{listing.price.toLocaleString()}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">{listing.seller.split(' ')[0]}</span>
                                <button
                                  onClick={() => unsaveHandler(listing.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 text-xs font-semibold text-red-500 hover:bg-red-50 transition-all"
                                >
                                  <Heart size={11} className="fill-red-500" />
                                  Unsave
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── Analytics ───────────────────────────────────────── */}
                {activeTab === 'stats' && (
                  <motion.div
                    key="stats"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="font-bold text-foreground font-heading">Analytics Overview</h2>
                      <Link to="/premium" className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors">
                        <Crown size={12} />
                        Unlock full analytics with Pro
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
                      {STAT_CARDS.map((stat, i) => (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.07 }}
                          className="bg-card border border-border rounded-3xl p-5"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                              <stat.icon size={18} className={stat.color} />
                            </div>
                            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <ArrowUpRight size={10} />
                              {stat.trend}
                            </span>
                          </div>
                          <p className={`text-2xl font-bold font-heading ${stat.color} mb-0.5`}>{stat.value}</p>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Points balance card */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/50 rounded-3xl p-6 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                            <Coins size={18} className="text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-amber-900 dark:text-amber-200 font-heading">Campus Points</p>
                            <p className="text-xs text-amber-700 dark:text-amber-400">Earn by listing &amp; selling</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-amber-700 dark:text-amber-300 font-heading">
                            {pointsBalance ?? 0}
                          </p>
                          <p className="text-xs text-amber-600 dark:text-amber-400">≈ ₹{pointsBalance ?? 0} value</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        {[
                          { label: 'Post a listing', pts: '+50 pts' },
                          { label: 'Complete a sale', pts: '+100 pts' },
                          { label: 'Get a review', pts: '+20 pts' },
                        ].map(item => (
                          <div key={item.label} className="bg-white/60 dark:bg-amber-900/20 rounded-xl p-2.5">
                            <p className="text-xs font-bold text-amber-700 dark:text-amber-300">{item.pts}</p>
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">{item.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pro analytics teaser */}
                    <div className="bg-gradient-to-br from-indigo-950 to-violet-900 rounded-3xl p-8 text-white text-center">
                      <Crown size={28} className="text-amber-400 mx-auto mb-3" />
                      <h3 className="text-lg font-bold font-heading mb-2">Unlock Advanced Analytics</h3>
                      <p className="text-indigo-200 text-sm mb-5 max-w-sm mx-auto">
                        See per-listing view trends, buyer demographics, best time to post, and revenue forecasts with CampusKart Pro.
                      </p>
                      <Link
                        to="/premium"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 text-gray-900 font-bold text-sm hover:shadow-xl hover:shadow-amber-400/30 transition-all"
                      >
                        <Zap size={15} />
                        Upgrade to Pro — ₹99/mo
                      </Link>
                    </div>
                  </motion.div>
                )}

                {/* ── Settings ────────────────────────────────────────── */}
                {activeTab === 'settings' && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.25 }}
                    className="max-w-xl space-y-5"
                  >
                    <h2 className="font-bold text-foreground font-heading mb-1">Account Settings</h2>

                    {/* Profile fields */}
                    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                      <h3 className="text-sm font-bold text-foreground mb-1">Profile Information</h3>
                      {[
                        { label: 'Display Name', value: sessionUser?.name ?? 'Guest', type: 'text' },
                        { label: 'Email', value: sessionUser?.email ?? '', type: 'email' },
                        { label: 'Phone', value: '+91 98765 43210', type: 'tel' },
                        { label: 'Location', value: 'Hostel Block A', type: 'text' },
                        { label: 'College / University', value: 'IIT Bombay', type: 'text' },
                      ].map(field => (
                        <div key={field.label}>
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">{field.label}</label>
                          <input
                            type={field.type}
                            defaultValue={field.value}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                          />
                        </div>
                      ))}
                      <button
                        onClick={() => toast.success('Profile updated!')}
                        className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all"
                      >
                        Save Changes
                      </button>
                    </div>

                    {/* Notification preferences */}
                    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                      <h3 className="text-sm font-bold text-foreground mb-1">Notifications</h3>
                      {[
                        { label: 'New messages', desc: 'Get notified when someone messages you', defaultChecked: true },
                        { label: 'Price drops', desc: 'Alert when a saved item drops in price', defaultChecked: true },
                        { label: 'New listings in category', desc: 'Notify when new items match your interests', defaultChecked: false },
                        { label: 'Weekly digest', desc: 'Summary of trending items on campus', defaultChecked: false },
                      ].map(pref => (
                        <div key={pref.label} className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{pref.label}</p>
                            <p className="text-xs text-muted-foreground">{pref.desc}</p>
                          </div>
                          <input
                            type="checkbox"
                            defaultChecked={pref.defaultChecked}
                            className="mt-0.5 w-4 h-4 accent-primary cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Danger zone */}
                    <div className="bg-card border border-red-100 rounded-2xl p-6">
                      <h3 className="text-sm font-bold text-red-600 mb-3">Danger Zone</h3>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-red-500 hover:border-red-200 transition-all"
                        >
                          <LogOut size={14} />
                          Sign Out
                        </button>
                        <button
                          onClick={() => toast.error('Account deletion requires contacting support.')}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
