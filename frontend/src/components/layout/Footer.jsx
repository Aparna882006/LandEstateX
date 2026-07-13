import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiLinkedin } from 'react-icons/fi';

const FOOTER_LINKS = {
  Product: [
    { label: 'Buy', to: '/properties?purpose=buy' },
    { label: 'Rent', to: '/properties?purpose=rent' },
    { label: 'Sell', to: '/properties?purpose=sell' },
    { label: 'AI Tools', to: '/ai-tools' },
  ],
  Company: [
    { label: 'About', to: '/about' },
    { label: 'Careers', to: '/careers' },
    { label: 'Blog', to: '/blog' },
    { label: 'Contact', to: '/contact' },
  ],
  'For Professionals': [
    { label: 'For Brokers', to: '/register' },
    { label: 'For Builders', to: '/register' },
    { label: 'Partner with Us', to: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms of Service', to: '/terms' },
    { label: 'RERA Disclosures', to: '/rera' },
  ],
};

const Footer = () => {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-0">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-700 text-lg font-bold text-white">
                X
              </span>
              <span className="text-lg font-semibold text-neutral-900">LandEstateX</span>
            </div>
            <p className="mt-3 text-sm text-neutral-500">
              AI-powered property decisions, made transparent.
            </p>
            <div className="mt-4 flex gap-3 text-neutral-500">
              <a href="https://twitter.com" aria-label="Twitter" className="hover:text-primary-700">
                <FiTwitter size={18} />
              </a>
              <a href="https://instagram.com" aria-label="Instagram" className="hover:text-primary-700">
                <FiInstagram size={18} />
              </a>
              <a href="https://linkedin.com" aria-label="LinkedIn" className="hover:text-primary-700">
                <FiLinkedin size={18} />
              </a>
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-sm font-semibold text-neutral-900">{heading}</h4>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-neutral-500 transition hover:text-primary-700"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-neutral-200 pt-6 text-xs text-neutral-500 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} LandEstateX. All rights reserved.</p>
          <p>AI-assisted insights — always verify legal documents independently.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;