import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Column 1: Logo + Tagline */}
          <div className="flex flex-col gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <ShoppingBag size={16} className="text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground font-heading">
                Campus<span className="text-primary">Kart</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              The smart marketplace built for students. Buy, sell, and connect — all within your campus.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              © {currentYear} CampusKart. All rights reserved.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-foreground font-heading">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              {[
                { href: '/listings', label: 'Browse Listings' },
                { href: '/sell', label: 'Post an Item' },
                { href: '/#how-it-works', label: 'How it Works' },
                { href: '/#categories', label: 'Categories' },
              ].map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors duration-150"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: CTA */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-foreground font-heading">Ready to sell?</h4>
            <p className="text-sm text-muted-foreground">
              List your item in under 2 minutes and reach hundreds of students on campus.
            </p>
            <Link
              to="/sell"
              className="mt-1 inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold transition-all duration-150 hover:bg-primary/90 hover:shadow-md w-fit"
            >
              + List an Item
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
