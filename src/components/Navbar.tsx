'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { COMPANY_INFO } from '@/data/puppies';

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Puppies', href: '/puppies' },
  { name: 'Happy families', href: '/happy-families' },
  { name: 'How it works', href: '/how-it-works' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Visit & contact', href: '/contact' },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      id="site-header"
      data-scrolled={scrolled}
      data-hidden="false"
      data-home={pathname === '/'}
      className="tp-header fixed inset-x-0 top-0 z-50"
    >
      <div className="tp-header__bar gutter">
        {/* Brand */}
        <Link className="tp-header__brand" aria-label="TeddyPups U.A.E. — home" href="/">
          <Image
            src="/brand/logo.png"
            alt=""
            width={56}
            height={56}
            className="tp-header__logo"
            priority
          />
          <span className="font-plush tp-header__name">TeddyPups</span>
        </Link>

        {/* Desktop Nav */}
        <nav aria-label="Main" className="tp-header__nav">
          <ul>
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.name}>
                  <Link
                    data-active={isActive}
                    aria-current={isActive ? 'page' : undefined}
                    className="tp-nav-link"
                    href={link.href}
                  >
                    <span>{link.name}</span>
                    <svg
                      viewBox="0 0 64 64"
                      className="tp-nav-link__paw"
                      aria-hidden="true"
                      fill="currentColor"
                    >
                      <path d="M32 30.5c-7.6 0-15.6 8.3-15.6 15.5 0 5.4 4.2 8.3 9.2 8.3 2.6 0 4.5-1.1 6.4-1.1s3.8 1.1 6.4 1.1c5 0 9.2-2.9 9.2-8.3 0-7.2-8-15.5-15.6-15.5zM19.28 26.71C21.07 30.08 20.42 33.92 17.84 35.29C15.25 36.67 11.71 35.05 9.92 31.69C8.13 28.32 8.78 24.48 11.36 23.11C13.95 21.73 17.49 23.35 19.28 26.71ZM29.62 15.64C30.32 19.62 28.46 23.26 25.47 23.79C22.48 24.32 19.48 21.53 18.78 17.56C18.08 13.58 19.94 9.94 22.93 9.41C25.92 8.88 28.92 11.67 29.62 15.64ZM45.22 17.56C44.52 21.53 41.52 24.32 38.53 23.79C35.54 23.26 33.68 19.62 34.38 15.64C35.08 11.67 38.08 8.88 41.07 9.41C44.06 9.94 45.92 13.58 45.22 17.56ZM54.08 31.69C52.29 35.05 48.75 36.67 46.16 35.29C43.58 33.92 42.93 30.08 44.72 26.71C46.51 23.35 50.05 21.73 52.64 23.11C55.22 24.48 55.87 28.32 54.08 31.69Z" />
                    </svg>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right CTA */}
        <div className="tp-header__end">
          <a
            href={`https://wa.me/${COMPANY_INFO.whatsappRaw}?text=${encodeURIComponent(
              "Hi TeddyPups! I'd love to know more about your puppies."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp tp-header__wa"
          >
            WhatsApp us
          </a>
        </div>
      </div>

      {/* Decorative Scalloped Hem Underneath */}
      <svg aria-hidden="true" className="tp-header__hem" width="100%" height="14" preserveAspectRatio="none">
        <defs>
          <pattern id="tp-hem" width="44" height="14" patternUnits="userSpaceOnUse">
            <path d="M0 0H44V2A22 11 0 0 1 0 2Z" className="tp-header__hem-fill" />
            <path d="M0 2A22 11 0 0 0 44 2" className="tp-header__hem-line" />
          </pattern>
        </defs>
        <rect width="100%" height="14" fill="url(#tp-hem)" />
      </svg>
    </header>
  );
}
