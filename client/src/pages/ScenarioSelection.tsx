import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Sparkles, 
  CheckCircle, 
  HelpCircle, 
  ShieldCheck, 
  AlertTriangle,
  Play
} from 'lucide-react';
import { runsApi } from '../lib/api';
import { useTabStore } from '../store/tabStore';

export default function ScenarioSelection() {
  const navigate = useNavigate();
  const { id, runId } = useParams();
  const { addTab } = useTabStore();

  const [loading, setLoading] = useState(true);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Tabs State
  const [activeTab, setActiveTab] = useState<'happy_path' | 'edge_case' | 'adversarial' | 'destructive_pressure'>('happy_path');

  useEffect(() => {
    if (!runId) return;

    const generateAndLoad = async () => {
      setLoading(true);
      try {
        // 1. Trigger scenario generation in backend queue
        await runsApi.generateScenarios(runId);
        
        // 2. Poll for scenario readiness (check status or items)
        let attempts = 0;
        const maxAttempts = 200; // 300 seconds timeout to survive API rate limit cooling periods
        
        const poll = setInterval(async () => {
          attempts++;
          try {
            const res = await runsApi.getRunDetails(runId);
            if (res.scenarios && res.scenarios.length > 0) {
              clearInterval(poll);
              setScenarios(res.scenarios);
              setSelectedIds(res.scenarios.map((s: any) => s._id)); // Default select all
              setLoading(false);
            } else if (attempts >= maxAttempts) {
              clearInterval(poll);
              alert('Scenario generation timed out. Please try again.');
              setLoading(false);
            }
          } catch (err) {
            clearInterval(poll);
            console.error(err);
            setLoading(false);
          }
        }, 1500);

      } catch (err: any) {
        alert('Failed to generate scenarios: ' + (err.response?.data?.error || err.message));
        setLoading(false);
      }
    };

    generateAndLoad();
  }, [runId]);

  const toggleSelect = (scenarioId: string) => {
    if (selectedIds.includes(scenarioId)) {
      setSelectedIds(selectedIds.filter(id => id !== scenarioId));
    } else {
      setSelectedIds([...selectedIds, scenarioId]);
    }
  };

  const handleRunSuite = async () => {
    if (selectedIds.length === 0 || !runId || !id) return;
    setLoading(true);
    try {
      await runsApi.executeSuite(runId, selectedIds);
      
      const path = `/thread/${id}/run/${runId}/execute`;
      addTab({
        id: `execute-${runId}`,
        title: `Sandbox Execution`,
        path
      });
      navigate(path);
    } catch (err: any) {
      alert('Failed to execute suite: ' + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'happy_path', label: 'Happy Path', icon: CheckCircle, color: 'text-status-pass' },
    { key: 'edge_case', label: 'Edge Case', icon: HelpCircle, color: 'text-slate-400' },
    { key: 'adversarial', label: 'Adversarial', icon: AlertTriangle, color: 'text-status-fail' },
    { key: 'destructive_pressure', label: 'Destructive Pressure', icon: ShieldCheck, color: 'text-status-running' }
  ];

  const filteredScenarios = scenarios.filter((s) => s.category === activeTab);

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-card-border pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Scenario Library Selection</h1>
          <p className="text-sm text-slate-400">Select which evaluations to include in the continuous integration sandbox audit.</p>
        </div>

        <button
          onClick={handleRunSuite}
          disabled={selectedIds.length === 0 || loading}
          className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition flex items-center space-x-1.5 shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          <Play className="h-3.5 w-3.5 fill-white" />
          <span>Run Auditing Suite ({selectedIds.length})</span>
        </button>
      </div>

      {loading ? (
        /* LOADING SKELETON CARDS */
        <div className="space-y-4">
          <div className="flex space-x-2 border-b border-card-border pb-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-8 w-24 bg-slate-900 border border-card-border rounded-lg animate-pulse"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card border border-card-border h-40 rounded-xl animate-pulse p-4 space-y-3">
                <div className="h-4 w-2/3 bg-slate-800 rounded"></div>
                <div className="h-10 w-full bg-slate-850 rounded"></div>
                <div className="h-8 w-full bg-slate-850 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Tab headers bar */}
          <div className="flex border-b border-card-border text-xs font-semibold overflow-x-auto select-none shrink-0 pr-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.key === activeTab;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`
                    px-4 py-2.5 border-b-2 flex items-center space-x-1.5 transition-all outline-none shrink-0
                    ${isActive 
                      ? 'border-primary text-white bg-slate-900/40' 
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                    }
                  `}
                >
                  <Icon className={`h-4 w-4 ${tab.color}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Panel */}
          {filteredScenarios.length === 0 ? (
            <div className="py-20 text-center text-slate-600 text-xs">
              No scenarios generated for this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredScenarios.map((sc) => {
                const isChecked = selectedIds.includes(sc._id);
                return (
                  <div 
                    key={sc._id}
                    onClick={() => toggleSelect(sc._id)}
                    className={`
                      p-4 border rounded-xl flex flex-col justify-between space-y-3 transition-all cursor-pointer bg-card
                      ${isChecked 
                        ? 'border-primary/50 ring-1 ring-primary/20' 
                        : 'border-card-border opacity-70 hover:opacity-100 hover:border-slate-700'
                      }
                    `}
                  >
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-white leading-tight">{sc.title}</h4>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // Controlled via card click handler
                          className="rounded border-card-border text-primary focus:ring-primary bg-slate-900 h-4 w-4"
                        />
                      </div>
                      <p className="text-slate-400 leading-normal line-clamp-2">{sc.description}</p>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-lg border border-card-border/80 text-[10px] space-y-1">
                      <span className="text-[9px] text-slate-500 font-bold block uppercase">Expected Assert</span>
                      <p className="text-slate-400 font-mono leading-normal truncate">{sc.expectedSafeBehavior}</p>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
