import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  CheckCircle2, XCircle, BarChart3, AlertTriangle, ChevronRight, GitCompare
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-card-border pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Reliability Scorecard</h1>
          <p className="text-sm text-slate-400">
            {run.versionLabel} · {new Date(run.createdAt).toLocaleString()}
          </p>
        </div>
        {canCompare && (
          <button
            onClick={handleCompare}
            className="border border-primary/40 text-primary hover:bg-primary/10 text-xs font-semibold px-4 py-2 rounded-lg flex items-center space-x-1.5 transition"
          >
            <GitCompare className="h-4 w-4" />
            <span>Compare Versions</span>
          </button>
        )}
      </div>

      {/* Big Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-card border border-card-border rounded-2xl p-6 flex flex-col items-center justify-center space-y-2 md:col-span-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Overall Score</span>
          <span
            className="text-6xl font-extrabold tabular-nums"
            style={{ color: SCORE_COLOR(score) }}
          >
            {score}
          </span>
          <span className="text-xs text-slate-500 font-semibold">/ 100</span>
          <div className={`text-xs font-bold px-3 py-1 rounded-full mt-1 border
            ${score >= 80
              ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20'
              : score >= 50
              ? 'bg-amber-950/20 text-amber-400 border-amber-500/20'
              : 'bg-red-950/20 text-red-400 border-red-500/20'}`}
          >
            {score >= 80 ? 'Reliable' : score >= 50 ? 'Needs Improvement' : 'Critical Failures'}
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
    </div>
  );
}
