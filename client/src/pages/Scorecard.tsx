import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  CheckCircle2, XCircle, BarChart3, AlertTriangle, ChevronRight, GitCompare, Download, Zap
} from 'lucide-react';
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  PieChart, Pie, Legend
} from 'recharts';
import { runsApi } from '../lib/api';
import { useTabStore } from '../store/tabStore';

const SCORE_COLOR = (s: number) =>
  s >= 80 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444';

const CATEGORY_LABELS: Record<string, string> = {
  happyPath: 'Happy Path',
  edgeCase: 'Edge Case',
  adversarial: 'Adversarial',
  destructivePressure: 'Destructive',
  toolFailureRecovery: 'Recovery',
};

const TAXONOMY_LABELS: Record<string, string> = {
  toolLoop: 'Tool Loop',
  unsafeDestructiveAction: 'Unsafe Action',
  goalDrift: 'Goal Drift',
  hallucinatedConfidence: 'Hallucination',
  incomplete_task: 'Incomplete / Error',
  other: 'Other',
};

const TAXONOMY_COLORS = ['#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#6b7280'];

export default function Scorecard() {
  const { id, runId } = useParams();
  const navigate = useNavigate();
  const { addTab } = useTabStore();

  const [run, setRun] = useState<any>(null);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [traces, setTraces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [compareRuns, setCompareRuns] = useState<any[]>([]);
  
  // Auto-Prompt Optimizer State
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedPrompt, setOptimizedPrompt] = useState<string | null>(null);

  const handleOptimizePrompt = async () => {
    setOptimizing(true);
    try {
      const res = await runsApi.optimizePrompt(runId!);
      setOptimizedPrompt(res.optimizedPrompt);
    } catch (err: any) {
      alert('Optimization failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setOptimizing(false);
    }
  };

  useEffect(() => {
    if (!runId || !id) return;

    Promise.all([
      runsApi.getRunDetails(runId),
      runsApi.getRunStatus(runId)
    ]).then(([details, status]) => {
      setRun(status.run);
      setScenarios(status.scenarios || []);
      setTraces(status.traces || []);
    }).catch(console.error).finally(() => setLoading(false));

    // Load sibling runs for comparison CTA
    runsApi.getRuns(id).then(setCompareRuns).catch(() => {});
  }, [runId, id]);

  if (loading || !run) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  const score = run.overallScore ?? 0;
  const catScores = run.categoryScores || {};
  const taxonomy = run.failureTaxonomyCounts || {};

  const categoryBarData = Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
    name: label,
    score: catScores[key] ?? 100,
    fill: SCORE_COLOR(catScores[key] ?? 100),
  }));

  const pieData = Object.entries(TAXONOMY_LABELS)
    .map(([key, name]) => ({ name, value: taxonomy[key] || 0 }))
    .filter(d => d.value > 0);

  const failedTraces = traces.filter(t => t.outcome === 'fail');

  const canCompare = compareRuns.length >= 2;
  const prevRun = compareRuns.find(r => r._id !== runId);

  const handleCompare = () => {
    if (!prevRun) return;
    const path = `/thread/${id}/compare?a=${prevRun._id}&b=${runId}`;
    addTab({ id: `compare-${runId}`, title: 'Version Compare', path });
    navigate(path);
  };

  const handleDownloadCsv = () => {
    let csv = "Scenario,Category,Outcome,Failure Mode,Severity,Evidence\n";
    traces.forEach(t => {
      const sc = scenarios.find(s => s._id === t.scenarioId);
      const title = sc ? `"${sc.title.replace(/"/g, '""')}"` : "Unknown";
      const cat = sc ? sc.category : "Unknown";
      const evidence = t.failureEvidence ? `"${t.failureEvidence.replace(/"/g, '""')}"` : '""';
      csv += `${title},${cat},${t.outcome || ''},${t.failureMode || ''},${t.severity || ''},${evidence}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AgentGuard_Run_${run.versionLabel}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card border border-card-border p-5 rounded-2xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
            <span>{run.isAttackMode ? 'Agent Attack Security Report' : 'Evaluation Scorecard'}</span>
            {run.isAttackMode && <span className="text-red-500">🔥</span>}
          </h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center space-x-2">
            <span>{run?.versionLabel}</span>
            <span className="text-slate-600">|</span>
            <span className="font-mono">{run?.tokensUsed?.toLocaleString()} tokens</span>
            <span className="text-slate-600">|</span>
            <span className="font-mono text-emerald-400 font-bold">~${(run?.estimatedCost || 0).toFixed(4)}</span>
          </p>
        </div>
        <div className="flex space-x-2">
          {run.isAttackMode ? null : canCompare && (
            <button
              onClick={handleCompare}
              className="border border-primary/40 text-primary hover:bg-primary/10 text-xs font-semibold px-4 py-2 rounded-lg flex items-center space-x-1.5 transition"
            >
              <GitCompare className="h-4 w-4" />
              <span>Compare Versions</span>
            </button>
          )}
          <button
            onClick={handleDownloadCsv}
            className="border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center space-x-1.5 transition"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Big Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-card border border-card-border rounded-2xl p-6 flex flex-col items-center justify-center space-y-2 md:col-span-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{run.isAttackMode ? 'Security Score' : 'Overall Score'}</span>
          <span
            className="text-6xl font-extrabold tabular-nums"
            style={{ color: SCORE_COLOR(score) }}
          >
            {score}
          </span>
          <span className="text-xs text-slate-500 font-semibold">{run.isAttackMode ? `Blocked: ${run.overallScore / 10}/10 Attacks` : '/ 100'}</span>
          <div className={`text-xs font-bold px-3 py-1 rounded-full mt-1 border
            ${score >= 80
              ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20'
              : score >= 50
              ? 'bg-amber-950/20 text-amber-400 border-amber-500/20'
              : 'bg-red-950/20 text-red-400 border-red-500/20'}`}
          >
            {run.isAttackMode ? (score >= 80 ? 'Secure' : score >= 50 ? 'Vulnerable' : 'Critical Risk') : (score >= 80 ? 'Reliable' : score >= 50 ? 'Needs Improvement' : 'Critical Failures')}
          </div>
        </div>

        {/* Category Bar Chart */}
        <div className="bg-card border border-card-border rounded-2xl p-5 md:col-span-2 space-y-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category Breakdown</span>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={categoryBarData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis type="category" dataKey="name" width={90} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#12141c', border: '1px solid #202430', borderRadius: '8px', fontSize: '11px' }}
                formatter={(v: any) => [`${v}%`, 'Score']}
              />
              <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                {categoryBarData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Taxonomy Pie + Failed Scenarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Taxonomy donut */}
        <div className="bg-card border border-card-border rounded-2xl p-5 space-y-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Failure Taxonomy</span>
          {pieData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-600 space-y-2">
              <CheckCircle2 className="h-8 w-8 text-status-pass" />
              <span className="text-xs">No failures recorded — all scenarios passed!</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={TAXONOMY_COLORS[i % TAXONOMY_COLORS.length]} />)}
                </Pie>
                <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#12141c', border: '1px solid #202430', borderRadius: '8px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Failed Scenarios list */}
        <div className="bg-card border border-card-border rounded-2xl p-5 space-y-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Failed Scenarios ({failedTraces.length})</span>

          {failedTraces.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-600 space-y-2">
              <CheckCircle2 className="h-8 w-8 text-status-pass" />
              <span className="text-xs">All evaluations passed successfully.</span>
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto max-h-52 pr-1">
              {failedTraces.map((trace) => {
                const sc = scenarios.find(s => s._id === trace.scenarioId);
                return (
                  <Link
                    key={trace._id}
                    to={`/thread/${id}/run/${runId}/trace/${trace.scenarioId}`}
                    onClick={() => addTab({
                      id: `trace-${trace.scenarioId}`,
                      title: sc?.title || 'Trace',
                      path: `/thread/${id}/run/${runId}/trace/${trace.scenarioId}`
                    })}
                    className="block p-3 bg-red-950/10 border border-red-500/10 hover:border-red-500/30 rounded-xl text-xs transition group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1.5">
                          <XCircle className="h-3.5 w-3.5 text-status-fail shrink-0" />
                          <span className="font-bold text-white">{sc?.title || 'Scenario'}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {trace.failureMode?.replace(/_/g, ' ') || 'unknown'}
                          {trace.severity && ` · ${trace.severity} severity`}
                        </span>
                        {trace.failureEvidence && (
                          <p className="text-[10px] text-slate-500 leading-normal line-clamp-2">{trace.failureEvidence}</p>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-primary transition shrink-0 mt-0.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Auto-Prompt Optimizer Section */}
      {failedTraces.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-950/40 to-purple-950/40 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden mt-6">
          <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>🤖 Auto-Prompt Optimizer</span>
                <span className="bg-indigo-500/20 text-indigo-300 text-[9px] px-2 py-0.5 rounded uppercase tracking-wider font-bold">Self-Healing AI</span>
              </h2>
              <p className="text-sm text-indigo-200/70 mt-1 max-w-xl">
                Your agent failed {failedTraces.length} security checks. Let our AI analyze the failure traces and automatically generate a heavily guarded, optimized system prompt to patch these vulnerabilities.
              </p>
            </div>
            <button
              onClick={handleOptimizePrompt}
              disabled={optimizing}
              className="shrink-0 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 px-5 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-indigo-900/20"
            >
              {optimizing ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Optimizing Prompt...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span>Generate Security Patch</span>
                </>
              )}
            </button>
          </div>

          {optimizedPrompt && (
            <div className="mt-6 pt-6 border-t border-indigo-500/20 relative z-10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">Optimized System Prompt</h3>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(optimizedPrompt);
                    alert('Copied to clipboard!');
                  }}
                  className="text-[10px] bg-indigo-950 hover:bg-indigo-900 border border-indigo-500/50 text-indigo-200 px-3 py-1.5 rounded transition font-semibold"
                >
                  Copy to Clipboard
                </button>
              </div>
              <pre className="text-xs font-mono bg-black/60 border border-indigo-500/20 p-5 rounded-xl text-indigo-100 whitespace-pre-wrap leading-relaxed shadow-inner overflow-x-auto">
                {optimizedPrompt}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
