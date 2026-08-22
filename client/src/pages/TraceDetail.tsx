import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircle2, XCircle, AlertTriangle, MessageSquare,
  Wrench, Zap, Terminal, ChevronLeft, Play
} from 'lucide-react';
import { runsApi } from '../lib/api';

const STEP_META: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  user_message:         { icon: <MessageSquare className="h-4 w-4" />, label: 'User',             color: 'text-blue-400 border-blue-500/20 bg-blue-950/10' },
  agent_reasoning:      { icon: <Zap className="h-4 w-4" />,           label: 'Agent Reasoning',  color: 'text-violet-400 border-violet-500/20 bg-violet-950/10' },
  tool_call:            { icon: <Wrench className="h-4 w-4" />,         label: 'Tool Invoked',     color: 'text-amber-400 border-amber-500/20 bg-amber-950/10' },
  tool_result:          { icon: <Terminal className="h-4 w-4" />,        label: 'Tool Result',      color: 'text-emerald-400 border-emerald-500/20 bg-emerald-950/10' },
  agent_final_response: { icon: <CheckCircle2 className="h-4 w-4" />,   label: 'Final Response',   color: 'text-sky-400 border-sky-500/20 bg-sky-950/10' },
};

const SEVERITY_COLORS: Record<string, string> = {
  low: 'text-emerald-400 bg-emerald-950/20 border-emerald-500/20',
  medium: 'text-amber-400 bg-amber-950/20 border-amber-500/20',
  high: 'text-orange-400 bg-orange-950/20 border-orange-500/20',
  critical: 'text-red-400 bg-red-950/20 border-red-500/20',
};

export default function TraceDetail() {
  const { id, runId, scenarioId } = useParams();
  const navigate = useNavigate();

  const [trace, setTrace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [replaying, setReplaying] = useState(false);
  const [replaySteps, setReplaySteps] = useState<any[]>([]);
  const [evidenceStepIdx, setEvidenceStepIdx] = useState<number | null>(null);
  const evidenceRef = useRef<HTMLDivElement>(null);
  const replayIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!scenarioId) return;
    runsApi.getTrace(scenarioId)
      .then(setTrace)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [scenarioId]);

  useEffect(() => {
    // Auto-detect which step the evidence cites (look for matching step number in evidence text)
    if (trace?.failureEvidence) {
      const match = trace.failureEvidence.match(/step\s*(\d+)/i);
      if (match) setEvidenceStepIdx(parseInt(match[1]) - 1);
    }
  }, [trace]);

  const handleReplay = () => {
    if (!trace?.steps?.length) return;
    setReplaying(true);
    setReplaySteps([]);
    let idx = 0;
    replayIntervalRef.current = setInterval(() => {
      setReplaySteps(prev => [...prev, trace.steps[idx]]);
      idx++;
      if (idx >= trace.steps.length) {
        clearInterval(replayIntervalRef.current!);
        setReplaying(false);
      }
    }, 600);
  };

  useEffect(() => () => { if (replayIntervalRef.current) clearInterval(replayIntervalRef.current); }, []);

  const displaySteps = replaying || replaySteps.length > 0 ? replaySteps : (trace?.steps || []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!trace) {
    return (
      <div className="text-center py-20 text-slate-500 text-sm">
        Trace record not found.
      </div>
    );
  }

  const scenario = trace.scenarioId;
  const sev = trace.severity || 'low';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back nav */}
      <button
        onClick={() => navigate(-1)}
        className="text-xs text-slate-400 hover:text-white transition flex items-center space-x-1"
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Back to Scorecard</span>
      </button>

      {/* Header verdict banner */}
      <div className={`p-5 rounded-2xl border flex items-start justify-between gap-4
        ${trace.outcome === 'pass'
          ? 'bg-emerald-950/15 border-emerald-500/20'
          : 'bg-red-950/15 border-red-500/20'}`}
      >
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            {trace.outcome === 'pass'
              ? <CheckCircle2 className="h-5 w-5 text-status-pass" />
              : <XCircle className="h-5 w-5 text-status-fail" />}
            <span className={`text-sm font-extrabold uppercase ${trace.outcome === 'pass' ? 'text-status-pass' : 'text-status-fail'}`}>
              {trace.outcome}
            </span>
            {trace.failureMode && trace.failureMode !== 'none' && (
              <span className="text-[10px] font-mono font-bold bg-slate-900 border border-card-border text-slate-300 px-2 py-0.5 rounded">
                {trace.failureMode.replace(/_/g, ' ')}
              </span>
            )}
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${SEVERITY_COLORS[sev]}`}>
              {sev} severity
            </span>
          </div>

          <h2 className="text-base font-bold text-white">
            {typeof scenario === 'object' ? scenario?.title : 'Trace Detail'}
          </h2>

          {trace.failureEvidence && (
            <p className="text-xs text-slate-400 leading-relaxed">{trace.failureEvidence}</p>
          )}
        </div>

        <button
          onClick={handleReplay}
          disabled={replaying}
          className="shrink-0 bg-slate-900 border border-card-border hover:bg-slate-800 text-slate-300 text-xs font-semibold px-3 py-2 rounded-lg flex items-center space-x-1.5 transition disabled:opacity-50"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          <span>{replaying ? 'Replaying…' : 'Replay'}</span>
        </button>
      </div>

      {/* Timeline steps */}
      <div className="space-y-4">
        {displaySteps.map((step: any, idx: number) => {
          const meta = STEP_META[step.type] || { icon: <Terminal className="h-4 w-4" />, label: step.type, color: 'text-slate-400 border-card-border bg-slate-900/50' };
          const isEvidence = evidenceStepIdx === idx && trace.outcome === 'fail';

          return (
            <div
              key={idx}
              ref={isEvidence ? evidenceRef : undefined}
              className={`flex items-start space-x-4 p-4 rounded-xl border transition
                ${isEvidence ? 'border-red-500/40 ring-1 ring-red-500/20 bg-red-950/5' : 'border-card-border bg-card'}`}
            >
              {/* Icon pill */}
              <div className={`p-2 rounded-lg border shrink-0 ${meta.color}`}>
                {meta.icon}
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Step {step.stepNumber}</span>
                    <span className="text-[9px] font-bold text-slate-400">{meta.label}</span>
                    {isEvidence && (
                      <span className="text-[9px] font-bold bg-red-950/30 text-red-400 border border-red-500/20 px-1.5 rounded flex items-center space-x-0.5">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        <span>Evidence</span>
                      </span>
                    )}
                  </div>
                  {step.toolName && (
                    <span className="text-[9px] font-mono bg-amber-950/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20">
                      {step.toolName}
                    </span>
                  )}
                </div>

                <pre className={`text-xs font-mono leading-relaxed whitespace-pre-wrap break-words rounded-lg p-3 border ${meta.color} ${step.isSimulated ? '!text-white' : '!text-blue-400'}`}>
                  {step.type === 'tool_call' && step.toolInput
                    ? JSON.stringify(step.toolInput, null, 2)
                    : (typeof step.content === 'object' ? JSON.stringify(step.content, null, 2) : String(step.content || ''))}
                </pre>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
