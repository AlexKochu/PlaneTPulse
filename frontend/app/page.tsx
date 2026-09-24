import Link from "next/link";
import { Car, Bus, Plane, Zap, Salad, Drumstick, Target, BarChart2, Lightbulb, ArrowRight, Activity, Globe, Compass, Cpu, TrendingUp } from 'lucide-react';
import PlanetPulseLogo from "@/components/PlanetPulseLogo";
import LiveIndicator from "@/components/LiveIndicator";
import HeroLivingScene from "@/components/HeroLivingScene";
import LandingNav from "@/components/LandingNav";
import ScrollJourney from "@/components/ScrollJourney";
import { Reveal, StaggerContainer, StaggerItem, CountUp, TiltCard, MagneticButton, JourneySection } from "@/components/Motion";

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* ============================================================
          Navigation
          ============================================================ */}
      <LandingNav />
      <ScrollJourney />

      {/* ============================================================
          Section 1 — Cinematic Hero
          ============================================================ */}
      <JourneySection className="hero" data-testid="hero-section">
        <HeroLivingScene />
        
        <div className="hero-content" style={{ zIndex: 10, position: 'relative' }}>
          {/* Text-contrast overlay — darkens only the central text area */}
          <div style={{
            position: 'absolute',
            inset: '-60px -80px',
            background: 'radial-gradient(ellipse at 50% 45%, rgba(4,14,8,0.55) 0%, rgba(4,14,8,0.25) 55%, transparent 80%)',
            pointerEvents: 'none',
            zIndex: 0,
          }} />
          <Reveal direction="up" delay={0.1}>
            <div className="hero-badge-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', backgroundColor: 'rgba(30,80,50,0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(120,220,160,0.45)', borderRadius: '999px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#6ee7a0' }}></div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', color: '#9DF5C0', textTransform: 'uppercase' }}>
                  Carbon Footprint Tracker
                </span>
              </div>
            </div>
          </Reveal>
          
          <div style={{ position: 'relative', zIndex: 2 }}>
          <StaggerContainer delay={0.2} staggerChildren={0.15}>
            <StaggerItem>
              <h1 className="hero-title" style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '4.5rem',
                fontWeight: 400,
                color: '#ffffff',
                lineHeight: 1.1,
                marginBottom: '24px',
                position: 'relative',
                zIndex: 2,
                textShadow: '0 2px 24px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.9)',
              }}>
                Every choice leaves a{' '}
                <em style={{
                  color: '#6ee7a0',
                  fontStyle: 'italic',
                  textShadow: '0 0 32px rgba(80,210,120,0.6), 0 2px 12px rgba(0,0,0,0.8)',
                }}>footprint.</em>
              </h1>
            </StaggerItem>
            <StaggerItem>
              <p className="hero-subtitle" style={{
                fontSize: '1.2rem',
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                color: 'rgba(235, 252, 243, 0.95)',
                maxWidth: '620px',
                margin: '0 auto 2rem auto',
                fontWeight: 500,
                lineHeight: 1.7,
                letterSpacing: '0.01em',
                position: 'relative',
                zIndex: 2,
                textShadow: '0 1px 12px rgba(0,0,0,0.85), 0 2px 24px rgba(0,0,0,0.6)',
              }}>
                Track the carbon behind your everyday choices, understand where it comes from, and turn small changes into measurable impact.
              </p>
            </StaggerItem>
            <StaggerItem>
              <div className="hero-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '80px' }}>
                <Link href="/app" style={{ display: 'contents' }}>
                  <MagneticButton className="btn btn-primary btn-lg hero-cta-btn" data-testid="cta-view-dashboard" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '999px', padding: '16px 32px', fontSize: '1.1rem' }}>
                    Start Tracking <ArrowRight size={18} />
                  </MagneticButton>
                </Link>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                backgroundColor: 'rgba(255, 255, 255, 0.75)', 
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '16px',
                padding: '24px 48px',
                maxWidth: '900px',
                margin: '0 auto',
                boxShadow: '0 8px 32px rgba(15,61,42,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
                border: '1px solid rgba(31,157,107,0.15)',
                textAlign: 'left'
              }}>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Atmospheric CO₂</div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--color-text)' }}>422.8 <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>ppm</span></div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Global Target</div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--color-text)' }}>≤ 2.1 <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>t/yr</span></div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Active Cohort</div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--color-primary-green)' }}>18,420 <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>members</span></div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Verified Factors</div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--color-text)' }}>IPCC / DEFRA</div>
                </div>
              </div>
            </StaggerItem>
          </StaggerContainer>
          </div>
        </div>
        
        <svg className="hero-pulse-line" viewBox="0 0 1000 100" style={{ position: 'absolute', bottom: '15%', width: '100%', stroke: 'var(--color-emerald)', fill: 'none', strokeWidth: 2, zIndex: 5, pointerEvents: 'none', opacity: 0.5 }}>
          <path d="M0,50 L300,50 L320,20 L350,90 L380,10 L410,70 L430,50 L1000,50" />
        </svg>
      </JourneySection>

      {/* ============================================================
          Section 2 — How It Works
          ============================================================ */}
      <JourneySection className="landing-section" id="how-it-works" data-testid="how-it-works">
        <div className="landing-section-inner">
          <div className="landing-section-glass-pod">
            <div className="section-ambient-glow section-ambient-glow-1" />
            <div className="section-ambient-glow section-ambient-glow-2" />
            
            <Reveal direction="up">
              <span className="section-label">How It Works</span>
              <h2 className="section-title">
                From everyday choices to visible impact.
              </h2>
              <p className="section-subtitle">
                Three structured steps to understanding and reducing your carbon footprint.
              </p>
            </Reveal>

            <div className="steps-grid">
              <Reveal direction="up" delay={0.1}>
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
              </Reveal>

              <Reveal direction="up" delay={0.2}>
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
              </Reveal>

              <Reveal direction="up" delay={0.3}>
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
              </Reveal>
            </div>
          </div>
        </div>
      </JourneySection>

      {/* ============================================================
          Section 3 — Activity Footprints
          ============================================================ */}
      <JourneySection className="landing-section" id="activities" data-testid="activity-categories">
        <div className="landing-section-inner section-center">
          <div className="landing-section-glass-pod">
            <div className="section-ambient-glow section-ambient-glow-activities" />
            
            <Reveal direction="up">
              <span className="section-label">Activity Footprints</span>
              <h2 className="section-title">
                Six choices. One measurable footprint.
              </h2>
              <p className="section-subtitle">
                Track the most impactful categories of your daily carbon footprint
                with verified emission factors.
              </p>
            </Reveal>

            <div className="categories-grid">
              <Reveal direction="up" delay={0.05}>
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
              </Reveal>

              <Reveal direction="up" delay={0.1}>
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
              </Reveal>

              <Reveal direction="up" delay={0.15}>
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
              </Reveal>

              <Reveal direction="up" delay={0.2}>
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
              </Reveal>

              <Reveal direction="up" delay={0.25}>
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
              </Reveal>

              <Reveal direction="up" delay={0.3}>
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
              </Reveal>
            </div>
          </div>
        </div>
      </JourneySection>

      {/* ============================================================
          Section 3.5 — What-If Simulator
          ============================================================ */}
      <JourneySection className="landing-section" id="what-if" data-testid="what-if-preview">
        <div className="landing-section-inner section-center">
          <div className="landing-section-glass-pod">
            <div className="section-ambient-glow section-ambient-glow-2" />
            
            <Reveal direction="up">
              <span className="section-label">Interactive Sandbox</span>
              <h2 className="section-title">
                What if you changed your routine?
              </h2>
              <p className="section-subtitle">
                Explore different scenarios and instantly see the potential carbon savings.
              </p>
            </Reveal>

            <Reveal direction="up" delay={0.15}>
              <div className="preview-cta" style={{ marginTop: "2rem" }}>
                <Link href="/what-if" className="btn btn-primary btn-lg">
                  Try the What-If Simulator <ArrowRight size={18} />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </JourneySection>

      {/* ============================================================
          Section 4 — Dashboard Preview
          ============================================================ */}
      <JourneySection className="landing-section preview-section" data-testid="dashboard-preview">
        <div className="landing-section-inner section-center">
          <div className="landing-section-glass-pod preview-glass-pod">
            <div className="section-ambient-glow section-ambient-glow-preview" />
            
            <Reveal direction="up">
              <span className="section-label">Dashboard</span>
              <h2 className="section-title">
                See your impact at a glance
              </h2>
              <p className="section-subtitle">
                A clean, data-driven dashboard shows your total footprint, category
                breakdowns, weekly trends, and recent activities.
              </p>
            </Reveal>

            <Reveal direction="up" delay={0.15}>
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
            </Reveal>

            <Reveal direction="up" delay={0.25}>
              <div className="preview-cta">
                <Link href="/app" className="btn btn-primary btn-lg">
                  Explore Your Footprint <ArrowRight size={18} />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </JourneySection>

      {/* ============================================================
          Section 5 — Weekly Target
          ============================================================ */}
      <JourneySection className="landing-section" data-testid="weekly-goals">
        <div className="landing-section-inner">
          <div className="landing-section-glass-pod">
            <div className="goals-content">
              <Reveal direction="left">
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
              </Reveal>

              <Reveal direction="right" delay={0.2}>
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
              </Reveal>
            </div>
          </div>
        </div>
      </JourneySection>

      {/* ============================================================
          Section 7 — Methodology
          ============================================================ */}
      <JourneySection className="landing-section" id="methodology" data-testid="methodology-section">
        <div className="landing-section-inner">
          <div className="landing-section-glass-pod">
            <div className="section-ambient-glow section-ambient-glow-1" />
            <div className="section-ambient-glow section-ambient-glow-2" />

            <Reveal direction="up">
              <span className="section-label">Transparency</span>
              <h2 className="section-title">Our Methodology</h2>
              <p className="section-subtitle">
                Every CO₂ number in PlanetPulse is deterministic — computed from fixed, peer-reviewed
                emission factors. No estimates, no ML guesses, no black boxes.
              </p>
            </Reveal>

            {/* Core formula */}
            <Reveal direction="up" delay={0.1}>
              <div style={{
                margin: '2.5rem 0',
                padding: '1.75rem 2rem',
                background: 'rgba(31,157,107,0.06)',
                border: '1.5px solid rgba(31,157,107,0.25)',
                borderRadius: '16px',
                textAlign: 'center',
              }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-primary-green)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  Core Formula
                </p>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--color-text)', fontWeight: 400, letterSpacing: '-0.01em' }}>
                  CO₂ (kg) = Quantity × Emission Factor
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                  Calculated client-side in real time — rounded to 2 decimal places per activity log
                </p>
              </div>
            </Reveal>

            {/* Emission factors table */}
            <Reveal direction="up" delay={0.15}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '1rem', letterSpacing: '-0.01em' }}>
                Fixed Emission Factors
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', marginBottom: '2.5rem' }}>
                {[
                  { activity: 'Car', Icon: Car, factor: '0.20 kg CO₂ / km', category: 'Transport', note: 'Average petrol car', color: '#D3A796' },
                  { activity: 'Bus', Icon: Bus, factor: '0.08 kg CO₂ / km', category: 'Transport', note: 'Public transit, shared load', color: '#D3A796' },
                  { activity: 'Flight', Icon: Plane, factor: '0.25 kg CO₂ / km', category: 'Transport', note: 'Economy class, radiative forcing', color: '#D3A796' },
                  { activity: 'Electricity', Icon: Zap, factor: '0.80 kg CO₂ / kWh', category: 'Energy', note: 'Average grid intensity', color: '#E3CDA4' },
                  { activity: 'Veg Meal', Icon: Salad, factor: '0.50 kg CO₂ / meal', category: 'Food', note: 'Plant-based, low-land-use', color: '#C2D5B7' },
                  { activity: 'Non-Veg Meal', Icon: Drumstick, factor: '2.00 kg CO₂ / meal', category: 'Food', note: 'Meat-heavy, livestock emissions', color: '#DCA29A' },
                ].map((row) => (
                  <div key={row.activity} style={{
                    padding: '1rem 1.25rem',
                    background: 'rgba(255,255,255,0.75)',
                    backdropFilter: 'blur(12px)',
                    border: '1.5px solid rgba(31,157,107,0.18)',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(15,61,42,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '10px', flexShrink: 0,
                      background: `${row.color}22`,
                      border: `1px solid ${row.color}55`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <row.Icon size={18} color={row.color} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>{row.activity}</span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--color-primary-green)', background: 'var(--color-soft-green)', padding: '0.15rem 0.5rem', borderRadius: '999px', letterSpacing: '0.05em' }}>{row.category}</span>
                      </div>
                      <p style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--color-primary-green)', margin: '0 0 0.15rem' }}>{row.factor}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>{row.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Data sources + transparency */}
            <Reveal direction="up" delay={0.2}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                {[
                  { Icon: Cpu,       title: 'Deterministic Engine',  body: 'All calculations run in-browser using the formula: CO₂ = quantity × factor. No server-side inference, no rounding drift between sessions.' },
                  { Icon: Globe,     title: 'IPCC / DEFRA Sources',  body: 'Emission factors are sourced from IPCC AR6 Working Group III and the UK DEFRA GHG Conversion Factors — the global standard for consumer carbon accounting.' },
                  { Icon: Zap,       title: 'AI Never Calculates',   body: 'The Groq AI coach only generates natural-language insights. It receives pre-computed verified numbers — it cannot alter, estimate, or override any CO₂ value.' },
                  { Icon: BarChart2, title: 'Weekly Aggregation',    body: 'Weekly totals are summed Monday–Sunday from localStorage activity logs. The target comparison is a simple arithmetic check: total > target → exceeded.' },
                ].map((item) => (
                  <div key={item.title} style={{
                    padding: '1.25rem',
                    background: 'rgba(255,255,255,0.65)',
                    backdropFilter: 'blur(10px)',
                    border: '1.5px solid rgba(31,157,107,0.15)',
                    borderRadius: '14px',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 16px rgba(15,61,42,0.06)',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '9px', marginBottom: '0.85rem',
                      background: 'rgba(31,157,107,0.1)', border: '1px solid rgba(31,157,107,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <item.Icon size={17} color="var(--color-primary-green)" />
                    </div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 0.4rem' }}>{item.title}</h4>
                    <p style={{ fontSize: '0.83rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.6 }}>{item.body}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Callout */}
            <Reveal direction="up" delay={0.25}>
              <div style={{
                marginTop: '2rem',
                padding: '1rem 1.5rem',
                background: 'rgba(31,157,107,0.05)',
                border: '1px solid rgba(31,157,107,0.18)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}>
                <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(31,157,107,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Compass size={16} color="var(--color-primary-green)" />
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  <strong>Fully transparent:</strong> The emission factors are hardcoded constants visible in{' '}
                  <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', background: 'rgba(31,157,107,0.1)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                    lib/calculations.ts
                  </code>{' '}
                  — every number you see is traceable to a single multiplication: quantity × factor.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </JourneySection>





      <JourneySection className="cta-section" data-testid="cta-section">
        <Reveal direction="up">
          <h2>Small choices become visible <em style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic' }}>change.</em></h2>
          <p>
            Start tracking the choices that shape your footprint.
          </p>
          <Link href="/app" className="btn btn-primary btn-lg">
            Start Tracking <ArrowRight size={18} />
          </Link>
        </Reveal>
      </JourneySection>

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
