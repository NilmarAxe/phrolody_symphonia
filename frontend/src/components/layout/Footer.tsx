import Link from 'next/link';
import { Music, Github, Twitter, Mail, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const navigation = {
    product: [
      { name: 'Browse', href: '/browse' },
      { name: 'Genres', href: '/genres' },
      { name: 'Periods', href: '/periods' },
      { name: 'About', href: '/about' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact', href: '/contact' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Feedback', href: '/feedback' },
    ],
    legal: [
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Licenses', href: '/licenses' },
    ],
  };

  const social = [
    {
      name: 'GitHub',
      href: 'https://github.com',
      icon: Github,
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com',
      icon: Twitter,
    },
    {
      name: 'Email',
      href: 'mailto:contact@phrolodysymphonia.com',
      icon: Mail,
    },
  ];

  return (
    <footer className="bg-neutral-900 border-t border-neutral-800 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 group mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center group-hover:shadow-glow-primary transition-shadow">
                <Music className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-secondary-200">
                Phrolody Symphonia
              </span>
            </Link>
            <p className="text-neutral-500 text-sm mb-4 max-w-sm">
              Immerse yourself in the timeless beauty of classical music. 
              Stream masterpieces from Baroque to Contemporary.
            </p>
            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {social.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-secondary-200 transition-colors"
                    aria-label={item.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-secondary-200 mb-4 uppercase tracking-wider">
              Product
            </h3>
            <ul className="space-y-3">
              {navigation.product.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-neutral-500 hover:text-primary-500 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-secondary-200 mb-4 uppercase tracking-wider">
              Support
            </h3>
            <ul className="space-y-3">
              {navigation.support.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-neutral-500 hover:text-primary-500 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-secondary-200 mb-4 uppercase tracking-wider">
              Legal
            </h3>
            <ul className="space-y-3">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-neutral-500 hover:text-primary-500 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-neutral-500 text-center md:text-left">
              © {currentYear} Phrolody Symphonia. All rights reserved.
            </p>
            <p className="text-sm text-neutral-500 flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-primary-500 fill-primary-500" /> for classical music lovers
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}