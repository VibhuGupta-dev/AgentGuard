import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Sparkles, 
  Layers, 
  AlertTriangle, 
  Settings2, 
  ShieldAlert, 
  ArrowRight,
  Plus,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { threadsApi } from '../lib/api';
import { useTabStore } from '../store/tabStore';

export default function PromptInput() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addTab } = useTabStore();

  // Prompt Paste step
  const [systemPrompt, setSystemPrompt] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);

  // Extracted details confirmation step
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [taskDomain, setTaskDomain] = useState<'customer-support' | 'coding' | 'finance' | 'general'>('general');
  const [tools, setTools] = useState<any[]>([]);
  const [versionLabel, setVersionLabel] = useState('v1');
  const [saving, setSaving] = useState(false);

  // New Tool dialog (inline)
  const [newToolName, setNewToolName] = useState('');
  const [newToolDesc, setNewToolDesc] = useState('');
  const [newToolRisk, setNewToolRisk] = useState<'low' | 'medium' | 'high'>('low');

  useEffect(() => {
    if (id && id !== 'new') {
      setThreadId(id);
      // Pre-analyze existing thread setup
      setAnalyzing(true);
      threadsApi.analyzeThread(id)
        .then((res) => {
          setAgentName(res.agentName);
          setTaskDomain(res.taskDomain);
          setTools(res.tools || []);
          setShowConfigForm(true);
        })
        .catch(console.error)
        .finally(() => setAnalyzing(false));
    }
  }, [id]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!systemPrompt.trim()) return;

    setAnalyzing(true);
    try {
      // 1. Create thread skeleton
      const threadRes = await threadsApi.createThread(systemPrompt);
      setThreadId(threadRes._id);

      // 2. Trigger LLM analysis
      const analysisRes = await threadsApi.analyzeThread(threadRes._id);
      setAgentName(analysisRes.agentName);
      setTaskDomain(analysisRes.taskDomain);
      setTools(analysisRes.tools || []);
      
      setShowConfigForm(true);
    } catch (err: any) {
      alert('Analysis failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!threadId) return;

    setSaving(true);
    try {
      const config = {
        agentName,
        taskDomain,
        tools,
        versionLabel
      };

      const res = await threadsApi.confirmSetup(threadId, config);
      const runId = res.run._id;

      // Navigate to scenario page & add tab
      const path = `/thread/${threadId}/run/${runId}/scenarios`;
      addTab({
        id: `scenarios-${runId}`,
        title: `Build Test Suite`,
        path
      });
      navigate(path);
    } catch (err: any) {
      alert('Setup confirmation failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleAddTool = () => {
    if (!newToolName || !newToolDesc) return;
    const newTool = {
      name: newToolName,
      description: newToolDesc,
      parameters: { type: "object", properties: {} },
      riskLevel: newToolRisk
    };
    setTools([...tools, newTool]);
    setNewToolName('');
    setNewToolDesc('');
    setNewToolRisk('low');
  };

  const handleDeleteTool = (index: number) => {
    setTools(tools.filter((_, idx) => idx !== index));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Agent Audit Setup</h1>
        <p className="text-sm text-slate-400">Initialize a new evaluation thread or customize tool access constraints.</p>
      </div>

      {/* SKELETON LOADER SPREADS DURING ANALYSIS */}
      {analyzing ? (
        <div className="bg-card border border-card-border p-8 rounded-2xl text-center space-y-4 py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto"></div>
          <h3 className="text-base font-bold text-white">Extracting Agent Blueprints</h3>
          <p className="text-slate-400 text-xs max-w-xs mx-auto leading-normal">
            Claude is analyzing your system prompt to suggest an agent name, task domain, and extract parameters schema of declared tools...
          </p>
        </div>
      ) : !showConfigForm ? (
        
        /* STEP 1: PROMPT PASTE INPUT BOX */
        <div className="bg-card border border-card-border p-6 rounded-2xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-card-border pb-3">
            <Sparkles className="h-4.5 w-4.5 text-primary" />
            <h3 className="text-sm font-bold text-white">Define System Prompt Instructions</h3>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-4 text-xs">
            <p className="text-slate-400 leading-normal">
              Paste your agent's system prompt instructions. Our engine will crawl the context to extract tool definitions and flag high-risk methods automatically.
            </p>

            <textarea
              required
              rows={12}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="e.g. You are a customer support representative. You have access to issue_refund for high-priority requests. Always remain helpful..."
              className="w-full bg-slate-900 border border-card-border focus:border-primary/50 text-white rounded-xl p-4 text-xs outline-none transition font-mono leading-relaxed"
            />

            <button
              type="submit"
              className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition flex items-center space-x-1.5 shadow-lg shadow-primary/20"
            >
              <Sparkles className="h-4 w-4" />
              <span>Analyze & Extract Tools</span>
            </button>
          </form>
        </div>

      ) : (
        
        /* STEP 2: CONFIRMATION EDITING PANELS */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Config Details (Left 2/3) */}
          <div className="bg-card border border-card-border p-6 rounded-2xl lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2 border-b border-card-border pb-3">
              <Settings2 className="h-4.5 w-4.5 text-primary" />
              <h3 className="text-sm font-bold text-white">Extracted Metadata</h3>
            </div>

            <form onSubmit={handleConfirm} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Suggested Agent Name</label>
                  <input
                    type="text"
                    required
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className="w-full bg-slate-900 border border-card-border focus:border-primary/50 text-white rounded-lg px-3 py-2 text-xs outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Task Domain</label>
                  <select
                    value={taskDomain}
                    onChange={(e) => setTaskDomain(e.target.value as any)}
                    className="w-full bg-slate-900 border border-card-border focus:border-primary/50 text-white rounded-lg px-3 py-2 text-xs outline-none"
                  >
                    <option value="customer-support">Customer Support</option>
                    <option value="coding">Coding</option>
                    <option value="finance">Finance</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Run Version Tag</label>
                <input
                  type="text"
                  required
                  value={versionLabel}
                  onChange={(e) => setVersionLabel(e.target.value)}
                  placeholder="e.g. v1"
                  className="w-full bg-slate-900 border border-card-border focus:border-primary/50 text-white rounded-lg px-3 py-2 text-xs outline-none transition font-mono font-bold"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition flex items-center space-x-1.5 shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  <span>{saving ? 'Confirming...' : 'Confirm & Generate Scenarios'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

            </form>
          </div>

          {/* Tools Extracted Panel (Right 1/3) */}
          <div className="bg-card border border-card-border p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-200 border-b border-card-border pb-3">Declared Tools ({tools.length})</h3>

            {/* Quick Add Custom Tool */}
            <div className="bg-slate-950 p-3 border border-card-border rounded-xl space-y-2 text-xs">
              <span className="text-[9px] text-slate-500 font-bold block uppercase">Custom Tool Override</span>
              <input
                type="text"
                placeholder="refund_money"
                value={newToolName}
                onChange={(e) => setNewToolName(e.target.value)}
                className="w-full bg-slate-900 border border-card-border rounded px-2 py-1 outline-none text-[11px]"
              />
              <input
                type="text"
                placeholder="refunds transaction"
                value={newToolDesc}
                onChange={(e) => setNewToolDesc(e.target.value)}
                className="w-full bg-slate-900 border border-card-border rounded px-2 py-1 outline-none text-[11px]"
              />
              <select
                value={newToolRisk}
                onChange={(e) => setNewToolRisk(e.target.value as any)}
                className="w-full bg-slate-900 border border-card-border rounded px-2 py-1 outline-none text-[11px] text-slate-300"
              >
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
              <button
                type="button"
                onClick={handleAddTool}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-1 rounded text-[10px] font-bold"
              >
                + Add Tool
              </button>
            </div>

            {/* List of tools */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {tools.map((t, idx) => (
                <div key={idx} className="bg-slate-950 p-2.5 border border-card-border rounded-lg flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono text-xs text-white font-bold">{t.name}</span>
                      {t.riskLevel === 'high' && (
                        <span className="bg-red-950/20 text-red-400 border border-red-500/20 text-[8px] px-1.5 py-0.25 rounded font-extrabold uppercase flex items-center space-x-0.5 animate-pulse-soft">
                          <AlertTriangle className="h-2 w-2" />
                          <span>Destructive</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400">{t.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteTool(idx)}
                    className="text-slate-600 hover:text-slate-400 p-0.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
