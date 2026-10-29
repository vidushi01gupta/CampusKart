import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, MessageCircle, User, LogOut, LogIn, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { authClient } from '@/lib/auth/auth-client';
import { toast } from 'sonner';
import { useTheme } from '@/lib/use-theme';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const sessionUser = session?.user;
  const { isDark, toggleTheme } = useTheme();

  const navItems = [
    { href: '/listings', label: 'Browse' },
    { href: '/sell', label: 'Sell' },
    { href: '/premium', label: '✦ Pro', highlight: true },
  ];

  const isActive = (href: string) => location.pathname === href;

  const handleSignOut = async () => {
    await authClient.signOut();
    toast.success('Signed out');
    navigate('/');
  };

  // Initials from name
  const initials = sessionUser
    ? sessionUser.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : null;

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <ShoppingBag size={16} className="text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground font-heading">
              Campus<span className="text-primary">Kart</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`text-sm font-semibold transition-colors duration-150 hover:text-primary ${
                  isActive(item.href) ? 'text-foreground' : item.highlight ? 'text-amber-500 hover:text-amber-600' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors duration-150"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <Link
              to="/chat"
              className={`relative p-2.5 rounded-xl hover:bg-muted transition-colors duration-150 ${isActive('/chat') ? 'text-primary' : 'text-muted-foreground'}`}
              aria-label="Messages"
            >
              <MessageCircle size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </Link>

            {sessionUser ? (
              <>
                <Link
                  to="/profile"
                  className={`flex items-center justify-center w-9 h-9 rounded-xl text-xs font-bold bg-indigo-100 text-indigo-700 hover:ring-2 hover:ring-primary/30 transition-all ${isActive('/profile') ? 'ring-2 ring-primary/30' : ''}`}
                  aria-label="Profile"
                >
                  {initials}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors duration-150"
                  aria-label="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <Link
                to="/auth/login"
                className="flex items-center gap-1.5 p-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-colors duration-150"
                aria-label="Log in"
              >
                <LogIn size={18} />
              </Link>
            )}

            <Link
              to="/sell"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold transition-all duration-150 hover:bg-primary/90 hover:shadow-md ml-1"
            >
              + Post Item
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-muted rounded-xl transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <nav className="flex flex-col gap-1 mb-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="text-sm font-semibold text-muted-foreground hover:text-primary py-2.5 px-2 rounded-xl hover:bg-muted transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link to="/chat" className="text-sm font-semibold text-muted-foreground hover:text-primary py-2.5 px-2 rounded-xl hover:bg-muted transition-colors flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                <MessageCircle size={15} /> Messages
              </Link>
              <button
                onClick={() => { toggleTheme(); }}
                className="text-sm font-semibold text-muted-foreground hover:text-primary py-2.5 px-2 rounded-xl hover:bg-muted transition-colors flex items-center gap-2 w-full text-left"
              >
                {isDark ? <Sun size={15} /> : <Moon size={15} />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>
              {sessionUser ? (
                <>
                  <Link to="/profile" className="text-sm font-semibold text-muted-foreground hover:text-primary py-2.5 px-2 rounded-xl hover:bg-muted transition-colors flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                    <User size={15} /> Profile ({sessionUser.name.split(' ')[0]})
                  </Link>
                  <button onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }} className="text-sm font-semibold text-red-500 hover:text-red-700 py-2.5 px-2 rounded-xl hover:bg-red-50 transition-colors flex items-center gap-2 text-left">
                    <LogOut size={15} /> Sign Out
                  </button>
                </>
              ) : (
                <Link to="/auth/login" className="text-sm font-semibold text-muted-foreground hover:text-primary py-2.5 px-2 rounded-xl hover:bg-muted transition-colors flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                  <LogIn size={15} /> Log In / Sign Up
                </Link>
              )}
            </nav>
            <Link
              to="/sell"
              className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              + Post an Item
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
