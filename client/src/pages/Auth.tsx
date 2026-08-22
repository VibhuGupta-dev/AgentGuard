import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { authApi } from '../lib/api';

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) navigate('/dashboard');
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isLogin) await authApi.login(email, password);
      else await authApi.register(email, password, name);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0e] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-5xl bg-[#141416] rounded-[28px] shadow-[0_25px_80px_-20px_rgba(0,0,0,0.65)] overflow-hidden flex flex-col md:flex-row min-h-[620px] border border-white/[0.06]">

        {/* LEFT */}
        {/* LEFT */}
<div className="relative md:w-[48%] bg-[#121214] flex flex-col items-center justify-center px-8 py-12 overflow-hidden border-r border-white/[0.05]">
  <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-gradient-to-br from-orange-500 to-red-600 opacity-35 blur-[2px]" />
  <div className="absolute top-20 right-12 w-10 h-10 rounded-full bg-orange-500/25" />
  <div className="absolute bottom-28 left-10 w-16 h-16 rounded-full bg-orange-500/10 blur-sm" />
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(249,115,22,0.14),transparent_55%)]" />

  <div className="relative z-10 w-full max-w-[300px] mx-auto">
    <svg viewBox="0 0 340 320" className="w-full h-auto" aria-hidden>
      {/* soft halo */}
      <circle cx="170" cy="130" r="95" fill="#1c1917" opacity="0.9" />
      <circle cx="170" cy="130" r="62" fill="#292524" opacity="0.45" />

      {/* floating status chips */}
      <g>
        <rect x="18" y="48" rx="10" width="88" height="28" fill="#431407" stroke="#f97316" strokeWidth="1" />
        <circle cx="34" cy="62" r="4" fill="#22c55e" />
        <text x="46" y="66" fill="#fed7aa" fontSize="10" fontFamily="system-ui,sans-serif">sandbox</text>
      </g>
      <g>
        <rect x="236" y="52" rx="10" width="86" height="28" fill="#1c1917" stroke="#52525b" strokeWidth="1" />
        <text x="250" y="70" fill="#a1a1aa" fontSize="10" fontFamily="system-ui,sans-serif">score: 94</text>
      </g>

      {/* agent head */}
      <rect x="128" y="78" width="84" height="70" rx="20" fill="#1c1917" stroke="#57534e" strokeWidth="2" />
      {/* visor */}
      <rect x="138" y="100" width="64" height="22" rx="8" fill="#0c0a09" stroke="#f97316" strokeWidth="1.2" />
      <circle cx="154" cy="111" r="3.5" fill="#f97316" />
      <circle cx="170" cy="111" r="3.5" fill="#f97316" />
      <circle cx="186" cy="111" r="3.5" fill="#f97316" />
      {/* antenna */}
      <line x1="170" y1="78" x2="170" y2="62" stroke="#f97316" strokeWidth="2" />
      <circle cx="170" cy="58" r="5" fill="#f97316" />

      {/* body */}
      <path d="M140 148 L140 188 Q170 202 200 188 L200 148 Z" fill="#1c1917" stroke="#57534e" strokeWidth="2" />
      <circle cx="170" cy="168" r="9" fill="#431407" stroke="#f97316" strokeWidth="1.5" />
      <path d="M166 168 h8" stroke="#fdba74" strokeWidth="1.5" strokeLinecap="round" />

      {/* arms to console */}
      <path d="M140 158 Q118 168 108 188" fill="none" stroke="#1c1917" strokeWidth="12" strokeLinecap="round" />
      <path d="M200 158 Q222 168 232 188" fill="none" stroke="#1c1917" strokeWidth="12" strokeLinecap="round" />
      <path d="M140 158 Q118 168 108 188" fill="none" stroke="#57534e" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M200 158 Q222 168 232 188" fill="none" stroke="#57534e" strokeWidth="1.5" strokeLinecap="round" />

      {/* sandbox console / laptop */}
      <rect x="95" y="188" width="150" height="70" rx="8" fill="#292524" stroke="#44403c" strokeWidth="1.5" />
      <rect x="104" y="196" width="132" height="48" rx="4" fill="#0c0a09" />
      {/* terminal lines */}
      <rect x="112" y="204" width="48" height="3" rx="1.5" fill="#22c55e" opacity="0.8" />
      <rect x="112" y="212" width="72" height="3" rx="1.5" fill="#a1a1aa" opacity="0.5" />
      <rect x="112" y="220" width="56" height="3" rx="1.5" fill="#f97316" opacity="0.7" />
      <rect x="112" y="228" width="40" height="3" rx="1.5" fill="#a1a1aa" opacity="0.35" />
      <path d="M85 258 h170 l10 14 H75 Z" fill="#44403c" />

      {/* report card floating */}
      <g transform="translate(248, 175)">
        <rect x="0" y="0" width="56" height="70" rx="6" fill="#1c1917" stroke="#f97316" strokeWidth="1.2" />
        <rect x="8" y="10" width="40" height="4" rx="2" fill="#f97316" opacity="0.9" />
        <rect x="8" y="20" width="32" height="3" rx="1.5" fill="#52525b" />
        <rect x="8" y="28" width="36" height="3" rx="1.5" fill="#52525b" />
        <rect x="8" y="36" width="28" height="3" rx="1.5" fill="#52525b" />
        <rect x="8" y="48" width="20" height="12" rx="3" fill="#14532d" stroke="#22c55e" strokeWidth="1" />
        <text x="12" y="57" fill="#4ade80" fontSize="8" fontFamily="system-ui,sans-serif">OK</text>
      </g>

      {/* small shield badge */}
      <g transform="translate(42, 175)">
        <path
          d="M22 4 L38 10 V22 C38 32 30 40 22 44 C14 40 6 32 6 22 V10 Z"
          fill="#1c1917"
          stroke="#f97316"
          strokeWidth="1.5"
        />
        <path d="M22 16 v14" stroke="#fdba74" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 23 h12" stroke="#fdba74" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  </div>

  <div className="relative z-10 text-center mt-2 max-w-sm mx-auto px-2">
    <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
      Sandbox-test your AI agents.
    </h2>
    <p className="mt-2.5 text-sm text-zinc-500 leading-relaxed">
      Run adversarial scenarios in a safe env, catch unsafe tool use, and get a clear report — before users ever see it.
    </p>
    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
      <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium text-zinc-400">
        Isolated runs
      </span>
      <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-[10px] font-medium text-orange-300/90">
        Live reports
      </span>
      <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium text-zinc-400">
        Regression checks
      </span>
    </div>
  </div>
</div>

        {/* RIGHT */}
        <div className="md:w-[52%] bg-[#141416] flex flex-col justify-center px-8 sm:px-12 py-12">
          <div className="w-full max-w-[340px] mx-auto">
            <div className="flex justify-center mb-6">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
                    fill="white"
                  />
                </svg>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white text-center tracking-tight">
              {isLogin ? 'Login to your Account' : 'Create your Account'}
            </h1>
            <p className="text-center text-sm text-zinc-500 mt-1.5 mb-7">
              {isLogin
                ? 'See what is going on with your agents'
                : 'Start evaluating agents in minutes'}
            </p>

            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    Full name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Alex Chen"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#0c0c0e] px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/15 transition"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  placeholder="mail@abc.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#0c0c0e] px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/15 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#0c0c0e] px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/15 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white py-2.5 text-sm font-semibold transition shadow-lg shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create account'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-zinc-500">
              {isLogin ? (
                <>
                  Not Registered Yet?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(false);
                      setError(null);
                    }}
                    className="font-semibold text-orange-400 hover:underline"
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(true);
                      setError(null);
                    }}
                    className="font-semibold text-orange-400 hover:underline"
                  >
                    Login
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}