import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FolderSync, 
  HelpCircle, 
  Terminal, 
  TrendingUp, 
  ShieldAlert, 
  ArrowUpRight,
  TrendingDown,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { threadsApi, runsApi } from '../lib/api';
import { useTabStore } from '../store/tabStore';

export default function Dashboard() {
  const navigate = useNavigate();
  const { addTab } = useTabStore();
  const [threads, setThreads] = useState<any[]>([]);
  const [allRuns, setAllRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [regression, setRegression] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    threadsApi.getThreads()
      .then(async (threadsData) => {
        setThreads(threadsData);
        
        // Load runs for each thread to aggregate stats
        const runsPromises = threadsData.map((t) => runsApi.getRuns(t._id).catch(() => []));
        const runsResults = await Promise.all(runsPromises);
        const flattenedRuns = runsResults.flat();
        
        setAllRuns(flattenedRuns);

        // Compute most recent regression
        // Check if any thread has a newer run score lower than an older run score
        let latestRegression = null;
        for (let i = 0; i < threadsData.length; i++) {
          const threadRuns = runsResults[i] || [];
          if (threadRuns.length >= 2) {
            // threadRuns are sorted descending by createdAt
            const latest = threadRuns[0];
            const previous = threadRuns[1];
            
            if (latest.overallScore < previous.overallScore && latest.status === 'completed' && previous.status === 'completed') {
              if (!latestRegression || new Date(latest.createdAt) > new Date(latestRegression.createdAt)) {
                latestRegression = {
                  agentName: threadsData[i].agentName,
                  threadId: threadsData[i]._id,
                  latestRunId: latest._id,
                  previousRunId: previous._id,
                  latestScore: latest.overallScore,
                  previousScore: previous.overallScore,
                  delta: latest.overallScore - previous.overallScore,
                  createdAt: latest.createdAt
                };
              }
            }
          }
        }
        setRegression(latestRegression);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  // Calculate Aggregates
  const totalAgents = threads.length;
  const totalRuns = allRuns.length;
  const completedRuns = allRuns.filter(r => r.status === 'completed');
  const avgScore = completedRuns.length > 0
    ? Math.round(completedRuns.reduce((sum, r) => sum + r.overallScore, 0) / completedRuns.length)
    : 0;

  // Chart data: outcome distributions or overall scores
  const chartData = completedRuns
    .slice(0, 8)
    .reverse()
    .map((r, idx) => ({
      name: `Run #${idx + 1}`,
      Score: r.overallScore
    }));

  // Safe fallback chart data if empty
  const defaultChartData = [
    { name: 'Build 1', Score: 60 },
    { name: 'Build 2', Score: 72 },
    { name: 'Build 3', Score: 85 }
  ];

  const handleRunClick = (run: any) => {
    const thread = threads.find(t => t._id === run.threadId);
    const path = `/thread/${run.threadId}/run/${run._id}/scorecard`;
    addTab({
      id: `scorecard-${run._id}`,
      title: `${thread?.agentName || 'Agent'} Scorecard`,
      path
    });
    navigate(path);
  };

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Dashboard</h1>
          <p className="text-sm text-slate-400">Continuous Integration analytics summary for your LLM agents.</p>
        </div>

        <Link
          to="/thread/new"
          className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2 rounded-lg transition flex items-center space-x-1.5 shadow-lg shadow-primary/20"
        >
          <Sparkles className="h-4 w-4" />
          <span>New Agent Audit</span>
        </Link>
      </div>

      {totalAgents === 0 ? (
        <div className="bg-card border border-card-border p-12 rounded-xl text-center flex flex-col items-center justify-center space-y-4 py-20">
          <FolderSync className="h-12 w-12 text-slate-700 animate-pulse-soft" />
          <h3 className="text-lg font-bold text-white">No Agent Audits Configured</h3>
          <p className="text-slate-400 text-sm max-w-sm">
            To start evaluation runs, paste your agent prompt, extract tools parameters, and generate test suites.
          </p>
          <Link
            to="/thread/new"
            className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
          >
            Create First Audit Thread
          </Link>
        </div>
      ) : (
        <>
          {/* Stats widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Agents */}
            <div className="bg-card border border-card-border p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Audited Agents</span>
                <span className="text-2xl font-extrabold text-white mt-1 block">{totalAgents}</span>
              </div>
              <div className="bg-slate-900 border border-card-border text-slate-400 p-2.5 rounded-lg">
                <HelpCircle className="h-5 w-5" />
              </div>
            </div>

            {/* Total Runs */}
            <div className="bg-card border border-card-border p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Executions</span>
                <span className="text-2xl font-extrabold text-white mt-1 block">{totalRuns}</span>
              </div>
              <div className="bg-slate-900 border border-card-border text-slate-400 p-2.5 rounded-lg">
                <Terminal className="h-5 w-5" />
              </div>
            </div>

            {/* Average score */}
            <div className="bg-card border border-card-border p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Average Reliability</span>
                <span className="text-2xl font-extrabold text-white mt-1 block">{avgScore}%</span>
              </div>
              <div className="h-10 w-10 rounded-full border-4 border-slate-900 flex items-center justify-center font-bold text-xs bg-slate-950 text-emerald-400 border-t-emerald-500">
                {avgScore}
              </div>
            </div>

            {/* Recent Regression */}
            <div className="bg-card border border-card-border p-4 rounded-xl flex items-center justify-between">
              {regression ? (
                <div className="truncate pr-1">
                  <span className="text-[10px] text-status-fail font-bold uppercase tracking-wider flex items-center space-x-1">
                    <ShieldAlert className="h-3 w-3" />
                    <span>Recent Regression</span>
                  </span>
                  <span className="text-xs font-bold text-white truncate mt-1 block leading-none">{regression.agentName}</span>
                  <span className="text-[10px] text-status-fail mt-1 block font-semibold flex items-center space-x-0.5">
                    <TrendingDown className="h-3 w-3" />
                    <span>{regression.delta}% score drop</span>
                  </span>
                </div>
              ) : (
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Regressions</span>
                  <span className="text-xs font-bold text-emerald-400 mt-2 block flex items-center space-x-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Builds stable</span>
                  </span>
                </div>
              )}
              <div className={`p-2.5 rounded-lg border ${regression ? 'bg-red-950/20 border-red-500/20 text-red-400 animate-pulse-soft' : 'bg-slate-900 border-card-border text-slate-500'}`}>
                <ShieldAlert className="h-5 w-5" />
              </div>
            </div>

          </div>

          {/* Core Analytics Line/Area Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="bg-card border border-card-border p-5 rounded-xl lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Evaluation Reliability Pipeline</h3>
                <span className="text-[9px] bg-slate-800 border border-card-border px-2 py-0.5 rounded text-slate-400 font-semibold uppercase">Overall Runs score</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.length > 0 ? chartData : defaultChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#12141c', border: '1px solid #202430', borderRadius: '8px' }}
                      labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 'bold' }}
                      itemStyle={{ color: '#fff', fontSize: '11px' }}
                    />
                    <Area type="monotone" dataKey="Score" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#scoreColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Regression breakdown drawer */}
            <div className="bg-card border border-card-border p-5 rounded-xl flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-card-border pb-2 flex items-center space-x-1.5 text-status-fail">
                  <ShieldAlert className="h-4.5 w-4.5" />
                  <span>Regression Alerts</span>
                </h3>

                {regression ? (
                  <div className="bg-red-950/10 border border-red-500/20 p-3 rounded-lg text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">{regression.agentName}</span>
                      <span className="text-[8px] bg-red-900/30 text-red-400 px-1.5 py-0.5 rounded font-extrabold uppercase">Regression</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      The score dropped from <span className="font-bold text-slate-200">{regression.previousScore}%</span> in previous run to <span className="font-bold text-status-fail">{regression.latestScore}%</span>.
                    </p>
                    <button
                      onClick={() => {
                        const path = `/thread/${regression.threadId}/compare?a=${regression.previousRunId}&b=${regression.latestRunId}`;
                        addTab({
                          id: `compare-${regression.previousRunId}-${regression.latestRunId}`,
                          title: `Compare Runs`,
                          path
                        });
                        navigate(path);
                      }}
                      className="text-[10px] text-primary hover:underline font-semibold flex items-center space-x-0.5 pt-1 border-t border-card-border/60 w-full text-left"
                    >
                      <span>Analyze regressions delta</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-600 text-xs flex flex-col items-center space-y-1.5">
                    <CheckCircle2 className="h-6 w-6 text-status-pass" />
                    <span>No builds regressions detected. All revisions remain stable.</span>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-slate-500 leading-relaxed bg-slate-950 p-2.5 rounded border border-card-border">
                Regressions compare scores across sequential prompts to alert you when prompt refactoring triggers safety or tool loops bypasses.
              </div>
            </div>

          </div>

          {/* Recent Runs Logs */}
          <div className="bg-card border border-card-border p-5 rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Recent CI Runs</h3>

            {allRuns.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No runs recorded yet. Paste your prompt to initialize evaluations.
              </div>
            ) : (
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-card-border text-slate-500 font-semibold">
                      <th className="pb-2.5">Version Build</th>
                      <th className="pb-2.5">Agent</th>
                      <th className="pb-2.5">Status</th>
                      <th className="pb-2.5">Score</th>
                      <th className="pb-2.5">Audited Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border/50 text-slate-300">
                    {allRuns.slice(0, 5).map((r) => {
                      const thread = threads.find((t) => t._id === r.threadId);
                      return (
                        <tr key={r._id} className="hover:bg-slate-900/20 transition">
                          <td className="py-3 font-semibold text-slate-200">
                            <button onClick={() => handleRunClick(r)} className="hover:text-primary hover:underline transition">
                              {r.versionLabel}
                            </button>
                          </td>
                          <td className="py-3 text-slate-400 font-semibold">{thread?.agentName || 'Unknown Agent'}</td>
                          <td className="py-3 capitalize">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.status === 'completed' 
                                ? 'bg-status-pass/10 text-status-pass' 
                                : r.status === 'running' 
                                ? 'bg-status-running/10 text-status-running' 
                                : 'bg-status-fail/10 text-status-fail'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="py-3 font-mono font-bold">{r.status === 'completed' ? `${r.overallScore}%` : 'N/A'}</td>
                          <td className="py-3 text-slate-500">{new Date(r.createdAt).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
}
