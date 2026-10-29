import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ShoppingBag, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

type LoginData = { email: string; password: string };
type SignupData = { name: string; email: string; password: string; confirmPassword: string };

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const loginForm = useForm<LoginData>();
  const signupForm = useForm<SignupData>();

  const onLogin = (_data: LoginData) => {
    toast.success('Welcome back!');
  };

  const onSignup = (data: SignupData) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Account created! Welcome to CampusKart.');
  };

  return (
    <>
      <title>{mode === 'login' ? 'Login' : 'Sign Up'} — CampusKart</title>

      <div className="min-h-screen bg-background flex">
        {/* Left panel — decorative */}
        <div className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 bg-primary p-12 relative overflow-hidden">
          {/* Background pattern */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1.5px, transparent 1.5px)',
              backgroundSize: '28px 28px',
            }}
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], rotate: [0, 10, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' as const }}
            className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' as const, delay: 3 }}
            className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full bg-white/5"
          />

          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <ShoppingBag size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white font-heading">CampusBazaar</span>
            </Link>
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-white font-heading leading-tight mb-4">
              The smartest way to buy & sell on campus.
            </h2>
            <p className="text-white/70 text-base leading-relaxed mb-8">
              Join 500+ students already trading textbooks, electronics, furniture, and more.
            </p>
            <div className="space-y-3">
              {[
                'Free to list, free to buy',
                'Verified campus-only sellers',
                'Meet safely on campus',
              ].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle size={16} className="text-white/80 flex-shrink-0" />
                  <span className="text-white/80 text-sm font-medium">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-white/40 text-xs">© 2026 CampusBazaar. All rights reserved.</p>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <ShoppingBag size={16} className="text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground font-heading">CampusBazaar</span>
            </Link>

            {/* Tab switcher */}
            <div className="flex gap-1 bg-muted/50 p-1 rounded-2xl mb-8">
              {(['login', 'signup'] as const).map(m => (
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
              {mode === 'login' ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <h1 className="text-2xl font-bold text-foreground font-heading mb-1">Welcome back</h1>
                  <p className="text-muted-foreground text-sm mb-7">Log in to your CampusKart account</p>

                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Email</label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          {...loginForm.register('email', { required: true, pattern: /^\S+@\S+\.\S+$/ })}
                          type="email"
                          placeholder="you@college.edu"
                          className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                        />
                      </div>
                      {loginForm.formState.errors.email && <p className="text-xs text-red-500 mt-1">Valid email required</p>}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Password</label>
                        <Link to="#" className="text-xs text-primary hover:underline font-semibold">Forgot password?</Link>
                      </div>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          {...loginForm.register('password', { required: true, minLength: 6 })}
                          type={showPass ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-11 py-3.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                        />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      {loginForm.formState.errors.password && <p className="text-xs text-red-500 mt-1">Password required (min 6 chars)</p>}
                    </div>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 transition-all duration-150 mt-2"
                    >
                      Log In
                      <ArrowRight size={15} />
                    </motion.button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <h1 className="text-2xl font-bold text-foreground font-heading mb-1">Create account</h1>
                  <p className="text-muted-foreground text-sm mb-7">Join CampusKart — it's completely free</p>

                  <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Full Name</label>
                      <div className="relative">
                        <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          {...signupForm.register('name', { required: true, minLength: 2 })}
                          placeholder="Arjun Mehta"
                          className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                        />
                      </div>
                      {signupForm.formState.errors.name && <p className="text-xs text-red-500 mt-1">Name required</p>}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">College Email</label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          {...signupForm.register('email', { required: true, pattern: /^\S+@\S+\.\S+$/ })}
                          type="email"
                          placeholder="you@college.edu"
                          className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                        />
                      </div>
                      {signupForm.formState.errors.email && <p className="text-xs text-red-500 mt-1">Valid email required</p>}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Password</label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          {...signupForm.register('password', { required: true, minLength: 6 })}
                          type={showPass ? 'text' : 'password'}
                          placeholder="Min 6 characters"
                          className="w-full pl-10 pr-11 py-3.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                        />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Confirm Password</label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          {...signupForm.register('confirmPassword', { required: true })}
                          type={showConfirm ? 'text' : 'password'}
                          placeholder="Repeat password"
                          className="w-full pl-10 pr-11 py-3.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                        />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 transition-all duration-150 mt-2"
                    >
                      Create Account
                      <ArrowRight size={15} />
                    </motion.button>

                    <p className="text-center text-xs text-muted-foreground">
                      By signing up you agree to our{' '}
                      <Link to="/terms" className="text-primary hover:underline">Terms</Link>
                    </p>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
