import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight, Zap, Code2, LineChart } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('user')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black text-foreground selection:bg-primary/30 selection:text-white">
      
      {/* Navbar */}
      <nav className="fixed w-full top-0 z-50 bg-black/80 backdrop-blur-md border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 p-2 rounded-xl border border-primary/20">
              <ShieldAlert className="h-6 w-6 text-primary" />
            </div>
            <span className="font-serif font-bold text-xl text-white tracking-tight">AgentCI</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/auth" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link 
              to="/auth" 
              className="text-sm font-medium bg-primary text-black px-5 py-2.5 rounded-full hover:bg-primary-hover transition-all shadow-[0_0_15px_rgba(255,90,0,0.2)] hover:shadow-[0_0_25px_rgba(255,90,0,0.4)]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 sm:pt-40 sm:pb-24 lg:pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center space-x-2 bg-neutral-900/50 border border-neutral-800 rounded-full px-4 py-1.5 mb-4">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-xs font-medium text-neutral-300">AgentCI v2.0 is now live</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-serif font-medium tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
            Build reliable AI agents with <span className="text-primary italic">confidence</span>.
          </h1>
          
          <p className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto font-light leading-relaxed">
            The first continuous integration and evaluation sandbox for LLM-powered systems. 
            Catch hallucinations, tool loops, and safety bypasses before they hit production.
          </p>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link 
              to="/auth"
              className="w-full sm:w-auto bg-primary text-black font-medium text-lg px-8 py-4 rounded-full flex items-center justify-center space-x-2 hover:bg-primary-hover transition-all hover:scale-105 shadow-[0_0_30px_rgba(255,90,0,0.2)]"
            >
              <span>Start evaluating for free</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="max-w-6xl mx-auto mt-32 grid sm:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-neutral-900/30 border border-neutral-800 hover:border-neutral-700 transition-colors">
            <div className="h-12 w-12 bg-neutral-800/50 rounded-2xl flex items-center justify-center mb-6 border border-neutral-700">
              <Code2 className="h-6 w-6 text-neutral-300" />
            </div>
            <h3 className="font-serif text-2xl text-white mb-3">Auto-Generated Suites</h3>
            <p className="text-neutral-500 leading-relaxed text-sm">
              Paste your system prompt and tool definitions. Our AI automatically generates diverse edge-case scenarios and adversarial attacks.
            </p>
          </div>
          
          <div className="p-8 rounded-3xl bg-neutral-900/30 border border-neutral-800 hover:border-neutral-700 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px]"></div>
            <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20 relative z-10">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-serif text-2xl text-white mb-3 relative z-10">Sandbox Execution</h3>
            <p className="text-neutral-500 leading-relaxed text-sm relative z-10">
              Run your agents in a secure, mocked environment. Watch real-time execution traces as the agent reasons and calls tools.
            </p>
          </div>
          
          <div className="p-8 rounded-3xl bg-neutral-900/30 border border-neutral-800 hover:border-neutral-700 transition-colors">
            <div className="h-12 w-12 bg-neutral-800/50 rounded-2xl flex items-center justify-center mb-6 border border-neutral-700">
              <LineChart className="h-6 w-6 text-neutral-300" />
            </div>
            <h3 className="font-serif text-2xl text-white mb-3">Regression Tracking</h3>
            <p className="text-neutral-500 leading-relaxed text-sm">
              Compare scorecards version-over-version. Ensure prompt refactoring doesn't silently degrade safety boundaries.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-12 text-center text-neutral-500 text-sm">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <ShieldAlert className="h-5 w-5 text-neutral-700" />
          <span className="font-serif text-neutral-400">AgentCI</span>
        </div>
        <p>© 2026 AgentCI Inc. All rights reserved.</p>
      </footer>

    </div>
  );
}
