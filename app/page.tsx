import Link from "next/link";
import { Car, Bus, Plane, Zap, Salad, Drumstick, Target, BarChart2, Lightbulb, ArrowRight, Activity, Globe, Compass, CheckCircle2, Cpu, TrendingUp, Sparkles } from 'lucide-react';
import PlanetPulseLogo from "@/components/PlanetPulseLogo";
import ThemeToggle from "@/components/ThemeToggle";
import ScrollReveal from "@/components/ScrollReveal";
import LiveIndicator from "@/components/LiveIndicator";
import HeroHologramGlobe from "@/components/HeroHologramGlobe";

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* ============================================================
          Navigation
          ============================================================ */}
      <nav className="landing-nav" data-testid="landing-nav">
        <div className="landing-nav-inner">
          <Link href="/" className="logo-link">
            <PlanetPulseLogo size="sm" />
          </Link>
          <div className="nav-links">
            <Link href="#how-it-works" className="nav-link">
              How It Works
            </Link>
            <Link href="#activities" className="nav-link">
              Activities
            </Link>
            <Link href="/app" className="nav-link">
              Dashboard
            </Link>
            <ThemeToggle />
            <Link href="/app" className="btn btn-primary btn-sm" data-testid="cta-start-tracking">
              Start Tracking
            </Link>
          </div>
        </div>
      </nav>

      {/* ============================================================
          Section 1 — Cinematic Hero
          ============================================================ */}
      <section className="hero" data-testid="hero-section">
        <div className="hero-bg-wrapper" aria-hidden="true">
          <div className="hero-visual-layer" />
          <HeroHologramGlobe />
          <div className="hero-atmospheric-glow" />
          <div className="hero-overlay" />
        </div>
        <div className="hero-content">
          <div className="hero-badge-container">
            <LiveIndicator label="REAL-TIME CLIMATE INTELLIGENCE" className="hero-live-badge" />
          </div>
          <h1>
            Every choice leaves a <em>footprint.</em>
          </h1>
          <p className="hero-subtitle">
            Track the carbon behind your everyday choices, understand where it
            comes from, and turn small changes into measurable impact.
          </p>
          <div className="hero-actions">
            <Link href="/app" className="btn btn-primary btn-lg hero-cta-btn" data-testid="cta-view-dashboard">
              Start Tracking <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          Section 2 — How It Works
          ============================================================ */}
      <section className="landing-section" id="how-it-works" data-testid="how-it-works">
        <div className="landing-section-inner">
          <div className="landing-section-glass-pod">
            <div className="section-ambient-glow section-ambient-glow-1" />
            <div className="section-ambient-glow section-ambient-glow-2" />
            
            <ScrollReveal direction="up">
              <span className="section-label">How It Works</span>
              <h2 className="section-title">
                From everyday choices to visible impact.
              </h2>
              <p className="section-subtitle">
                Three structured steps to understanding and reducing your carbon footprint.
              </p>
            </ScrollReveal>

            <div className="steps-grid">
              <ScrollReveal direction="up" delay={0.1}>
                <div className="step-card">
                  <div className="step-header">
                    <div className="step-glass-icon-pod">
                      <Activity className="step-live-icon-svg" size={22} />
                      <div className="glass-icon-glow" />
                    </div>
                    <div className="step-badge-group">
                      <span className="step-number">01</span>
                      <span className="step-tag">Input</span>
                    </div>
                  </div>
                  <h4>Log</h4>
                  <p>Record an everyday activity — a commute, a meal, electricity usage — in seconds.</p>
                  <div className="step-visual-indicator">
                    <span className="step-dot active" />
                    <span className="step-line" />
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.2}>
                <div className="step-card">
                  <div className="step-header">
                    <div className="step-glass-icon-pod">
                      <Cpu className="step-live-icon-svg" size={22} />
                      <div className="glass-icon-glow" />
                    </div>
                    <div className="step-badge-group">
                      <span className="step-number">02</span>
                      <span className="step-tag">Compute</span>
                    </div>
                  </div>
                  <h4>Measure</h4>
                  <p>Convert it into a clear CO₂ footprint using verified, fixed emission factors.</p>
                  <div className="step-visual-indicator">
                    <span className="step-dot active" />
                    <span className="step-line" />
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.3}>
                <div className="step-card">
                  <div className="step-header">
                    <div className="step-glass-icon-pod">
                      <TrendingUp className="step-live-icon-svg" size={22} />
                      <div className="glass-icon-glow" />
                    </div>
                    <div className="step-badge-group">
                      <span className="step-number">03</span>
                      <span className="step-tag">Improve</span>
                    </div>
                  </div>
                  <h4>Understand</h4>
                  <p>See patterns, progress, and areas for improvement through clear data visualizations.</p>
                  <div className="step-visual-indicator">
                    <span className="step-dot active" />
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          Section 3 — Activity Footprints
          ============================================================ */}
      <section className="landing-section" id="activities" data-testid="activity-categories">
        <div className="landing-section-inner section-center">
          <div className="landing-section-glass-pod">
            <div className="section-ambient-glow section-ambient-glow-activities" />
            
            <ScrollReveal direction="up">
              <span className="section-label">Activity Footprints</span>
              <h2 className="section-title">
                Six choices. One measurable footprint.
              </h2>
              <p className="section-subtitle">
                Track the most impactful categories of your daily carbon footprint
                with verified emission factors.
              </p>
            </ScrollReveal>

            <div className="categories-grid">
              <ScrollReveal direction="up" delay={0.05}>
                <div className="category-card transport-theme">
                  <div className="category-card-top-row">
                    <div className="category-icon-glass transportation">
                      <Car className="activity-icon-svg car-pulse" size={26} />
                      <div className="icon-glass-shine" />
                      <div className="icon-glass-ambient-glow" />
                    </div>
                    <span className="category-pill transportation">
                      <span className="pill-pulse-dot" />
                      Transit
                    </span>
                  </div>
                  <h4>Car</h4>
                  <p className="category-factor">0.20 kg CO₂ / km</p>
                  <div className="category-meter-track">
                    <div className="category-meter-fill" style={{ width: '45%', backgroundColor: 'var(--color-transport)' }}>
                      <span className="meter-glow-tip" />
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.1}>
                <div className="category-card transport-theme">
                  <div className="category-card-top-row">
                    <div className="category-icon-glass transportation">
                      <Bus className="activity-icon-svg bus-pulse" size={26} />
                      <div className="icon-glass-shine" />
                      <div className="icon-glass-ambient-glow" />
                    </div>
                    <span className="category-pill transportation">
                      <span className="pill-pulse-dot" />
                      Transit
                    </span>
                  </div>
                  <h4>Bus</h4>
                  <p className="category-factor">0.08 kg CO₂ / km</p>
                  <div className="category-meter-track">
                    <div className="category-meter-fill" style={{ width: '20%', backgroundColor: 'var(--color-transport)' }}>
                      <span className="meter-glow-tip" />
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.15}>
                <div className="category-card transport-theme">
                  <div className="category-card-top-row">
                    <div className="category-icon-glass transportation">
                      <Plane className="activity-icon-svg plane-glide" size={26} />
                      <div className="icon-glass-shine" />
                      <div className="icon-glass-ambient-glow" />
                    </div>
                    <span className="category-pill transportation">
                      <span className="pill-pulse-dot" />
                      Transit
                    </span>
                  </div>
                  <h4>Flight</h4>
                  <p className="category-factor">0.25 kg CO₂ / km</p>
                  <div className="category-meter-track">
                    <div className="category-meter-fill" style={{ width: '60%', backgroundColor: 'var(--color-transport)' }}>
                      <span className="meter-glow-tip" />
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.2}>
                <div className="category-card electricity-theme">
                  <div className="category-card-top-row">
                    <div className="category-icon-glass electricity">
                      <Zap className="activity-icon-svg zap-sparkle" size={26} />
                      <div className="icon-glass-shine" />
                      <div className="icon-glass-ambient-glow" />
                    </div>
                    <span className="category-pill electricity">
                      <span className="pill-pulse-dot" />
                      Grid Energy
                    </span>
                  </div>
                  <h4>Electricity</h4>
                  <p className="category-factor">0.80 kg CO₂ / kWh</p>
                  <div className="category-meter-track">
                    <div className="category-meter-fill" style={{ width: '75%', backgroundColor: 'var(--color-electricity)' }}>
                      <span className="meter-glow-tip" />
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.25}>
                <div className="category-card food-theme">
                  <div className="category-card-top-row">
                    <div className="category-icon-glass food">
                      <Salad className="activity-icon-svg salad-bloom" size={26} />
                      <div className="icon-glass-shine" />
                      <div className="icon-glass-ambient-glow" />
                    </div>
                    <span className="category-pill food">
                      <span className="pill-pulse-dot" />
                      Diet
                    </span>
                  </div>
                  <h4>Veg Meal</h4>
                  <p className="category-factor">0.50 kg CO₂ / meal</p>
                  <div className="category-meter-track">
                    <div className="category-meter-fill" style={{ width: '30%', backgroundColor: 'var(--color-food)' }}>
                      <span className="meter-glow-tip" />
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.3}>
                <div className="category-card food-theme">
                  <div className="category-card-top-row">
                    <div className="category-icon-glass food-meat">
                      <Drumstick className="activity-icon-svg drumstick-flame" size={26} />
                      <div className="icon-glass-shine" />
                      <div className="icon-glass-ambient-glow" />
                    </div>
                    <span className="category-pill food-meat">
                      <span className="pill-pulse-dot" />
                      Diet
                    </span>
                  </div>
                  <h4>Non-Veg Meal</h4>
                  <p className="category-factor">2.00 kg CO₂ / meal</p>
                  <div className="category-meter-track">
                    <div className="category-meter-fill" style={{ width: '90%', backgroundColor: '#ef4444' }}>
                      <span className="meter-glow-tip" />
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          Section 4 — Dashboard Preview
          ============================================================ */}
      <section className="landing-section preview-section" data-testid="dashboard-preview">
        <div className="landing-section-inner section-center">
          <div className="landing-section-glass-pod preview-glass-pod">
            <div className="section-ambient-glow section-ambient-glow-preview" />
            
            <ScrollReveal direction="up">
              <span className="section-label">Dashboard</span>
              <h2 className="section-title">
                See your impact at a glance
              </h2>
              <p className="section-subtitle">
                A clean, data-driven dashboard shows your total footprint, category
                breakdowns, weekly trends, and recent activities.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.15}>
              <div className="preview-mockup">
                <div className="preview-stat">
                  <div className="preview-stat-header">
                    <span className="preview-stat-label">Total Footprint</span>
                    <span className="preview-live-indicator"><span className="preview-live-dot" /> Live</span>
                  </div>
                  <div className="preview-stat-value">
                    24.5<span className="preview-stat-unit">kg CO₂</span>
                  </div>
                  <div className="preview-mini-trend">
                    <TrendingUp size={14} className="trend-icon" /> 12% under baseline
                  </div>
                </div>
                
                <div className="preview-stat">
                  <div className="preview-stat-header">
                    <span className="preview-stat-label">Weekly Target</span>
                    <span className="preview-target-badge">On Track</span>
                  </div>
                  <div className="preview-stat-value">
                    49%<span className="preview-stat-unit">of 50 kg</span>
                  </div>
                  <div className="preview-mini-bar">
                    <div className="preview-mini-bar-fill" style={{ width: '49%' }} />
                  </div>
                </div>
                
                <div className="preview-stat">
                  <div className="preview-stat-header">
                    <span className="preview-stat-label">Top Category</span>
                    <span className="category-pill transportation preview-pill">Transit</span>
                  </div>
                  <div className="preview-stat-value category-name-val">
                    Transportation
                  </div>
                  <div className="preview-mini-detail">
                    12.4 kg CO₂ (51% share)
                  </div>
                </div>
                
                <div className="preview-stat">
                  <div className="preview-stat-header">
                    <span className="preview-stat-label">Activities Logged</span>
                    <span className="preview-count-badge">Active</span>
                  </div>
                  <div className="preview-stat-value">
                    12<span className="preview-stat-unit">this week</span>
                  </div>
                  <div className="preview-mini-detail">
                    Last logged: 2 hours ago
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.25}>
              <div className="preview-cta">
                <Link href="/app" className="btn btn-primary btn-lg">
                  Explore Your Footprint <ArrowRight size={18} />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ============================================================
          Section 5 — Weekly Target
          ============================================================ */}
      <section className="landing-section" data-testid="weekly-goals">
        <div className="landing-section-inner">
          <div className="landing-section-glass-pod">
            <div className="goals-content">
              <ScrollReveal direction="left">
                <div>
                  <span className="section-label">Weekly Target</span>
                  <h2 className="section-title">Know where you stand.</h2>
                  <p className="section-subtitle">
                    Set a personal weekly CO₂ target and track your progress with
                    clear visual indicators. PlanetPulse helps you understand your
                    impact without judgment.
                  </p>
                  <div className="goals-features">
                    <div className="goals-feature">
                      <div className="goals-feature-icon"><Target size={20} /></div>
                      <div>
                        <h5>Custom Targets</h5>
                        <p>Set a weekly CO₂ target that works for your lifestyle.</p>
                      </div>
                    </div>
                    <div className="goals-feature">
                      <div className="goals-feature-icon"><BarChart2 size={20} /></div>
                      <div>
                        <h5>Real-time Progress</h5>
                        <p>See exactly how much of your target you&apos;ve used.</p>
                      </div>
                    </div>
                    <div className="goals-feature">
                      <div className="goals-feature-icon"><Lightbulb size={20} /></div>
                      <div>
                        <h5>Smart Nudges</h5>
                        <p>
                          Get constructive suggestions when you exceed your target —
                          never shamed.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="right" delay={0.2}>
                <div className="goals-visual">
                  <div className="goals-progress-demo">
                    <div className="target-hero-value">11.76</div>
                    <div className="target-hero-of">kg of</div>
                    <div className="target-hero-total">50 kg CO₂</div>
                    <div className="target-hero-bar">
                      <div className="target-hero-bar-fill" style={{ width: '23.5%' }} />
                    </div>
                    <div className="target-hero-percent">23.5% used</div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          Section 6 — Final CTA
          ============================================================ */}
      <section className="cta-section" data-testid="cta-section">
        <ScrollReveal direction="up">
          <h2>Small choices become visible <em style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic' }}>change.</em></h2>
          <p>
            Start tracking the choices that shape your footprint.
          </p>
          <Link href="/app" className="btn btn-primary btn-lg">
            Start Tracking <ArrowRight size={18} />
          </Link>
        </ScrollReveal>
      </section>

      {/* ============================================================
          Footer
          ============================================================ */}
      <footer className="landing-footer" data-testid="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <PlanetPulseLogo size="sm" />
          </div>
          <p className="footer-text">
            Built for the Code2Career AI Hackathon — Track 2: Climate Tech
          </p>
        </div>
      </footer>
    </div>
  );
}
