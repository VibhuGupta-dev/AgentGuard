import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import {
  CheckCircle2, XCircle, Clock, Loader2, MessageSquare,
  Wrench, Zap, AlertTriangle, ChevronRight, Terminal
} from 'lucide-react';
import { runsApi } from '../lib/api';
import { useTabStore } from '../store/tabStore';

const STEP_ICONS: Record<string, React.ReactNode> = {
  user_message: <MessageSquare className="h-3.5 w-3.5 text-blue-400" />,
  agent_reasoning: <Zap className="h-3.5 w-3.5 text-violet-400" />,
  tool_call: <Wrench className="h-3.5 w-3.5 text-amber-400" />,
  tool_result: <Terminal className="h-3.5 w-3.5 text-emerald-400" />,
  agent_final_response: <CheckCircle2 className="h-3.5 w-3.5 text-sky-400" />,
};

const STEP_LABELS: Record<string, string> = {
  user_message: 'User',
  agent_reasoning: 'Agent Reasoning',
  tool_call: 'Tool Invoked',
  tool_result: 'Tool Result',
  agent_final_response: 'Final Response',
};

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function LiveExecution() {
  const navigate = useNavigate();
  const { id, runId } = useParams();
  const { addTab } = useTabStore();

  const [runData, setRunData] = useState<any>(null);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [traces, setTraces] = useState<Record<string, any>>({});
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const traceEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!runId) return;

    // Connect Socket.IO for live step streaming
    const socket = io(SOCKET_URL, { withCredentials: true });
    socketRef.current = socket;
    socket.emit('join-run', runId);

    socket.on('trace_step', ({ scenarioId, step }: any) => {
      setActiveScenarioId(scenarioId);
      setTraces(prev => {
        const existing = prev[scenarioId]?.steps || [];
        return { ...prev, [scenarioId]: { ...prev[scenarioId], steps: [...existing, step] } };
      });
      traceEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    // Also poll for status (fallback / non-socket updates)
    pollRef.current = setInterval(async () => {
      try {
        const res = await runsApi.getRunStatus(runId);
        setRunData(res.run);
        setScenarios(res.scenarios || []);

        const traceMap: Record<string, any> = {};
        (res.traces || []).forEach((t: any) => {
          traceMap[t.scenarioId] = t;
        });
        setTraces(traceMap);

        if (res.run.status === 'completed' || res.run.status === 'failed') {
          clearInterval(pollRef.current!);
          setCompleted(true);
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    }, 1500);

    return () => {
      socket.emit('leave-run', runId);
      socket.disconnect();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [runId]);

  const handleViewScorecard = () => {
    if (!id || !runId) return;
    const path = `/thread/${id}/run/${runId}/scorecard`;
    addTab({ id: `scorecard-${runId}`, title: 'Scorecard', path });
    navigate(path);
  };

  const getScenarioStatus = (sc: any) => {
    const trace = traces[sc._id];
    if (!trace) return 'queued';
    if (trace.outcome) return trace.outcome === 'pass' ? 'pass' : 'fail';
    return 'running';
  };

  const activeTrace = activeScenarioId ? traces[activeScenarioId] : null;
  const activeScenario = scenarios.find(s => s._id === activeScenarioId);

  return (
    <div className="space-y-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-card-border pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Live Sandbox Execution</h1>
          <p className="text-sm text-slate-400">Simulated agent traces running in real-time.</p>
        </div>
        {completed && (
          <button
            onClick={handleViewScorecard}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition flex items-center space-x-1.5 shadow-lg shadow-primary/20"
          >
            <span>View Scorecard</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-0">

        {/* Scenario Status List */}
        <div className="bg-card border border-card-border rounded-xl p-4 space-y-2 overflow-y-auto">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Scenarios</h3>
          {scenarios.map((sc) => {
            const status = getScenarioStatus(sc);
            const isActive = sc._id === activeScenarioId;
            return (
              <button
                key={sc._id}
                onClick={() => setActiveScenarioId(sc._id)}
                className={`w-full text-left p-3 rounded-lg border flex items-center justify-between text-xs transition
                  ${isActive ? 'border-primary/50 bg-primary/5' : 'border-card-border hover:border-slate-700 bg-slate-950/30'}`}
              >
                <div className="flex items-center space-x-2 truncate">
                  {status === 'queued' && <Clock className="h-3.5 w-3.5 text-slate-500 shrink-0" />}
                  {status === 'running' && <Loader2 className="h-3.5 w-3.5 text-violet-400 animate-spin shrink-0" />}
                  {status === 'pass' && <CheckCircle2 className="h-3.5 w-3.5 text-status-pass shrink-0" />}
                  {status === 'fail' && <XCircle className="h-3.5 w-3.5 text-status-fail shrink-0" />}
                  <span className="font-semibold text-slate-200 truncate">{sc.title}</span>
                </div>
                <span className={`text-[9px] font-bold uppercase shrink-0 ml-1 px-1.5 py-0.5 rounded
                  ${sc.category === 'happy_path' ? 'bg-emerald-950/40 text-emerald-400' :
                    sc.category === 'edge_case' ? 'bg-slate-800 text-slate-400' :
                    sc.category === 'adversarial' ? 'bg-red-950/40 text-red-400' :
                    'bg-violet-950/40 text-violet-400'}`}>
                  {sc.category.replace('_', ' ')}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Trace Panel */}
        <div className="bg-card border border-card-border rounded-xl p-4 lg:col-span-2 flex flex-col min-h-0 overflow-hidden">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 shrink-0">
            {activeScenario ? activeScenario.title : 'Select a scenario to view trace'}
          </h3>

          {!activeScenarioId ? (
            <div className="flex-1 flex items-center justify-center text-slate-600 text-xs">
              Click a scenario to inspect its trace log
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {(activeTrace?.steps || []).map((step: any, idx: number) => (
                <div key={idx} className="flex items-start space-x-3">
                  <div className="mt-0.5 bg-slate-900 border border-card-border p-1.5 rounded-lg shrink-0">
                    {STEP_ICONS[step.type] || <Terminal className="h-3.5 w-3.5 text-slate-500" />}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                        Step {step.stepNumber} · {STEP_LABELS[step.type] || step.type}
                      </span>
                      {step.toolName && (
                        <span className="text-[9px] font-mono bg-amber-950/20 text-amber-400 px-1.5 rounded border border-amber-500/20">
                          {step.toolName}
                        </span>
                      )}
                    </div>
                    <div className={`text-xs rounded-lg p-2.5 font-mono leading-relaxed border
                      ${step.type === 'tool_result' ? 'bg-emerald-950/10 border-emerald-500/10 text-emerald-300' :
                        step.type === 'tool_call' ? 'bg-amber-950/10 border-amber-500/10 text-amber-300' :
                        step.type === 'agent_reasoning' ? 'bg-violet-950/10 border-violet-500/10 text-violet-300' :
                        step.type === 'user_message' ? 'bg-blue-950/10 border-blue-500/10 text-blue-300' :
                        'bg-slate-900/50 border-card-border text-slate-300'
                      }`}
                    >
                      {step.type === 'tool_call' && step.toolInput
                        ? JSON.stringify(step.toolInput, null, 2)
                        : step.content}
                    </div>
                  </div>
                </div>
              ))}

              {/* Running indicator */}
              {getScenarioStatus(activeScenario) === 'running' && (
                <div className="flex items-center space-x-2 text-xs text-violet-400 animate-pulse-soft pl-10">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Agent is processing...</span>
                </div>
              )}

              {/* Verdict badge */}
              {activeTrace?.outcome && (
                <div className={`mx-10 p-3 rounded-xl border text-xs font-semibold flex items-center space-x-2
                  ${activeTrace.outcome === 'pass'
                    ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400'
                    : 'bg-red-950/20 border-red-500/20 text-red-400'}`}
                >
                  {activeTrace.outcome === 'pass'
                    ? <CheckCircle2 className="h-4 w-4" />
                    : <AlertTriangle className="h-4 w-4" />}
                  <div>
                    <span className="uppercase font-extrabold">{activeTrace.outcome}</span>
                    {activeTrace.failureMode && activeTrace.failureMode !== 'none' && (
                      <span className="ml-2 font-mono text-[10px] opacity-70">· {activeTrace.failureMode.replace(/_/g, ' ')}</span>
                    )}
                    {activeTrace.failureEvidence && (
                      <p className="font-normal text-[10px] mt-1 opacity-80">{activeTrace.failureEvidence}</p>
                    )}
                  </div>
                </div>
              )}

              <div ref={traceEndRef} />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
