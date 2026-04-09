import { useState, useEffect, useCallback } from "react";
import { supabase, supabaseUrl, Logo } from "./shared/aquaCore";
import DashboardPage from "./pages/DashboardPage";
import WaterPage from "./pages/WaterPage";
import BiomassPage from "./pages/BiomassPage";
import AuthPage from "./pages/AuthPage";
import FeedingPage from "./pages/feeding/FeedingPage";
import ProductPage from "./pages/ProductPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import DeviceConnectionPage from "./pages/DeviceConnectionPage";

import { makeFirstPondParams } from "./shared/pondScenarios";

// ─── Navigation items ─────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { id: "water", label: "Water Quality", icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" },
  { id: "biomass", label: "Biomass", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { id: "feeding", label: "Feeding", icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" },
];

// Landing Page - Ultra-Professional Minimalist SaaS Design
function LandingPage({ onCTA }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState("EN");
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white font-sans overflow-hidden relative">
      {/* Enhanced Aquaculture + Tech Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Gradient base layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20" />

        {/* Subtle gradient orbs */}
        <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-[#0B3D91]/8 to-transparent rounded-full blur-3xl" style={{ animation: 'pulse 8s ease-in-out infinite' }} />
        <div className="absolute bottom-40 -right-20 w-[500px] h-[500px] bg-gradient-to-br from-[#0288D1]/8 to-transparent rounded-full blur-3xl" style={{ animation: 'pulse 10s ease-in-out infinite', animationDelay: '2s' }} />
      </div>

      <style>{`
        @keyframes morphing {
          0%, 100% { d: path("M0,100 C150,150 350,50 500,100 L500,0 L0,0 Z"); }
          50% { d: path("M0,80 C200,130 300,70 500,120 L500,0 L0,0 Z"); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-30px) translateX(20px); }
        }
        @keyframes swim {
          0%, 100% { transform: translateX(0) scaleX(1); }
          50% { transform: translateX(15px) scaleX(-1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(11, 61, 145, 0.2); }
          50% { box-shadow: 0 0 30px rgba(11, 61, 145, 0.4); }
        }
        .fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }
        .fade-in {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>

      {/* Navbar - Fixed Sticky */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <div 
            onClick={() => {
              document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
          >
            <Logo size={36} />
            <div>
              <p 
                className="font-bold text-lg text-slate-900 leading-none"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                ikanDoiT
              </p>
              <p className="text-xs text-slate-500">AquaFarmer</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('features')} className="text-sm font-medium text-slate-600 hover:text-[#0B3D91] transition-colors">
              Features
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="text-sm font-medium text-slate-600 hover:text-[#0B3D91] transition-colors">
              How it Works
            </button>
            <button onClick={() => scrollToSection('pricing')} className="text-sm font-medium text-slate-600 hover:text-[#0B3D91] transition-colors">
              Pricing
            </button>
            <button onClick={() => scrollToSection('why-us')} className="text-sm font-medium text-slate-600 hover:text-[#0B3D91] transition-colors">
              Why Us
            </button>

            <button
              onClick={() => onCTA("login")}
              className="px-6 py-2.5 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-400 transition-all"
            >
              Log In
            </button>
            
            <button
              onClick={() => onCTA("signup")}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0B3D91] to-[#1565C0] text-white font-semibold text-sm hover:shadow-lg hover:scale-105 transition-all"
            >
              Start for Free
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-900 p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-80 bg-white z-50 md:hidden shadow-2xl transform transition-transform duration-300 ease-out">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <Logo size={32} />
                <p className="font-bold text-lg text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  ikanDoiT
                </p>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-500 hover:text-slate-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="p-6 space-y-1">
              <button onClick={() => scrollToSection('features')} className="w-full text-left px-4 py-3 text-slate-600 hover:text-[#0B3D91] hover:bg-slate-50 rounded-lg transition-colors font-medium">
                Features
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="w-full text-left px-4 py-3 text-slate-600 hover:text-[#0B3D91] hover:bg-slate-50 rounded-lg transition-colors font-medium">
                How it Works
              </button>
              <button onClick={() => scrollToSection('pricing')} className="w-full text-left px-4 py-3 text-slate-600 hover:text-[#0B3D91] hover:bg-slate-50 rounded-lg transition-colors font-medium">
                Pricing
              </button>
              <button onClick={() => scrollToSection('why-us')} className="w-full text-left px-4 py-3 text-slate-600 hover:text-[#0B3D91] hover:bg-slate-50 rounded-lg transition-colors font-medium">
                Why Fisheries Use ikanDoiT
              </button>
            </nav>

            <div className="absolute bottom-6 left-6 right-6 space-y-3">
              <button onClick={() => onCTA("login")} className="w-full px-4 py-3 rounded-lg text-slate-700 font-medium border border-slate-300 hover:bg-slate-50 transition-all">
                Log In
              </button>
              <button onClick={() => onCTA("signup")} className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-[#0B3D91] to-[#1565C0] text-white font-bold hover:shadow-lg transition-all">
                Start for Free
              </button>
            </div>
          </div>
        </>
      )}

      {/* Hero Section - Full Screen */}
      <section id="hero" className="relative z-10 min-h-screen flex items-center justify-center pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Text Content */}
            <div className="space-y-6 fade-in-up">
              {/* Enhanced glassmorphism badge with glow */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-md px-4 py-2.5 rounded-full text-sm text-slate-700 font-medium border border-white/60 shadow-lg" style={{ animation: 'glow 3s ease-in-out infinite' }}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
                Smart aquaculture for modern fish farmers
              </div>
              <h1
                className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-slate-900"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Smart aquaculture
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0B3D91] to-[#0288D1]">
                  management system
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl">
                Improve fish survival, optimize feeding schedules, and monitor water quality in real-time — all from one simple dashboard.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pb-4">
                <button
                  onClick={() => onCTA("signup")}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#0B3D91] to-[#1565C0] text-white font-bold text-base hover:shadow-2xl hover:scale-105 transition-all shadow-lg"
                >
                  Get Started 
                </button>
              </div>
            </div>

            {/* Right: Modern 3D Aquaculture Illustration */}
            <div className="relative hidden md:block fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="relative w-full h-[500px] flex items-center justify-center">
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0B3D91]/10 via-[#1565C0]/5 to-[#0288D1]/10 rounded-3xl blur-3xl" />

                {/* Main illustration container */}
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Water tank/pond visualization */}
                  <svg viewBox="0 0 500 500" className="w-full h-full">
                    <defs>
                      <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#0B3D91', stopOpacity: 0.15 }} />
                        <stop offset="100%" style={{ stopColor: '#0288D1', stopOpacity: 0.25 }} />
                      </linearGradient>
                      <linearGradient id="fishGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: '#0B3D91', stopOpacity: 0.9 }} />
                        <stop offset="100%" style={{ stopColor: '#0288D1', stopOpacity: 0.9 }} />
                      </linearGradient>
                    </defs>

                    {/* Water body */}
                    <rect x="80" y="120" width="340" height="280" rx="20" fill="url(#waterGrad)" className="opacity-80" />
                    <rect x="80" y="120" width="340" height="280" rx="20" fill="none" stroke="#1565C0" strokeWidth="3" className="opacity-30" />

                    {/* Swimming fish */}
                    <g style={{ animation: 'swim 6s ease-in-out infinite' }}>
                      <ellipse cx="180" cy="200" rx="40" ry="20" fill="url(#fishGrad)" />
                      <path d="M140,200 L155,190 L155,210 Z" fill="url(#fishGrad)" />
                      <circle cx="210" cy="195" r="4" fill="white" />
                      <path d="M180,215 Q190,220 195,215 Q190,210 180,215" fill="url(#fishGrad)" opacity="0.7" />
                    </g>

                    <g style={{ animation: 'swim 7s ease-in-out infinite', animationDelay: '1s' }} transform="translate(80, 80)">
                      <ellipse cx="180" cy="200" rx="35" ry="18" fill="url(#fishGrad)" opacity="0.8" />
                      <path d="M145,200 L157,192 L157,208 Z" fill="url(#fishGrad)" opacity="0.8" />
                      <circle cx="207" cy="196" r="3" fill="white" />
                    </g>

                    {/* Water bubbles */}
                    <circle cx="150" cy="350" r="5" fill="#0288D1" opacity="0.2">
                      <animate attributeName="cy" from="350" to="150" dur="4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.3" to="0" dur="4s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="280" cy="370" r="4" fill="#1565C0" opacity="0.2">
                      <animate attributeName="cy" from="370" to="160" dur="5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.3" to="0" dur="5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="350" cy="340" r="6" fill="#0B3D91" opacity="0.2">
                      <animate attributeName="cy" from="340" to="140" dur="4.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.3" to="0" dur="4.5s" repeatCount="indefinite" />
                    </circle>

                    {/* IoT sensors */}
                    <g transform="translate(100, 140)">
                      <rect x="0" y="0" width="30" height="30" rx="6" fill="white" className="shadow-lg" />
                      <circle cx="15" cy="15" r="8" fill="#0B3D91" />
                      <circle cx="15" cy="15" r="4" fill="white" className="animate-pulse" />
                    </g>

                    <g transform="translate(370, 320)">
                      <rect x="0" y="0" width="30" height="30" rx="6" fill="white" className="shadow-lg" />
                      <circle cx="15" cy="15" r="8" fill="#1565C0" />
                      <circle cx="15" cy="15" r="4" fill="white" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
                    </g>

                    {/* Data connection lines */}
                    <line x1="115" y1="155" x2="250" y2="100" stroke="#0B3D91" strokeWidth="2" strokeDasharray="5,5" opacity="0.3" />
                    <line x1="385" y1="335" x2="250" y2="100" stroke="#1565C0" strokeWidth="2" strokeDasharray="5,5" opacity="0.3" />

                    {/* Dashboard/monitor icon */}
                    <g transform="translate(220, 60)">
                      <rect x="0" y="0" width="60" height="40" rx="6" fill="white" stroke="#0B3D91" strokeWidth="2" className="shadow-xl" />
                      <rect x="5" y="5" width="50" height="25" fill="#0B3D91" opacity="0.1" />
                      <line x1="10" y1="12" x2="30" y2="12" stroke="#0B3D91" strokeWidth="2" strokeLinecap="round" />
                      <line x1="10" y1="18" x2="35" y2="18" stroke="#1565C0" strokeWidth="2" strokeLinecap="round" />
                      <line x1="10" y1="24" x2="25" y2="24" stroke="#0288D1" strokeWidth="2" strokeLinecap="round" />
                      <rect x="20" y="32" width="20" height="3" fill="#0B3D91" opacity="0.3" />
                    </g>
                  </svg>
                </div>

                {/* Floating metrics cards */}
                <div className="absolute top-10 right-0 bg-white/90 backdrop-blur-md rounded-xl px-4 py-3 shadow-xl border border-white/60 fade-in-up" style={{ animationDelay: '0.4s' }}>
                  <div className="text-xs text-slate-500 font-semibold">Water Quality</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-bold text-slate-900">Optimal</span>
                  </div>
                </div>

                <div className="absolute bottom-20 left-0 bg-white/90 backdrop-blur-md rounded-xl px-4 py-3 shadow-xl border border-white/60 fade-in-up" style={{ animationDelay: '0.6s' }}>
                  <div className="text-xs text-slate-500 font-semibold">Biomass Estimation</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-bold text-slate-900">43.5kg</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="relative z-10 py-24 md:py-32 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="text-center mb-20 fade-in">
            <h2
              className="text-4xl md:text-5xl font-bold text-slate-900 mb-4"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Your Journey to Smarter Aquaculture
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From deployment to optimization, we guide you every step of the way.
            </p>
          </div>

          {/* Timeline */}
          <div className="grid md:grid-cols-4 gap-8 md:gap-6 relative">
            {/* Connector Line (desktop) */}
            <div className="hidden md:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-[#0B3D91] via-[#1565C0] to-[#0288D1] opacity-20" />

            {[
              {
                step: "01",
                title: "Deploy\nSensors",
                desc: "Install our IoT sensors in your ponds and tanks for continuous monitoring.",
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "Check Your Pond Anytime, Anywhere",
                desc: "Track water quality, dissolved oxygen, pH, temperature, ammonia, nitrate, and salinity in one place.",
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Get AI\nInsights",
                desc: "Our system analyzes your data and tells you what to do — no guesswork needed.",
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
              },
              {
                step: "04",
                title: "Optimize\nOperations",
                desc: "Reduce waste, improve growth rates, and maximize profitability.",
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ),
              },
            ].map((item, idx) => (
              <div key={idx} className="relative text-center fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                {/* Step Circle */}
                <div className="relative z-10 w-32 h-32 mx-auto mb-6 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <div className="text-[#0B3D91]">{item.icon}</div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-[#0B3D91] to-[#0288D1] text-white text-xs font-bold flex items-center justify-center">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 min-h-[56px] whitespace-pre-line" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us / Stats Section - Professional Minimalist Card Design */}
      <section id="why-us" className="relative z-10 py-24 md:py-32 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16 fade-in">
            <h2
              className="text-4xl md:text-5xl font-bold text-slate-900 mb-4"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Why Fisheries Use ikanDoiT
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Proven results that drive real business value.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                stat: "30%",
                statColor: "from-[#0B3D91] to-[#1565C0]",
                title: "Reduce Feed Waste",
                desc: "AI calculates the right amount of feed based on fish size and water conditions. No more overfeeding.",
              },
              {
                stat: "24/7",
                statColor: "from-[#1565C0] to-[#0288D1]",
                title: "Prevent Fish Loss",
                desc: "Get instant alerts when water becomes dangerous. Take action before fish die.",
              },
              {
                stat: "AI-Powered",
                statColor: "from-[#0288D1] to-[#1565C0]",
                title: "Track Fish Growth Automatically",
                desc: "Estimate fish size and weight without manual counting. Save time and improve accuracy.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300 text-center fade-in-up group"
                style={{ animationDelay: `${idx * 0.15}s` }}
              >
                <div
                  className={`text-xl md:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r ${item.statColor} group-hover:scale-110 transition-transform duration-300`}
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {item.stat}
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="text-center mb-20 fade-in">
            <h2
              className="text-4xl md:text-5xl font-bold text-slate-900 mb-4"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Comprehensive Features
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to run a modern aquaculture operation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Water Quality Monitoring",
                desc: "Real-time dissolved oxygen, pH, temperature, ammonia, nitrate, and salinity tracking with smart alerts and 24-hour trend charts.",
                icon: (
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                ),
              },
              {
                title: "Biomass Estimation",
                desc: "Estimate fish biomass using growth formulas. Input fish count and species for instant calculations.",
                icon: (
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
              },
              {
                title: "Feeding Recommendation",
                desc: "AI-assisted feed schedules based on biomass, fish size, and current water temperature.",
                icon: (
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                ),
              },
            ].map((f, idx) => (
              <div
                key={f.title}
                className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:bg-white hover:shadow-xl hover:scale-105 transition-all duration-300 fade-in-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#0B3D91] to-[#0288D1] rounded-xl flex items-center justify-center text-white mb-6 shadow-lg">
                  {f.icon}
                </div>
                <h3 className="font-bold text-xl mb-3 text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {f.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-24 md:py-32 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 md:px-12">

          {/* Header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Simple, Transparent Pricing
            </h2>

            <p className="text-lg text-slate-600">
              Increase fish survival. Reduce feed waste. Monitor with confidence.
            </p>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">

            {/* ───────── FREE ───────── */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">

              <div>
                <p className="text-sm font-medium text-slate-500 mb-3">Free</p>

                <div className="flex items-end gap-3 mb-3">
                  <span className="text-sm font-semibold text-slate-500">RM</span>
                  <h3 className="text-5xl font-bold text-slate-900 leading-none">0</h3>
                  <p className="text-[11px] text-slate-500 leading-tight pb-1">
                    <span className="font-semibold">MYR /</span>
                    <br />
                    month
                  </p>
                </div>
                <p className="text-sm text-slate-500 mb-6">For getting started</p>

                <ul className="space-y-3 text-sm mb-8">
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Biomass estimation
                  </li>

                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Feeding recommendations
                  </li>

                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    20 credits / month
                  </li>

                  <li className="flex items-center gap-3 text-slate-400">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Sensor kits included
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onCTA("signup")}
                className="mt-auto w-full py-3.5 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-[#1565C0] hover:text-white transition"
              >
                Get Started
              </button>
            </div>

            {/* ───────── BASIC ───────── */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">

              <div>
                <p className="text-sm font-medium text-emerald-600 mb-3">Basic</p>

                <div className="flex items-end gap-3 mb-3">
                  <span className="text-sm font-semibold text-slate-500">RM</span>
                  <h3 className="text-5xl font-bold text-slate-900 leading-none">499</h3>
                  <p className="text-[11px] text-slate-500 leading-tight pb-1">
                    <span className="font-semibold">MYR /</span>
                    <br />
                    month 
                  </p>
                </div>
                <p className="text-sm text-slate-500 mb-6">Upgrade your aquaculture management</p>

                <ul className="space-y-3 text-sm mb-8">
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    5 sensor kits included
                  </li>

                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Biomass estimation
                  </li>

                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Feeding recommendations
                  </li>

                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    80 credits / month
                  </li>

                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Enhanced computer vision model
                  </li>
                </ul>

                <p className="text-xs text-emerald-600 font-medium mb-6">Ideal for small-to-mid ponds</p>
              </div>

              <button
                onClick={() => onCTA("signup")}
                className="mt-auto w-full py-3.5 rounded-xl border border-slate-900 text-slate-900 font-medium hover:bg-[#1565C0] hover:text-white transition"
              >
                Buy Basic
              </button>
            </div>

            {/* ───────── PRO ───────── */}
            <div className="relative bg-blue-50 rounded-2xl p-8 border border-blue-200 flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">

              {/* ✅ FIXED BADGE */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0B3D91] text-white text-xs px-4 py-1 rounded-full font-medium shadow-sm">
                Recommended
              </div>

              <div>
                <p className="text-sm font-medium text-blue-600 mb-3">Premium</p>

                <div className="flex items-end gap-3 mb-3">
                  <span className="text-sm font-semibold text-slate-500">RM</span>
                  <h3 className="text-5xl font-bold text-slate-900 leading-none">799</h3>
                  <p className="text-[11px] text-slate-500 leading-tight pb-1">
                    <span className="font-semibold">MYR /</span>
                    <br />
                    month 
                  </p>
                </div>
                <p className="text-sm text-slate-500 mb-6">Maximize your aquaculture performance</p>

                <ul className="space-y-3 text-sm mb-8">
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    10 sensor kits included
                  </li>

                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Biomass estimation
                  </li>

                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Feeding recommendations
                  </li>

                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    200 credits / month
                  </li>

                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Best computer vision model
                  </li>
                </ul>

                <p className="text-xs text-blue-600 font-medium mb-6">
                  Best for large scale farms
                </p>
              </div>

              <button
                onClick={() => onCTA("signup")}
                className="mt-auto w-full py-3.5 rounded-xl bg-[#0B3D91] text-white font-medium hover:bg-[#1565C0] transition"
              >
                Buy Premium
              </button>
            </div>

          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="relative z-10 bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Logo size={32} />
              <div>
                <p className="font-bold text-white text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  ikanDoiT
                </p>
                <p className="text-xs text-slate-500">AquaFarmer</p>
              </div>
            </div>
            <p className="text-sm text-center">
              © 2025 ikanDoiT — Built for aquaculture farmers
            </p>
            <div className="flex items-center gap-6 text-sm">
              <button className="hover:text-white transition-colors">Privacy</button>
              <button className="hover:text-white transition-colors">Terms</button>
              <button className="hover:text-white transition-colors">Contact</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("landing"); // landing | auth | product | checkout | order-success | connect-device | app
  const [authMode, setAuthMode] = useState("login"); // login | signup
  const [activePage, setActivePage] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [latestBiomass, setLatestBiomass] = useState(null);
  const [biomassHistory, setBiomassHistory] = useState([]);
  const [params, setParams] = useState({
    DO: 6.8, pH: 7.2, Temp: 28.5, NH3: 0.018, NO3: 9.2, Salinity: 4.5,
  });
  const [devices, setDevices] = useState([]);
  const [activeDeviceIdx, setActiveDeviceIdx] = useState(0);
  const [selectedKit, setSelectedKit] = useState(null);
  const [orderInfo, setOrderInfo] = useState(null);
  const [connectedDevice, setConnectedDevice] = useState(null);

  const activeDevice = devices[activeDeviceIdx] || null;
  const effectiveParams = activeDevice?.params || params;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) { setUser(session.user); setPage("app"); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) { setUser(session.user); setPage("app"); }
      else if (page === "app") setPage("landing");
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null); setPage("landing");
  }, []);

  const handleCTA = (mode = "signup") => {
    setAuthMode(mode);
    setPage("auth");
  };

  const handleBackToLanding = () => {
    setPage("landing");
  };

  if (page === "landing") return <LandingPage onCTA={handleCTA} />;
  if (page === "auth") return <AuthPage initialMode={authMode} onAuth={u => { setUser(u); setPage("app"); }} onBack={handleBackToLanding} />;

  // E-commerce flow handlers
  const handleBuyNow = (kit) => {
    setSelectedKit(kit);
    setActivePage("checkout");
  };

  const handlePlaceOrder = (shipping, payment) => {
    const order = {
      orderNumber: `IKD-${Date.now().toString().slice(-8)}`,
      kit: selectedKit,
      shippingInfo: shipping,
      paymentMethod: payment,
      total: selectedKit.price + 15, // +RM15 shipping
      date: new Date()
    };
    setOrderInfo(order);
    setActivePage("order-success");
  };

  const handleGoToOrderTracking = () => {
    setActivePage("order-tracking");
  };

  const handleGoToConnectDevice = () => {
    setActivePage("connect-device");
  };

  const handleDeviceConnected = (device) => {
    setConnectedDevice(device);
    if (!devices.length) {
      setDevices([{ ...device, params: makeFirstPondParams() }]);
      setActiveDeviceIdx(0);
    }
    setActivePage("water");
  };

  const handleDisconnectDevice = () => {
    setConnectedDevice(null);
    setDevices([]);
    setActiveDeviceIdx(0);
    // Stay on water page, will show empty state
  };

  const handleBackToWater = () => {
    setActivePage("water");
  };

  const pageContent = {
    dashboard: (
      <DashboardPage
        user={user}
        params={effectiveParams}
        setParams={setParams}
        latestBiomass={latestBiomass}
        biomassHistory={biomassHistory}
        devices={devices}
        activeDeviceIdx={activeDeviceIdx}
      />
    ),
    water: <WaterPage 
      user={user} 
      params={params} 
      setParams={setParams} 
      connectedDevice={connectedDevice}
      devices={devices}
      setDevices={setDevices}
      activeDeviceIdx={activeDeviceIdx}
      setActiveDeviceIdx={setActiveDeviceIdx}
      onBuySensor={() => setActivePage("product")}
      onConnectDevice={() => setActivePage("connect-device")}
      onDisconnectDevice={handleDisconnectDevice}
    />,
    biomass: <BiomassPage user={user} setLatestBiomass={setLatestBiomass} setBiomassHistory={setBiomassHistory} onNavigateToFeeding={() => setActivePage("feeding")} />,
    feeding: <FeedingPage user={user} latestBiomass={latestBiomass} params={effectiveParams} />,
    product: <ProductPage onBuyNow={handleBuyNow} onBack={handleBackToWater} />,
    checkout: <CheckoutPage cart={selectedKit} onBack={() => setActivePage("product")} onComplete={handlePlaceOrder} />,
    "order-success": <OrderSuccessPage order={orderInfo} onGoToDashboard={handleGoToOrderTracking} />,
    "order-tracking": <OrderTrackingPage order={orderInfo} onConnectDevice={handleGoToConnectDevice} onBackToWater={handleBackToWater} />,
    "connect-device": <DeviceConnectionPage onConnect={handleDeviceConnected} onBack={handleBackToWater} />,
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex"
      style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet" />

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-100 z-30 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:flex`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
          <Logo size={34} />
          <div>
            <p className="font-bold text-slate-800 leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>ikanDoiT</p>
            <p className="text-xs text-slate-400 mt-0.5">AquaFarmer</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(n => (
            <button key={n.id} onClick={() => { setActivePage(n.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${activePage === n.id ? "bg-[#0B3D91] text-white shadow-md shadow-blue-200" : "text-slate-600 hover:bg-slate-100"}`}>
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={n.icon} />
              </svg>
              {n.label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-slate-50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0B3D91] to-[#0288D1] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {(user?.email?.[0] || "U").toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate">{user?.email || "Demo User"}</p>
              <p className="text-xs text-slate-400">Fish Farmer</p>
            </div>
            <button onClick={handleSignOut} title="Sign out"
              className="text-slate-400 hover:text-red-500 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-100 px-5 py-3.5 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="font-bold text-slate-800 text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {NAV.find(n => n.id === activePage)?.label}
              </h1>
              <p className="text-xs text-slate-400">{new Date().toLocaleDateString("en-MY", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full font-medium border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 max-w-7xl w-full mx-auto">
          {pageContent[activePage]}
        </main>
      </div>
    </div>
  );
}