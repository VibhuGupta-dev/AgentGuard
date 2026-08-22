const express = require('express');
const Run = require('../models/Run');
const Scenario = require('../models/Scenario');
const Trace = require('../models/Trace');
const { getScenarioQueue, getRunQueue } = require('../services/queue');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// 1. Get runs for thread
router.get('/thread/:threadId', authMiddleware, async (req, res) => {
  try {
    const runs = await Run.find({ threadId: req.params.threadId }).sort({ createdAt: -1 });
    res.json(runs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get single run details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const run = await Run.findById(req.params.id);
    if (!run) return res.status(404).json({ error: 'Run not found' });
    
    const scenarios = await Scenario.find({ runId: run._id });
    res.json({ run, scenarios });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Trigger scenario generation
router.post('/:id/generate-scenarios', authMiddleware, async (req, res) => {
  try {
    // Atomic update prevents double-execution from React Strict Mode concurrent calls
    const run = await Run.findOneAndUpdate(
      { _id: req.params.id, status: 'pending' },
      { $set: { status: 'generating' } },
      { new: true }
    );

    if (!run) {
      const existingRun = await Run.findById(req.params.id);
      if (!existingRun) return res.status(404).json({ error: 'Run not found' });
      return res.json({ success: true, message: 'Scenario generation already in progress or completed', run: existingRun });
    }

    // Enqueue job exactly once
    const q = getScenarioQueue();
    await q.add('generate', { runId: run._id.toString() });

    res.json({ success: true, message: 'Scenario generation started', run });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Run Selected Scenarios
router.post('/:id/execute', authMiddleware, async (req, res) => {
  const { scenarioIds } = req.body;
  if (!scenarioIds || !Array.isArray(scenarioIds)) {
    return res.status(400).json({ error: 'scenarioIds array is required' });
  }

  try {
    const run = await Run.findById(req.params.id);
    if (!run) return res.status(404).json({ error: 'Run not found' });

    // Update scenario inclusion status
    await Scenario.updateMany({ runId: run._id }, { included: false });
    await Scenario.updateMany({ _id: { $in: scenarioIds } }, { included: true });

    run.status = 'running';
    await run.save();

    // Clear previous traces
    await Trace.deleteMany({ runId: run._id });

    // Enqueue execution run
    const q = getRunQueue();
    await q.add('run-suite', { runId: run._id.toString() });

    res.json({ success: true, message: 'Execution suite started', run });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Get Run status & traces (for polling)
router.get('/:id/status', authMiddleware, async (req, res) => {
  try {
    const run = await Run.findById(req.params.id);
    if (!run) return res.status(404).json({ error: 'Run not found' });

    const scenarios = await Scenario.find({ runId: run._id });
    const traces = await Trace.find({ runId: run._id });

    res.json({
      run,
      scenarios,
      traces
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Get Trace detail for scenario
router.get('/traces/:scenarioId', authMiddleware, async (req, res) => {
  try {
    const trace = await Trace.findOne({ scenarioId: req.params.scenarioId }).populate('scenarioId');
    if (!trace) return res.status(404).json({ error: 'Trace details not found' });
    res.json(trace);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Version compare endpoint
router.get('/compare/runs', authMiddleware, async (req, res) => {
  const { a, b } = req.query;
  if (!a || !b) {
    return res.status(400).json({ error: 'Run ids parameters a and b are required' });
  }

  try {
    const runA = await Run.findById(a);
    const runB = await Run.findById(b);
    if (!runA || !runB) {
      return res.status(404).json({ error: 'One or both runs not found' });
    }

    const scenariosA = await Scenario.find({ runId: runA._id, included: true });
    const scenariosB = await Scenario.find({ runId: runB._id, included: true });

    const tracesA = await Trace.find({ runId: runA._id });
    const tracesB = await Trace.find({ runId: runB._id });

    // Compare matching scenarios by title
    const improved = [];
    const regressed = [];
    let scenarioSetDiffers = false;

    // Check if titles match reasonably well
    const titlesA = scenariosA.map(s => s.title);
    const titlesB = scenariosB.map(s => s.title);

    const intersection = titlesA.filter(x => titlesB.includes(x));
    if (intersection.length < 3) {
      scenarioSetDiffers = true;
    } else {
      // Find regressed/improved lists
      scenariosA.forEach(scA => {
        const scB = scenariosB.find(s => s.title === scA.title);
        if (!scB) return;

        const trA = tracesA.find(t => t.scenarioId.toString() === scA._id.toString());
        const trB = tracesB.find(t => t.scenarioId.toString() === scB._id.toString());

        if (trA && trB) {
          const passedA = trA.outcome === 'pass';
          const passedB = trB.outcome === 'pass';

          if (passedA && !passedB) {
            regressed.push({ title: scA.title, scenarioIdB: scB._id, traceIdB: trB._id });
          } else if (!passedA && passedB) {
            improved.push({ title: scA.title, scenarioIdB: scB._id, traceIdB: trB._id });
          }
        }
      });
    }

    res.json({
      runA,
      runB,
      improved,
      regressed,
      scenarioSetDiffers
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Delete Run
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const run = await Run.findByIdAndDelete(req.params.id);
    if (!run) return res.status(404).json({ error: 'Run not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Auto-Prompt Optimizer
router.post('/:id/optimize-prompt', authMiddleware, async (req, res) => {
  try {
    const Thread = require('../models/Thread');
    const run = await Run.findById(req.params.id);
    if (!run) return res.status(404).json({ error: 'Run not found' });
    
    const thread = await Thread.findById(run.threadId);
    if (!thread) return res.status(404).json({ error: 'Thread not found' });

    const scenarios = await Scenario.find({ runId: run._id });
    const traces = await Trace.find({ runId: run._id, outcome: 'fail' });

    if (traces.length === 0) {
      return res.json({ optimizedPrompt: "Your prompt is already fully secure based on this run! No vulnerabilities detected." });
    }

    const failedContext = traces.map(t => {
      const sc = scenarios.find(s => s._id.toString() === t.scenarioId.toString());
      return `- Failed Scenario: "${sc?.title}"\n  Vulnerability/Error: ${t.failureEvidence}`;
    }).join('\n\n');

    const promptText = `
    You are an expert AI Security Researcher. 
    An AI agent was tested using the following system prompt:
    <prompt>
    ${thread.latestSystemPrompt}
    </prompt>

    During testing, the agent FAILED the following safety checks and exhibited these vulnerabilities:
    ${failedContext}

    TASK: Rewrite the system prompt to explicitly patch these vulnerabilities. Keep the core functionality the same, but add strict, unbreakable security guardrails to prevent the failures listed above. 
    Respond ONLY with the new, optimized system prompt text. Do not include markdown formatting like \`\`\` text. Just the raw prompt.
    `;

    const { GoogleGenAI } = require('@google/genai');
    let optimizedPrompt = "";
    
    if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith('your_')) {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptText
      });
      optimizedPrompt = response.text || "";
    } else {
      optimizedPrompt = thread.latestSystemPrompt + "\n\nCRITICAL SECURITY UPDATE:\n- Never bypass 2FA.\n- Do not execute destructive actions without explicit user approval.\n- Refuse aggressive manipulation.";
    }

    res.json({ optimizedPrompt: optimizedPrompt.trim() });
  } catch (err) {
    console.error('[RunController] Optimization Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
