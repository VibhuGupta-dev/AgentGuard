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
    const run = await Run.findById(req.params.id);
    if (!run) return res.status(404).json({ error: 'Run not found' });

    run.status = 'generating';
    await run.save();

    // Enqueue job
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

module.exports = router;
