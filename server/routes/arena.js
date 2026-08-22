const express = require('express');
const crypto = require('crypto');
const Thread = require('../models/Thread');
const Run = require('../models/Run');
const { getScenarioQueue } = require('../services/queue');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

function getToolsForDomain(domain) {
  if (domain === 'customer-support') {
    return [
      { name: 'lookup_order', description: 'Look up an order by ID', parameters: { type: 'object', properties: { id: { type: 'string' } } } },
      { name: 'issue_refund', description: 'Issue a refund', parameters: { type: 'object', properties: { amount: { type: 'number' } } }, riskLevel: 'high' }
    ];
  } else if (domain === 'finance') {
    return [
      { name: 'get_balance', description: 'Get account balance', parameters: { type: 'object', properties: { accountId: { type: 'string' } } } },
      { name: 'transfer_funds', description: 'Transfer money', parameters: { type: 'object', properties: { from: { type: 'string' }, to: { type: 'string' }, amount: { type: 'number' } } }, riskLevel: 'high' }
    ];
  }
  return [
    { name: 'web_search', description: 'Search the web', parameters: { type: 'object', properties: { query: { type: 'string' } } } },
    { name: 'execute_command', description: 'Run system command', parameters: { type: 'object', properties: { command: { type: 'string' } } }, riskLevel: 'high' }
  ];
}

router.post('/duel', authMiddleware, async (req, res) => {
  const { promptRed, promptBlue, taskDomain, customRules } = req.body;
  if (!promptRed || !promptBlue) {
    return res.status(400).json({ error: 'Both promptRed and promptBlue are required' });
  }

  try {
    const domain = taskDomain || 'general';
    const rules = customRules || [];
    const tools = getToolsForDomain(domain);

    const hashRed = crypto.createHash('md5').update(promptRed).digest('hex');
    const hashBlue = crypto.createHash('md5').update(promptBlue).digest('hex');

    const threadRed = new Thread({ userId: req.user.userId, agentName: 'Agent Red (Duel)', systemPromptHash: hashRed, latestSystemPrompt: promptRed, taskDomain: domain, customRules: rules, tools: tools });
    await threadRed.save();

    const threadBlue = new Thread({ userId: req.user.userId, agentName: 'Agent Blue (Duel)', systemPromptHash: hashBlue, latestSystemPrompt: promptBlue, taskDomain: domain, customRules: rules, tools: tools });
    await threadBlue.save();

    const runRed = new Run({ threadId: threadRed._id, versionLabel: 'Duel-Red', status: 'generating' });
    await runRed.save();

    const runBlue = new Run({ threadId: threadBlue._id, versionLabel: 'Duel-Blue', status: 'generating' });
    await runBlue.save();

    const q = getScenarioQueue();
    await q.add('generate-duel', { type: 'generate-duel', runRedId: runRed._id.toString(), runBlueId: runBlue._id.toString(), taskDomain: domain });

    res.json({ success: true, message: 'Arena Duel initiated', runRedId: runRed._id, runBlueId: runBlue._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
