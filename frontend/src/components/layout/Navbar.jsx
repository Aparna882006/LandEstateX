import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import Button from '../common/Button';
import { useAuth } from '../../hooks/useAuth';

const NAV_LINKS = [
  { label: 'Buy', to: '/properties?purpose=buy' },
  { label: 'Rent', to: '/properties?purpose=rent' },
  { label: 'Sell', to: '/properties?purpose=sell' },
  { label: 'Invest', to: '/properties?purpose=invest' },
  { label: 'AI Tools', to: '/ai-tools' },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-700 text-lg font-bold text-white">
            X
          </span>
          <span className="text-lg font-semibold text-neutral-900">LandEstateX</span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className="text-sm font-medium text-neutral-900 transition hover:text-primary-700"
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <Button as={Link} to="/dashboard" variant="primary" size="sm">
              Dashboard
            </Button>
          ) : (
            <>
              <Button as={Link} to="/login" variant="ghost" size="sm">
                Log In
              </Button>
              <Button as={Link} to="/register" variant="primary" size="sm">
                Sign Up
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="text-neutral-900 lg:hidden"
          onClick={() => setIsMobileOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {isMobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </nav>

      {isMobileOpen && (
        <div className="border-t border-neutral-200 bg-white px-6 py-4 lg:hidden">
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                onClick={() => setIsMobileOpen(false)}
                className="text-sm font-medium text-neutral-900"
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-neutral-200 pt-4">
              {user ? (
                <Button as={Link} to="/dashboard" variant="primary" size="sm">
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button as={Link} to="/login" variant="secondary" size="sm">
                    Log In
                  </Button>
                  <Button as={Link} to="/register" variant="primary" size="sm">
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;