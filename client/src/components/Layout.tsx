import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, LayoutDashboard } from 'lucide-react';
import Sidebar from './Sidebar';
import { useTabStore } from '../store/tabStore';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { tabs, activeTabId, closeTab, setActiveTabId } = useTabStore();

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
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground select-none">
      
      {/* PERSISTENT SIDEBAR */}
      <Sidebar />

      {/* WORKSPACE AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* IDE-STYLE TAB BARBAR */}
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
        <div className="flex-1 overflow-y-auto p-6 md:p-8 min-w-0">
          {children}
        </div>

      </div>

    </div>
  );
}
