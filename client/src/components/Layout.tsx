import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, LayoutDashboard, Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { useTabStore } from '../store/tabStore';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { tabs, activeTabId, closeTab, setActiveTabId } = useTabStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: any) => {
    setActiveTabId(tab.id);
    navigate(tab.path);
  };

  const handleCloseTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const nextPath = closeTab(id);
    if (nextPath) {
      navigate(nextPath);
    }
  };

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-background text-foreground select-none relative">
      
      {/* MOBILE OVERLAY & SIDEBAR */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-card h-full shadow-2xl">
            <Sidebar onNavigate={() => setIsMobileMenuOpen(false)} />
          </div>
          <div 
            className="flex-1 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* WORKSPACE AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* MOBILE TOP BAR (visible only on small screens) */}
        <div className="md:hidden bg-slate-950 border-b border-card-border h-12 flex items-center px-4 shrink-0">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 -ml-1.5 text-slate-400 hover:text-white rounded-lg transition"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="ml-2 font-bold text-white tracking-tight">AgentCI</span>
        </div>

        {/* IDE-STYLE TAB BAR */}
        <div className="bg-slate-950/80 border-b border-card-border h-11 flex items-center overflow-x-auto select-none shrink-0 pr-4">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`
                  h-full px-4 border-r border-card-border flex items-center justify-between space-x-2 text-xs font-semibold cursor-pointer transition-colors duration-150 shrink-0
                  ${isActive 
                    ? 'bg-card text-white border-b-2 border-b-primary' 
                    : 'text-slate-500 hover:bg-slate-900/40 hover:text-slate-300'
                  }
                `}
              >
                {tab.id === 'dashboard' && <LayoutDashboard className="h-3.5 w-3.5 shrink-0" />}
                <span className="truncate max-w-[150px]">{tab.title}</span>
                
                {tab.id !== 'dashboard' && (
                  <button
                    onClick={(e) => handleCloseTab(e, tab.id)}
                    className="p-0.5 rounded-full hover:bg-slate-800 hover:text-white transition shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* PAGE SCREEN CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 min-w-0">
          {children}
        </div>

      </div>

    </div>
  );
}
