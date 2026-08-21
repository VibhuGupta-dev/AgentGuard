import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, AlertCircle, ArrowRight, Chrome } from 'lucide-react';
import { authApi } from '../lib/api';

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Google OAuth pop-up simulation state
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await authApi.login(email, password);
      } else {
        await authApi.register(email, password, name);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSelect = async (profile: { email: string; name: string; googleId: string }) => {
    setShowGoogleModal(false);
    setLoading(true);
    setError(null);

    try {
      await authApi.googleLogin(profile);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center px-4 overflow-hidden text-foreground">
      
      {/* Background radial highlights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full z-10">
        
        {/* Branding header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary/10 p-3 rounded-xl border border-primary/20 mb-3">
            <ShieldAlert className="text-primary h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1.5">AgentCI</h1>
          <p className="text-slate-400 text-sm text-center max-w-xs">
            Continuous Integration & Evaluation Sandbox Engine for AI Agents
          </p>
        </div>

        {/* Auth form card */}
        <div className="bg-card border border-card-border p-8 rounded-2xl shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-6 text-center">
            {isLogin ? 'Sign in to AgentCI' : 'Create developer profile'}
          </h2>

          {error && (
            <div className="mb-5 bg-red-950/30 border border-red-500/20 text-red-400 p-3 rounded-lg flex items-center space-x-2 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Demo Developer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-card-border focus:border-primary/50 text-white rounded-lg px-3 py-2 text-sm outline-none transition"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Email Address</label>
              <input
                type="email"
                required
                placeholder="dev@agentci.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-card-border focus:border-primary/50 text-white rounded-lg px-3 py-2 text-sm outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-card-border focus:border-primary/50 text-white rounded-lg px-3 py-2 text-sm outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center space-x-1.5 mt-2 shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Sign Up'}</span>
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          {/* OAuth Divider */}
          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-card-border"></div>
            <span className="flex-shrink mx-4 text-slate-500 text-xs font-semibold">Or continue with</span>
            <div className="flex-grow border-t border-card-border"></div>
          </div>

          {/* Google OAuth Button */}
          <button
            onClick={() => setShowGoogleModal(true)}
            className="w-full border border-card-border hover:bg-slate-900/60 text-slate-300 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center space-x-2"
          >
            <Chrome className="h-4 w-4 text-white" />
            <span>Sign in with Google</span>
          </button>

          {/* Form toggle */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-xs text-primary hover:underline font-medium"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

        </div>

      </div>

      {/* GOOGLE SIGN-IN SIMULATOR MODAL POPUP */}
      {showGoogleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-card-border p-6 rounded-2xl max-w-sm w-full space-y-4">
            <div className="flex items-center space-x-2 border-b border-card-border pb-3">
              <Chrome className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-bold text-white">Google OAuth Sandbox Account</h3>
            </div>
            
            <p className="text-slate-400 text-xs leading-normal">
              Select a test Google profile to authenticate the sandbox session:
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleGoogleSelect({ email: 'dev@agentci.com', name: 'Google Dev', googleId: 'g_12345' })}
                className="w-full text-left bg-slate-900 border border-card-border hover:border-slate-600 p-2.5 rounded-lg flex items-center space-x-2.5 text-xs transition"
              >
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center font-bold text-[10px] text-primary">GD</div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-200">Google Dev</span>
                  <span className="text-[10px] text-slate-500">dev@agentci.com</span>
                </div>
              </button>

              <button
                onClick={() => handleGoogleSelect({ email: 'qa-lead@gmail.com', name: 'QA Analyst', googleId: 'g_67890' })}
                className="w-full text-left bg-slate-900 border border-card-border hover:border-slate-600 p-2.5 rounded-lg flex items-center space-x-2.5 text-xs transition"
              >
                <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center font-bold text-[10px] text-emerald-400">QA</div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-200">QA Analyst</span>
                  <span className="text-[10px] text-slate-500">qa-lead@gmail.com</span>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowGoogleModal(false)}
              className="w-full border border-card-border hover:bg-slate-900 text-slate-400 py-1.5 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
