import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldAlert, 
  Plus, 
  Terminal, 
  User, 
  LogOut,
  FolderDot
} from 'lucide-react';
import { useTabStore } from '../store/tabStore';
import { threadsApi, authApi } from '../lib/api';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [threads, setThreads] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { addTab, activeTabId, setActiveTabId } = useTabStore();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
    
    // Load threads
    threadsApi.getThreads()
      .then(setThreads)
      .catch((err) => console.error('Failed to load threads:', err));
  }, [location.pathname]);

  const handleNewTest = () => {
    // Navigate to prompt input setup
    navigate('/thread/new');
  };

  const handleThreadClick = (thread: any) => {
    // If the thread has runs, navigate to the scorecard of the latest run
    if (thread.latestRun && thread.latestRun.runId) {
      const path = `/thread/${thread._id}/run/${thread.latestRun.runId}/scorecard`;
      addTab({
        id: `scorecard-${thread.latestRun.runId}`,
        title: `${thread.agentName} Scorecard`,
        path
      });
      navigate(path);
    } else {
      // Otherwise navigate to the setup page
      const path = `/thread/${thread._id}/setup`;
      addTab({
        id: `setup-${thread._id}`,
        title: `${thread.agentName} Setup`,
        path
      });
      navigate(path);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (score >= 50) return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    return 'bg-red-500/10 text-red-400 border border-red-500/20';
  };

  return (
    <aside className="w-64 bg-card border-r border-card-border flex flex-col justify-between shrink-0 h-screen overflow-hidden">
      
      {/* Brand & Action */}
      <div className="p-4 border-b border-card-border space-y-4">
        <button 
          onClick={() => {
            setActiveTabId('dashboard');
            navigate('/');
          }}
          className="flex items-center space-x-2.5 text-white hover:opacity-85 transition"
        >
          <div className="bg-primary/10 p-1.5 rounded-lg border border-primary/20">
            <ShieldAlert className="text-primary h-5 w-5" />
          </div>
          <span className="font-bold tracking-tight text-lg">AgentCI</span>
        </button>

        <button
          onClick={handleNewTest}
          className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold py-2 px-3 rounded-lg transition flex items-center justify-center space-x-1.5 shadow-lg shadow-primary/10"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Agent Audit</span>
        </button>
      </div>

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1.5">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-2 mb-2">
          Agent Threads
        </label>
        
        {threads.length === 0 ? (
          <div className="text-center py-8 text-slate-600 text-xs px-2">
            No audits created yet. Click "New Agent Audit" to start.
          </div>
        ) : (
          threads.map((t) => {
            const hasScore = t.latestRun && t.latestRun.overallScore !== undefined;
            const score = hasScore ? t.latestRun.overallScore : 0;
            const label = t.latestRun ? t.latestRun.versionLabel : 'v1';

            return (
              <button
                key={t._id}
                onClick={() => handleThreadClick(t)}
                className="w-full text-left p-2.5 rounded-lg transition-all hover:bg-slate-900/40 flex items-center justify-between text-xs text-slate-300 border border-transparent hover:border-card-border group"
              >
                <div className="flex items-center space-x-2 truncate pr-1">
                  <FolderDot className="h-4 w-4 text-slate-500 shrink-0 group-hover:text-primary transition" />
                  <div className="flex flex-col truncate">
                    <span className="font-bold text-slate-200 truncate">{t.agentName}</span>
                    <span className="text-[9px] text-slate-500 uppercase">{t.taskDomain?.replace('-', ' ')}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  <span className="text-[8px] text-slate-500 font-mono">{label}</span>
                  {hasScore ? (
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded font-mono ${getScoreColor(score)}`}>
                      {score}
                    </span>
                  ) : (
                    <span className="text-[8px] text-slate-500 font-semibold italic bg-slate-900 px-1 rounded">No Runs</span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* User Info Bottom */}
      <div className="p-4 border-t border-card-border bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center space-x-2 truncate">
          <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-primary font-bold text-xs uppercase border border-slate-700">
            {currentUser?.name?.charAt(0) || <User className="h-4 w-4" />}
          </div>
          <div className="flex flex-col truncate">
            <span className="text-xs font-semibold text-slate-300 truncate">{currentUser?.name || 'Loading...'}</span>
            <span className="text-[10px] text-slate-500 truncate">{currentUser?.email}</span>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          title="Log Out"
          className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>

    </aside>
  );
}
