import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Swords, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { runsApi } from '../lib/api';

export default function ArenaBattle() {
  const { redId, blueId } = useParams();
  const [redData, setRedData] = useState<any>(null);
  const [blueData, setBlueData] = useState<any>(null);

  useEffect(() => {
    if (!redId || !blueId) return;

    const poll = setInterval(async () => {
      try {
        const [red, blue] = await Promise.all([
          runsApi.getRunStatus(redId),
          runsApi.getRunStatus(blueId)
        ]);
        
        setRedData(red);
        setBlueData(blue);

        if (red.run.status !== 'running' && red.run.status !== 'generating' && red.run.status !== 'pending' &&
            blue.run.status !== 'running' && blue.run.status !== 'generating' && blue.run.status !== 'pending') {
          clearInterval(poll);
        }
      } catch (err) {
        console.error(err);
      }
    }, 2000);

    return () => clearInterval(poll);
  }, [redId, blueId]);

  if (!redData || !blueData) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Loading Arena Data...</p>
      </div>
    );
  }

  const redRun = redData.run;
  const blueRun = blueData.run;
  
  // Align scenarios by title since they are identical
  const scenarios = redData.scenarios || [];

  const getTraceInfo = (traces: any[], scenarioId: string, runStatus: string) => {
    const tr = traces.find(t => t.scenarioId === scenarioId);
    if (!tr) {
      if (runStatus === 'generating' || runStatus === 'pending') return { status: 'Waiting...', color: 'text-slate-500' };
      if (runStatus === 'running') return { status: 'Evaluating...', color: 'text-yellow-500 animate-pulse' };
      return { status: 'Skipped', color: 'text-slate-500' };
    }
    if (tr.outcome === 'pass') return { status: 'PASSED', color: 'text-emerald-400', icon: <CheckCircle2 className="h-4 w-4" /> };
    return { status: 'FAILED', color: 'text-red-400', icon: <XCircle className="h-4 w-4" /> };
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-card border border-card-border p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-6">
        
        {/* Red Score */}
        <div className="flex-1 space-y-2">
          <h2 className="text-red-500 font-black uppercase tracking-widest text-sm flex items-center justify-center md:justify-start space-x-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span>Agent Red</span>
          </h2>
          <div className="text-5xl font-black text-white">
            {redRun.status === 'completed' || redRun.status === 'failed' ? (redRun.overallScore || 0) + '%' : '...'}
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-widest">{redRun.status}</p>
        </div>

        {/* VS */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-full">
          <Swords className="h-8 w-8 text-slate-500" />
        </div>

        {/* Blue Score */}
        <div className="flex-1 space-y-2 text-right">
          <h2 className="text-blue-500 font-black uppercase tracking-widest text-sm flex items-center justify-center md:justify-end space-x-2">
            <span>Agent Blue</span>
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          </h2>
          <div className="text-5xl font-black text-white">
            {blueRun.status === 'completed' || blueRun.status === 'failed' ? (blueRun.overallScore || 0) + '%' : '...'}
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-widest">{blueRun.status}</p>
        </div>
      </div>

      {/* Battle Table */}
      <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 bg-slate-950/50 border-b border-card-border p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div className="col-span-6">Challenge Scenario</div>
          <div className="col-span-3 text-center text-red-500/80">Agent Red</div>
          <div className="col-span-3 text-center text-blue-500/80">Agent Blue</div>
        </div>

        <div className="divide-y divide-card-border">
          {scenarios.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <div className="space-y-1">
                <p className="text-white font-bold">Forging Arena Challenges...</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Generating custom evaluation scenarios. This may take 1-2 minutes if the AI provider is rate-limiting requests. Please do not close this tab.
                </p>
              </div>
            </div>
          ) : (
            scenarios.map((sc: any) => {
              // Find equivalent blue scenario
              const blueSc = blueData.scenarios.find((s: any) => s.title === sc.title);
              
              const redResult = getTraceInfo(redData.traces || [], sc._id, redRun.status);
              const blueResult = getTraceInfo(blueData.traces || [], blueSc?._id, blueRun.status);

              return (
                <div key={sc._id} className="grid grid-cols-12 p-4 items-center hover:bg-slate-900/30 transition">
                  <div className="col-span-6 space-y-1 pr-4">
                    <h4 className="text-sm font-bold text-white">{sc.title}</h4>
                    <p className="text-xs text-slate-500 truncate">{sc.userMessage}</p>
                    <span className="text-[9px] uppercase tracking-wider text-primary/70 bg-primary/10 px-2 py-0.5 rounded font-bold">
                      {sc.category}
                    </span>
                  </div>
                  
                  <div className={`col-span-3 text-center flex flex-col items-center justify-center font-black text-sm ${redResult.color}`}>
                    {redResult.icon && <div className="mb-1">{redResult.icon}</div>}
                    {redResult.status}
                  </div>

                  <div className={`col-span-3 text-center flex flex-col items-center justify-center font-black text-sm ${blueResult.color}`}>
                    {blueResult.icon && <div className="mb-1">{blueResult.icon}</div>}
                    {blueResult.status}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
