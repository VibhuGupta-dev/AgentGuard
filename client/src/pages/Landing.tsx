import React, { useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowRight,
  Activity,
  GitBranch,
  Terminal,
  AlertTriangle,
  Zap,
  Lock,
  Eye,
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const ctaRef = useRef(null);
  const revealRefs = useRef([]);

  useEffect(() => {
    if (localStorage.getItem('user')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  useEffect(() => {
    const id = 'agentci-fonts';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    const node = heroRef.current;
    if (!node) return;
    const handleMove = (e) => {
      const rect = node.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      node.style.setProperty('--mx', `${x}%`);
      node.style.setProperty('--my', `${y}%`);
    };
    node.addEventListener('mousemove', handleMove);
    return () => node.removeEventListener('mousemove', handleMove);
  }, []);

  useEffect(() => {
    const els = revealRefs.current.filter(Boolean);
    if (!els.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('in-view');
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleTilt = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(700px) rotateX(${py * -6}deg) rotateY(${px * 6}deg) translateY(-3px)`;
  };
  const resetTilt = (e) => {
    e.currentTarget.style.transform = '';
  };

  const handleMagnet = (e) => {
    const btn = ctaRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
  };
  const resetMagnet = () => {
    if (ctaRef.current) ctaRef.current.style.transform = '';
  };

  return (
    <div className="min-h-screen bg-[#0A0C0B] text-[#ECEEE9] font-[Inter,sans-serif] selection:bg-orange-500/30 selection:text-white overflow-x-hidden">
      <style>{`
        @keyframes blink { 0%, 45% { opacity: 1; } 50%, 95% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes pulse-dot { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.6); opacity: 0.35; } }
        @keyframes sweep { 0% { transform: translateX(-8%); } 100% { transform: translateX(108%); } }
        @keyframes drift { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(2%, -3%) scale(1.05); } }
        @keyframes fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes grid-fade { 0%, 100% { opacity: 0.35; } 50% { opacity: 0.55; } }
        .agentci-cursor { animation: blink 1.1s steps(1) infinite; }
        .agentci-pulse { animation: pulse-dot 1.8s ease-in-out infinite; }
        .agentci-sweep { animation: sweep 5s linear infinite; }
        .agentci-glow { animation: drift 10s ease-in-out infinite; }
        .agentci-hero-in { animation: fade-up 0.8s ease both; }
        .agentci-hero-in-d1 { animation-delay: 0.08s; }
        .agentci-hero-in-d2 { animation-delay: 0.16s; }
        .agentci-hero-in-d3 { animation-delay: 0.24s; }
        .agentci-hero-in-d4 { animation-delay: 0.32s; }
        .agentci-reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .agentci-reveal.in-view { opacity: 1; transform: translateY(0); }
        .agentci-tilt { transition: transform 0.15s ease-out, border-color 0.2s ease, box-shadow 0.2s ease; }
        .agentci-cta { transition: transform 0.15s ease-out, box-shadow 0.2s ease; }
        .agentci-spotlight {
          background:
            radial-gradient(500px circle at var(--mx, 50%) var(--my, 20%), rgba(255,138,61,0.12), transparent 60%),
            radial-gradient(800px circle at 80% 0%, rgba(242,183,5,0.04), transparent 50%);
        }
        .agentci-grid {
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, black, transparent);
          animation: grid-fade 8s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .agentci-cursor, .agentci-pulse, .agentci-sweep, .agentci-glow, .agentci-hero-in, .agentci-grid { animation: none !important; }
          .agentci-reveal, .agentci-tilt, .agentci-cta { transition: none !important; }
        }
      `}</style>

      <nav className="fixed w-full top-0 z-50 bg-[#0A0C0B]/85 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-500/10 p-2 rounded-lg border border-[#F2B705]/25">
              <ShieldAlert className="h-5 w-5 text-[#F2B705]" />
            </div>
            <span className="font-[JetBrains_Mono,monospace] font-medium text-lg text-white tracking-tight">
              AgentCI<span className="text-[#F2B705] agentci-cursor">_</span>
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/auth" className="text-sm font-medium text-[#8A8F87] hover:text-white transition-colors">
              Sign in
            </Link>
            <Link
              to="/auth"
              className="text-sm font-medium bg-orange-500 text-black px-5 py-2.5 rounded-md hover:bg-[#ffc933] transition-all shadow-[0_0_20px_rgba(242,183,5,0.15)] hover:shadow-[0_0_28px_rgba(242,183,5,0.3)]"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <main
        ref={heroRef}
        className="relative pt-40 pb-24 px-6 agentci-spotlight"
        style={{ '--mx': '50%', '--my': '20%' }}
      >
        <div className="agentci-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />

        <div
          className="agentci-glow pointer-events-none absolute top-[-180px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-[110px] opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(255,138,61,0.35), rgba(255,138,61,0) 70%)' }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(242,183,5,0.25), transparent 70%)' }}
          aria-hidden="true"
        />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="agentci-hero-in inline-flex items-center space-x-2 bg-white/[0.03] border border-white/[0.08] rounded-full px-4 py-1.5 mb-8 font-[JetBrains_Mono,monospace] text-xs text-[#8A8F87]">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500 agentci-pulse" />
            <span>MONITORING &middot; reliability engine online</span>
          </div>

          <h1 className="agentci-hero-in agentci-hero-in-d1 font-[JetBrains_Mono,monospace] text-4xl sm:text-6xl lg:text-7xl font-medium tracking-tight text-white leading-[1.08] mb-6">
            Your agent looks fine.
            <br />
            <span className="bg-gradient-to-r from-[#8A8F87] via-[#c5c9c2] to-[#8A8F87] bg-clip-text text-transparent">
              Until it isn&apos;t.
            </span>
          </h1>

          <p className="agentci-hero-in agentci-hero-in-d2 text-lg text-[#9CA39D] max-w-xl mx-auto leading-relaxed mb-10">
            AgentCI generates adversarial test scenarios from your agent&apos;s own prompt and tools,
            runs them in a sandbox, and flags tool loops, drift, and unsafe actions before your
            users find them.
          </p>

          <div className="agentci-hero-in agentci-hero-in-d3 flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <Link
              ref={ctaRef}
              to="/auth"
              onMouseMove={handleMagnet}
              onMouseLeave={resetMagnet}
              className="agentci-cta inline-flex items-center space-x-2 bg-orange-500 text-black font-medium text-base px-7 py-3.5 rounded-md hover:shadow-[0_0_36px_rgba(242,183,5,0.3)] shadow-[0_0_20px_rgba(242,183,5,0.15)]"
            >
              <span>Run your first evaluation</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#pipeline"
              className="inline-flex items-center space-x-2 text-sm font-medium text-[#8A8F87] hover:text-white border border-white/10 hover:border-white/20 px-6 py-3.5 rounded-md transition-colors"
            >
              <span>See how it works</span>
            </a>
          </div>

          <p className="agentci-hero-in agentci-hero-in-d4 text-xs text-[#6B716C] font-[JetBrains_Mono,monospace]">
            No credit card · Sandboxed by default · Prompt-aware tests
          </p>

          <div className="mt-20 relative rounded-xl border border-white/[0.08] bg-[#0D1010]/90 backdrop-blur-sm p-6 sm:p-10 overflow-hidden text-left group shadow-[0_0_60px_rgba(0,0,0,0.4)]">
            <div className="absolute inset-0 bg-gradient-to-b from-[#F2B705]/[0.03] to-transparent pointer-events-none" />
            <div className="relative flex items-center justify-between mb-6 font-[JetBrains_Mono,monospace] text-xs text-[#6B716C]">
              <span className="truncate pr-4">trace_id: run_8841 &middot; scenario: destructive_pressure_04</span>
              <span className="flex items-center gap-1.5 text-[#FF5C5C] shrink-0">
                <AlertTriangle className="h-3.5 w-3.5" />
                1 flag
              </span>
            </div>

            <div className="relative h-32 sm:h-36">
              <svg viewBox="0 0 1000 140" preserveAspectRatio="none" className="w-full h-full">
                <line x1="0" y1="70" x2="1000" y2="70" stroke="#1D211E" strokeWidth="1" />
                <path
                  d="M0,70 L70,70 L88,52 L106,70 L180,70 L198,88 L216,70 L330,70 L348,32 L366,70 L520,70 L538,98 L556,42 L574,70 L700,70 L716,20 L734,122 L752,70 L1000,70"
                  fill="none"
                  stroke="#F2B705"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <path
                  d="M700,70 L716,20 L734,122 L752,70"
                  fill="none"
                  stroke="#FF5C5C"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <circle
                  cx="734"
                  cy="122"
                  r="5"
                  fill="#FF5C5C"
                  className="agentci-pulse group-hover:[animation-duration:0.8s]"
                  style={{ transformOrigin: '734px 122px' }}
                />
              </svg>

              <div
                className="absolute top-0 h-full w-24 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent agentci-sweep pointer-events-none"
                aria-hidden="true"
              />

              <div className="absolute" style={{ left: '73.4%', top: '86%' }}>
                <div className="font-[JetBrains_Mono,monospace] text-[11px] text-[#FF5C5C] bg-[#1A0E0E] border border-[#FF5C5C]/30 rounded px-2 py-1 whitespace-nowrap -translate-x-1/2 shadow-lg">
                  unsafe_destructive_action &middot; no confirmation sought
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            {[
              { Icon: Zap, label: 'Adversarial scenarios', sub: 'From your prompt + tools' },
              { Icon: Lock, label: 'Isolated sandbox', sub: 'Mocked tools, full traces' },
              { Icon: Eye, label: 'Regression signals', sub: 'Catch silent safety drift' },
            ].map(({ Icon, label, sub }) => (
              <div
                key={label}
                className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3"
              >
                <div className="mt-0.5 h-8 w-8 rounded-md bg-orange-500/10 border border-[#F2B705]/20 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-[#F2B705]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-[#6B716C] mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div id="pipeline" className="relative max-w-6xl mx-auto mt-28">
          <div className="text-center mb-12">
            <p className="font-[JetBrains_Mono,monospace] text-[11px] tracking-wider text-[#F2B705]/80 mb-2">
              PIPELINE
            </p>
            <h2 className="text-2xl sm:text-3xl font-medium text-white tracking-tight">
              From prompt to scorecard
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                stage: 'STAGE 01 — GENERATE',
                title: 'Auto-generated suites',
                body: "Paste your system prompt and tool definitions. AgentCI reads them and writes realistic and adversarial scenarios at scale.",
                Icon: Terminal,
              },
              {
                stage: 'STAGE 02 — EXECUTE',
                title: 'Sandboxed execution',
                body: 'Every scenario runs against mocked tools in an isolated loop. Each step — reasoning, tool call, result — is captured for replay.',
                Icon: Activity,
              },
              {
                stage: 'STAGE 03 — TRACK',
                title: 'Regression tracking',
                body: "Compare scorecards version over version, so a prompt refactor can't silently weaken a safety boundary again.",
                Icon: GitBranch,
              },
            ].map(({ stage, title, body, Icon }, i) => (
              <div
                key={title}
                ref={(el) => (revealRefs.current[i] = el)}
                onMouseMove={handleTilt}
                onMouseLeave={resetTilt}
                className="agentci-reveal agentci-tilt relative p-7 rounded-lg bg-white/[0.02] border border-white/[0.07] hover:border-[#F2B705]/30 hover:shadow-[0_0_40px_rgba(242,183,5,0.06)]"
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <span className="absolute top-3 left-3 h-3 w-3 border-t border-l border-white/20 rounded-tl" />
                <span className="absolute bottom-3 right-3 h-3 w-3 border-b border-r border-white/20 rounded-br" />

                <div className="h-10 w-10 bg-white/[0.04] rounded-lg flex items-center justify-center mb-6 border border-white/10">
                  <Icon className="h-5 w-5 text-[#F2B705]" />
                </div>
                <p className="font-[JetBrains_Mono,monospace] text-[11px] tracking-wider text-[#6B716C] mb-2">{stage}</p>
                <h3 className="text-xl text-white mb-3 font-medium">{title}</h3>
                <p className="text-[#8A8F87] leading-relaxed text-sm">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <section className="border-y border-white/[0.06] bg-white/[0.015] py-14 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-[JetBrains_Mono,monospace] text-xl sm:text-2xl text-white mb-3">
            Ship agents that stay reliable.
          </h2>
          <p className="text-[#8A8F87] text-sm sm:text-base mb-8">
            Catch tool loops, policy violations, and regressions in CI — not in production.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center space-x-2 bg-orange-500 text-black font-medium text-sm px-6 py-3 rounded-md hover:bg-[#ffc933] transition-all shadow-[0_0_20px_rgba(242,183,5,0.15)]"
          >
            <span>Get started free</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-10 text-center text-[#6B716C] text-sm">
        <div className="flex items-center justify-center space-x-2 mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-500 agentci-pulse" />
          <span className="font-[JetBrains_Mono,monospace] text-[#9CA39D]">AgentCI &middot; status: operational</span>
        </div>
        <p>&copy; 2026 AgentCI. Built for testing agents before they ship.</p>
      </footer>
    </div>
  );
}