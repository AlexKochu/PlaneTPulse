'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import PlanetPulseLogo from '@/components/PlanetPulseLogo';

export default function LandingNav() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Setup observer for sections
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, { threshold: 0.3, rootMargin: "-20% 0px -20% 0px" });

    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => observer.observe(section));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      sections.forEach(section => observer.unobserve(section));
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const navLinks = [
    { href: '/#how-it-works', id: 'how-it-works', label: 'How It Works' },
    { href: '/#activities', id: 'activities', label: 'Activities' },
    { href: '/#what-if', id: 'what-if', label: 'What If' },
    { href: '/app/coach', id: 'coach', label: 'Ask Coach' },
    { href: '/app', id: 'dashboard', label: 'Dashboard' },
    { href: '/#methodology', id: 'methodology', label: 'Methodology' },
  ];

  const isActive = (id: string) => {
    if (pathname === '/what-if' && id === 'what-if') return true;
    return activeSection === id;
  };

  return (
    <>
      <nav 
        className="landing-nav" 
        data-testid="landing-nav"
        style={{
          transition: 'all 0.3s ease',
          background: isScrolled || mobileOpen ? 'var(--glass-bg)' : 'transparent',
          backdropFilter: isScrolled || mobileOpen ? 'blur(16px) saturate(180%)' : 'none',
          WebkitBackdropFilter: isScrolled || mobileOpen ? 'blur(16px) saturate(180%)' : 'none',
          borderBottom: isScrolled ? '1px solid var(--glass-border-subtle)' : '1px solid transparent',
          boxShadow: isScrolled ? 'var(--glass-shadow)' : 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: '0 var(--space-xl)',
          height: 'var(--nav-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <Link href="/" className="logo-link">
            <PlanetPulseLogo size="sm" />
          </Link>
        </div>
        
        {/* Desktop nav links */}
        <div className="landing-nav-desktop" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', flex: 1, flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
          {navLinks.map(link => (
            <Link
              key={link.id}
              href={link.href}
              className={`landing-nav-link ${isActive(link.id) ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop spacer */}
        <div className="landing-nav-desktop" style={{ flexShrink: 0, width: '40px' }} />

        {/* Mobile hamburger button */}
        <button
          className="landing-nav-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          style={{
            display: 'none', /* shown via CSS media query */
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            color: isScrolled ? 'var(--color-text)' : '#fff',
            zIndex: 110,
          }}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile slide-down menu */}
      <div
        className={`landing-nav-mobile-menu ${mobileOpen ? 'open' : ''}`}
        style={{
          position: 'fixed',
          top: 'var(--nav-height)',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 99,
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          display: 'none', /* shown via CSS */
          flexDirection: 'column',
          padding: '1.5rem',
          gap: '0.5rem',
          transform: mobileOpen ? 'translateY(0)' : 'translateY(-100%)',
          opacity: mobileOpen ? 1 : 0,
          transition: 'transform 0.3s ease, opacity 0.25s ease',
          overflowY: 'auto',
        }}
      >
        {navLinks.map(link => (
          <Link
            key={link.id}
            href={link.href}
            className={`landing-nav-mobile-link ${isActive(link.id) ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Backdrop overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 98,
            background: 'rgba(0,0,0,0.3)',
          }}
        />
      )}
    </>
  );
}
