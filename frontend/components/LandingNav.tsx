'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User } from 'lucide-react';
import PlanetPulseLogo from '@/components/PlanetPulseLogo';

export default function LandingNav() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');

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

  const getLinkStyle = (id: string) => {
    let isActive = activeSection === id;
    if (pathname === '/what-if' && id === 'what-if') isActive = true;
    
    if (isActive) {
      return { 
        backgroundColor: 'var(--color-primary-green)', 
        color: '#fff', 
        padding: '6px 16px', 
        borderRadius: '999px',
        fontSize: '0.9rem',
        fontWeight: 500
      };
    }
    return { fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 };
  };

  return (
    <nav 
      className="landing-nav" 
      data-testid="landing-nav"
      style={{
        transition: 'all 0.3s ease',
        background: isScrolled ? 'var(--glass-bg)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(16px) saturate(180%)' : 'none',
        WebkitBackdropFilter: isScrolled ? 'blur(16px) saturate(180%)' : 'none',
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
      <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
        <Link href="/" className="logo-link">
          <PlanetPulseLogo size="sm" />
        </Link>
      </div>
      
      <div className="nav-links" style={{ display: "flex", gap: "1.5rem", alignItems: "center", justifyContent: 'center', flex: 1 }}>
        <Link href="/#how-it-works" style={getLinkStyle('how-it-works')}>
          How It Works
        </Link>
        <Link href="/#activities" style={getLinkStyle('activities')}>
          Activities
        </Link>
        <Link href="/#what-if" style={getLinkStyle('what-if')}>
          What If
        </Link>
        <Link href="/app" style={getLinkStyle('dashboard')}>
          Dashboard
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', flex: 1 }}>
        {/* Removed extra buttons as requested */}
      </div>
    </nav>
  );
}
