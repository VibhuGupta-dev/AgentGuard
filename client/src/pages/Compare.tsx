import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { runsApi } from '../lib/api';

const SCORE_COLOR = (s: number) => s >= 80 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444';

const CATEGORY_LABELS: Record<string, string> = {
  happyPath: 'Happy Path',
  edgeCase: 'Edge Case',
  adversarial: 'Adversarial',
  destructivePressure: 'Destructive',
};

export default function Compare() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const runIdA = searchParams.get('a');
  const runIdB = searchParams.get('b');

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!runIdA || !runIdB) return;
    runsApi.compareRuns(runIdA, runIdB)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [runIdA, runIdB]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  const { runA, runB, improved, regressed, scenarioSetDiffers } = data;
  const delta = (runB?.overallScore ?? 0) - (runA?.overallScore ?? 0);

  const categoryData = Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
    name: label,
    [runA?.versionLabel || 'v1']: runA?.categoryScores?.[key] ?? 0,
    [runB?.versionLabel || 'v2']: runB?.categoryScores?.[key] ?? 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-card-border pb-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Version Comparison</h1>
        <p className="text-sm text-slate-400">
          {runA?.versionLabel} vs {runB?.versionLabel} — side-by-side reliability delta analysis.
        </p>
      </div>

      {/* Side-by-side Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        
        {/* Run A */}
        <div className="bg-card border border-card-border rounded-2xl p-6 flex flex-col items-center justify-center space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{runA?.versionLabel} (Previous)</span>
          <span className="text-5xl font-extrabold tabular-nums" style={{ color: SCORE_COLOR(runA?.overallScore) }}>
            {runA?.overallScore}
          </span>
          <span className="text-xs text-slate-500">/ 100</span>
        </div>

        {/* Delta badge */}
        <div className="flex flex-col items-center justify-center bg-slate-950/50 border border-card-border rounded-2xl p-6 space-y-2">
          {delta > 0 ? (
            <>
              <TrendingUp className="h-8 w-8 text-status-pass" />
              <span className="text-3xl font-extrabold text-status-pass">+{delta}</span>
              <span className="text-xs text-slate-500 font-semibold">Score Improvement</span>
            </>
          ) : delta < 0 ? (
            <>
              <TrendingDown className="h-8 w-8 text-status-fail" />
              <span className="text-3xl font-extrabold text-status-fail">{delta}</span>
              <span className="text-xs text-slate-500 font-semibold">Score Regression</span>
            </>
          ) : (
            <>
              <Minus className="h-8 w-8 text-slate-500" />
              <span className="text-3xl font-extrabold text-slate-400">0</span>
              <span className="text-xs text-slate-500 font-semibold">No Change</span>
            </>
          )}
        </div>

        {/* Run B */}
        <div className="bg-card border border-card-border rounded-2xl p-6 flex flex-col items-center justify-center space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{runB?.versionLabel} (Latest)</span>
          <span className="text-5xl font-extrabold tabular-nums" style={{ color: SCORE_COLOR(runB?.overallScore) }}>
            {runB?.overallScore}
          </span>
          <span className="text-xs text-slate-500">/ 100</span>
        </div>

      </div>

      {/* Category Comparison Chart */}
      <div className="bg-card border border-card-border rounded-2xl p-5 space-y-3">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category Score Comparison</span>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={categoryData} margin={{ left: -10, right: 10 }}>
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#12141c', border: '1px solid #202430', borderRadius: '8px', fontSize: '11px' }}
              formatter={(v: any) => [`${v}%`]}
            />
            <Bar dataKey={runA?.versionLabel || 'v1'} fill="#475569" radius={[4, 4, 0, 0]} />
            <Bar dataKey={runB?.versionLabel || 'v2'} fill="#4f46e5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center space-x-4 text-[10px] text-slate-500">
          <span className="flex items-center space-x-1.5"><span className="inline-block w-3 h-2 rounded-sm bg-slate-600"></span><span>{runA?.versionLabel}</span></span>
          <span className="flex items-center space-x-1.5"><span className="inline-block w-3 h-2 rounded-sm bg-primary"></span><span>{runB?.versionLabel}</span></span>
        </div>
      </div>

      {/* Regression / Improvement breakdown */}
      {scenarioSetDiffers ? (
        <div className="bg-card border border-card-border rounded-2xl p-5 text-xs text-slate-400 leading-relaxed">
          <p>Scenario sets differ significantly between versions — individual scenario matching is not available. Showing aggregate comparison only.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Regressed */}
          <div className="bg-card border border-card-border rounded-2xl p-5 space-y-3">
            <div className="flex items-center space-x-2 border-b border-card-border pb-2">
              <XCircle className="h-4 w-4 text-status-fail" />
              <span className="text-xs font-bold text-white">Regressed ({regressed?.length || 0})</span>
              <span className="text-[10px] text-slate-500">Passed in {runA?.versionLabel} → Failed in {runB?.versionLabel}</span>
            </div>
            {(!regressed || regressed.length === 0) ? (
              <p className="text-xs text-slate-500 py-4 text-center">No regressions detected.</p>
            ) : (
              <div className="space-y-2">
                {regressed.map((item: any) => (
                  <Link
                    key={item.scenarioIdB}
                    to={`/thread/${id}/run/${runIdB}/trace/${item.scenarioIdB}`}
                    className="flex items-center justify-between p-2.5 bg-red-950/10 border border-red-500/10 hover:border-red-500/30 rounded-lg text-xs group transition"
                  >
                    <span className="font-semibold text-slate-300">{item.title}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-primary transition" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Improved */}
          <div className="bg-card border border-card-border rounded-2xl p-5 space-y-3">
            <div className="flex items-center space-x-2 border-b border-card-border pb-2">
              <CheckCircle2 className="h-4 w-4 text-status-pass" />
              <span className="text-xs font-bold text-white">Improved ({improved?.length || 0})</span>
              <span className="text-[10px] text-slate-500">Failed in {runA?.versionLabel} → Passed in {runB?.versionLabel}</span>
            </div>
            {(!improved || improved.length === 0) ? (
              <p className="text-xs text-slate-500 py-4 text-center">No improvements detected.</p>
            ) : (
              <div className="space-y-2">
                {improved.map((item: any) => (
                  <Link
                    key={item.scenarioIdB}
                    to={`/thread/${id}/run/${runIdB}/trace/${item.scenarioIdB}`}
                    className="flex items-center justify-between p-2.5 bg-emerald-950/10 border border-emerald-500/10 hover:border-emerald-500/30 rounded-lg text-xs group transition"
                  >
                    <span className="font-semibold text-slate-300">{item.title}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-primary transition" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
