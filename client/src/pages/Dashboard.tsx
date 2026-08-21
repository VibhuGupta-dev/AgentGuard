import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles,
  TrendingUp,
  ShieldAlert,
  ArrowUpRight,
  Terminal,
  Activity,
  CheckCircle2,
  ChevronRight,
  Plus
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
        
        const runsPromises = threadsData.map((t) => runsApi.getRuns(t._id).catch(() => []));
        const runsResults = await Promise.all(runsPromises);
        const flattenedRuns = runsResults.flat();
        
        setAllRuns(flattenedRuns);

        let latestRegression = null;
        for (let i = 0; i < threadsData.length; i++) {
          const threadRuns = runsResults[i] || [];
          if (threadRuns.length >= 2) {
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
                  delta: previous.overallScore - latest.overallScore,
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
      <div className="flex h-full min-h-[70vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  const totalAgents = threads.length;
  const totalRuns = allRuns.length;
  const completedRuns = allRuns.filter(r => r.status === 'completed');
  const avgScore = completedRuns.length > 0
    ? Math.round(completedRuns.reduce((sum, r) => sum + r.overallScore, 0) / completedRuns.length)
    : 0;

  const chartData = completedRuns
    .slice(0, 8)
    .reverse()
    .map((r, idx) => ({
      name: `R${idx + 1}`,
      Score: r.overallScore
    }));

  const defaultChartData = [
    { name: 'V1', Score: 60 },
    { name: 'V2', Score: 72 },
    { name: 'V3', Score: 85 },
    { name: 'V4', Score: 81 },
    { name: 'V5', Score: 95 }
  ];

  const displayData = chartData.length > 0 ? chartData : defaultChartData;

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

  const getUserName = () => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return u.name?.split(' ')[0] || 'User';
    } catch {
      return 'User';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 sm:space-y-16">
      
      {/* Hero Section */}
      <div className="space-y-6">
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white font-medium tracking-tight">
          Good evening, {getUserName()}.
        </h1>
        <p className="text-lg sm:text-xl text-neutral-400 font-light max-w-2xl leading-relaxed">
          Monitor your AI agents' safety boundaries and reliability trends. 
          Ready for another evaluation?
        </p>
        
        <div className="pt-4">
          <Link
            to="/thread/new"
            className="inline-flex items-center space-x-2 bg-primary hover:bg-primary-hover text-black font-medium px-6 py-3.5 rounded-full transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(255,90,0,0.2)] hover:shadow-[0_0_30px_rgba(255,90,0,0.4)]"
          >
            <Sparkles className="h-5 w-5" />
            <span>Audit New Agent</span>
          </Link>
        </div>
      </div>

      {totalAgents === 0 ? (
        <div className="border border-neutral-800 rounded-2xl p-10 sm:p-16 text-center bg-black/50 backdrop-blur-sm">
          <div className="bg-neutral-900 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Plus className="h-8 w-8 text-neutral-400" />
          </div>
          <h3 className="font-serif text-2xl text-white mb-3">No audits yet</h3>
          <p className="text-neutral-500 max-w-md mx-auto mb-8 text-sm sm:text-base leading-relaxed">
            Initialize your first agent evaluation by providing a system prompt and defining tool boundaries.
          </p>
          <Link
            to="/thread/new"
            className="text-primary hover:text-primary-hover border border-primary/30 hover:border-primary px-6 py-2.5 rounded-full transition-colors text-sm font-medium"
          >
            Create first audit
          </Link>
        </div>
      ) : (
        <div className="space-y-12 sm:space-y-16">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="border border-neutral-900 bg-neutral-950/30 p-5 sm:p-6 rounded-2xl flex flex-col justify-between">
              <span className="text-xs sm:text-sm font-medium text-neutral-500 mb-4">Total Agents</span>
              <div className="flex items-end justify-between">
                <span className="text-3xl sm:text-4xl font-serif text-white">{totalAgents}</span>
                <Activity className="h-5 w-5 text-neutral-600 mb-1" />
              </div>
            </div>
            
            <div className="border border-neutral-900 bg-neutral-950/30 p-5 sm:p-6 rounded-2xl flex flex-col justify-between">
              <span className="text-xs sm:text-sm font-medium text-neutral-500 mb-4">Executions</span>
              <div className="flex items-end justify-between">
                <span className="text-3xl sm:text-4xl font-serif text-white">{totalRuns}</span>
                <Terminal className="h-5 w-5 text-neutral-600 mb-1" />
              </div>
            </div>

            <div className="border border-neutral-900 bg-neutral-950/30 p-5 sm:p-6 rounded-2xl flex flex-col justify-between">
              <span className="text-xs sm:text-sm font-medium text-neutral-500 mb-4">Avg Reliability</span>
              <div className="flex items-end justify-between">
                <span className="text-3xl sm:text-4xl font-serif text-white">{avgScore}<span className="text-lg sm:text-xl text-neutral-600">%</span></span>
                <TrendingUp className="h-5 w-5 text-neutral-600 mb-1" />
              </div>
            </div>

            <div className={`border p-5 sm:p-6 rounded-2xl flex flex-col justify-between ${regression ? 'border-primary/30 bg-primary/5' : 'border-neutral-900 bg-neutral-950/30'}`}>
              <span className="text-xs sm:text-sm font-medium text-neutral-500 mb-4">Status</span>
              {regression ? (
                <div>
                  <span className="text-sm font-medium text-primary flex items-center mb-1">
                    <ShieldAlert className="h-4 w-4 mr-1.5" />
                    Regression
                  </span>
                  <span className="text-xs text-neutral-400 block truncate" title={regression.agentName}>
                    {regression.agentName} (-{regression.delta}%)
                  </span>
                </div>
              ) : (
                <div className="flex items-end justify-between">
                  <span className="text-sm sm:text-base font-medium text-emerald-500 flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    Stable
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Chart Section */}
          <div className="border border-neutral-900 bg-neutral-950/20 rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl text-white">Reliability Trend</h3>
                <p className="text-sm text-neutral-500 mt-1">Overall score progression across recent runs</p>
              </div>
            </div>
            
            <div className="h-[250px] sm:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={displayData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff5a00" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ff5a00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#525252" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#525252" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} dx={-10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #262626', borderRadius: '12px', padding: '12px' }}
                    labelStyle={{ color: '#a3a3a3', fontSize: '12px', marginBottom: '4px' }}
                    itemStyle={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}
                  />
                  <Area type="monotone" dataKey="Score" stroke="#ff5a00" strokeWidth={3} fillOpacity={1} fill="url(#scoreColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Runs List */}
          <div className="space-y-6">
            <h3 className="font-serif text-xl sm:text-2xl text-white">Recent Evaluations</h3>
            
            {allRuns.length === 0 ? (
              <p className="text-neutral-500 text-sm">No recent evaluations found.</p>
            ) : (
              <div className="grid gap-4">
                {allRuns.slice(0, 5).map((r) => {
                  const thread = threads.find((t) => t._id === r.threadId);
                  return (
                    <button 
                      key={r._id} 
                      onClick={() => handleRunClick(r)}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-neutral-900 rounded-2xl bg-neutral-950/30 hover:bg-neutral-900/50 hover:border-neutral-800 transition-all text-left gap-4 sm:gap-0"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-2 w-2 rounded-full ${
                          r.status === 'completed' ? 'bg-emerald-500' :
                          r.status === 'running' ? 'bg-primary animate-pulse' : 'bg-red-500'
                        }`} />
                        <div>
                          <h4 className="text-white font-medium text-sm sm:text-base group-hover:text-primary transition-colors">
                            {thread?.agentName || 'Unknown Agent'}
                          </h4>
                          <div className="flex items-center text-xs text-neutral-500 mt-1 gap-3">
                            <span className="font-mono bg-neutral-900 px-2 py-0.5 rounded text-neutral-400">{r.versionLabel}</span>
                            <span>{new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 sm:gap-8">
                        <div className="flex flex-col items-start sm:items-end">
                          <span className="text-xs text-neutral-500 mb-0.5">Score</span>
                          <span className={`font-mono font-medium ${r.status === 'completed' ? 'text-white' : 'text-neutral-600'}`}>
                            {r.status === 'completed' ? `${r.overallScore}%` : '--'}
                          </span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-neutral-700 group-hover:text-primary transition-colors transform group-hover:translate-x-1" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
