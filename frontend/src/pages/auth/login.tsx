import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShoppingBag, BookOpen, Bike } from 'lucide-react';
import { authClient } from '@/lib/auth/auth-client';
import { toast } from 'sonner';

type Mode = 'login' | 'signup';

const FLOATING_ITEMS = [
  { icon: BookOpen, label: 'Textbooks', color: 'bg-indigo-100 text-indigo-600', rotate: -8, x: '8%', y: '18%' },
  { icon: Bike, label: 'Bikes', color: 'bg-amber-100 text-amber-600', rotate: 6, x: '82%', y: '12%' },
  { icon: ShoppingBag, label: 'Deals', color: 'bg-emerald-100 text-emerald-600', rotate: -4, x: '88%', y: '72%' },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/profile';
  const [mode, setMode] = useState<Mode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await authClient.signUp.email({ name, email, password });
        if (error) throw new Error(error.message ?? 'Sign up failed');
        toast.success('Account created! Welcome to CampusKart.');
        navigate(from, { replace: true });
      } else {
        const { error } = await authClient.signIn.email({ email, password });
        if (error) throw new Error(error.message ?? 'Login failed');
        toast.success('Welcome back!');
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      toast.error(err.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <title>{mode === 'login' ? 'Log In' : 'Sign Up'} — CampusKart</title>
      <meta name="description" content="Log in or sign up to buy and sell on CampusKart." />

      <div className="min-h-screen bg-background flex">
        {/* Left panel — decorative */}
        <div className="hidden lg:flex flex-col flex-1 relative bg-primary overflow-hidden">
          {/* Dot grid */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          {/* Blobs */}
          <motion.div
            animate={{ scale: [1, 1.12, 1], x: [0, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' as const }}
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/10"
          />
          <motion.div
            animate={{ scale: [1, 1.08, 1], x: [0, -15, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' as const, delay: 3 }}
            className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-white/10"
          />

          {/* Floating item badges */}
          {FLOATING_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
              transition={{
                opacity: { delay: 0.4 + i * 0.15, duration: 0.4 },
                scale: { delay: 0.4 + i * 0.15, duration: 0.4, type: 'spring', stiffness: 260 },
                y: { delay: i * 0.5, duration: 3 + i, repeat: Infinity, ease: 'easeInOut' as const },
              }}
              style={{ position: 'absolute', left: item.x, top: item.y, rotate: item.rotate }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl ${item.color} shadow-lg backdrop-blur-sm`}
            >
              <item.icon size={16} />
              <span className="text-sm font-bold">{item.label}</span>
            </motion.div>
          ))}

          {/* Center copy */}
          <div className="relative z-10 flex flex-col items-start justify-center h-full px-14">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-2 mb-8">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <ShoppingBag size={18} className="text-white" />
                </div>
                <span className="text-white font-bold text-lg font-heading">CampusKart</span>
              </div>
              <h2 className="text-4xl font-bold text-white font-heading tracking-tight leading-tight mb-4">
                Your campus.<br />Your marketplace.
              </h2>
              <p className="text-primary-foreground/70 text-base leading-relaxed max-w-xs">
                Buy and sell textbooks, electronics, bikes, and more — all within your campus community.
              </p>

              <div className="mt-10 flex flex-col gap-3">
                {['Free to list and browse', 'Verified campus sellers', 'Safe on-campus meetups'].map((point, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
                    className="flex items-center gap-2.5"
                  >
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span className="text-primary-foreground/80 text-sm">{point}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 lg:max-w-[480px] flex flex-col items-center justify-center px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-sm"
          >
            {/* Logo (mobile only) */}
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                <ShoppingBag size={16} className="text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground font-heading">CampusKart</span>
            </div>

            {/* Mode toggle */}
            <div className="flex bg-muted p-1 rounded-2xl mb-8">
              {(['login', 'signup'] as Mode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold capitalize transition-all duration-200 ${
                    mode === m ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {m === 'login' ? 'Log In' : 'Sign Up'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
              >
                <h1 className="text-2xl font-bold text-foreground font-heading tracking-tight mb-1">
                  {mode === 'login' ? 'Welcome back' : 'Create your account'}
                </h1>
                <p className="text-muted-foreground text-sm mb-7">
                  {mode === 'login'
                    ? 'Log in to browse and manage your listings.'
                    : 'Join thousands of students buying and selling on campus.'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'signup' && (
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wide">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        placeholder="Arjun Mehta"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wide">College Email</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        placeholder="you@college.edu"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wide">Password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        minLength={8}
                        placeholder="Min. 8 characters"
                        className="w-full pl-10 pr-11 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {mode === 'login' && (
                    <div className="flex justify-end">
                      <button type="button" className="text-xs text-primary hover:underline font-semibold">
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 transition-all duration-150 disabled:opacity-60 mt-2"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        {mode === 'login' ? 'Logging in...' : 'Creating account...'}
                      </span>
                    ) : (
                      <>
                        {mode === 'login' ? 'Log In' : 'Create Account'}
                        <ArrowRight size={15} />
                      </>
                    )}
                  </motion.button>
                </form>

                <p className="text-center text-xs text-muted-foreground mt-6">
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                    className="text-primary font-bold hover:underline"
                  >
                    {mode === 'login' ? 'Sign up free' : 'Log in'}
                  </button>
                </p>

                {mode === 'signup' && (
                  <p className="text-center text-xs text-muted-foreground/60 mt-4 leading-relaxed">
                    By signing up you agree to our{' '}
                    <span className="underline cursor-pointer">Terms of Service</span>
                    {' '}and{' '}
                    <span className="underline cursor-pointer">Privacy Policy</span>.
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </>
  );
}
