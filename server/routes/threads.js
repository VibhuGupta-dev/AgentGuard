const express = require('express');
const crypto = require('crypto');
const { Anthropic } = require('@anthropic-ai/sdk');
const Thread = require('../models/Thread');
const Run = require('../models/Run');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Helper: check if tool name contains destructive keywords
function getRiskLevel(name, description) {
  const destructiveKeywords = ['delete', 'refund', 'send', 'transfer', 'cancel', 'remove', 'wire', 'pay'];
  const text = `${name || ''} ${description || ''}`.toLowerCase();
  
  if (destructiveKeywords.some(k => text.includes(k))) {
    return 'high';
  }
  return 'low';
}

// 1. Get all threads for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const threads = await Thread.find({ userId: req.user.userId }).sort({ updatedAt: -1 });
    
    const threadsWithRuns = [];
    for (const thread of threads) {
      const latestRun = await Run.findOne({ threadId: thread._id })
        .sort({ createdAt: -1 })
        .select('overallScore status versionLabel');

      threadsWithRuns.push({
        ...thread.toObject(),
        latestRun: latestRun ? {
          overallScore: latestRun.overallScore,
          status: latestRun.status,
          versionLabel: latestRun.versionLabel,
          runId: latestRun._id
        } : null
      });
    }
    
    res.json(threadsWithRuns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Create Thread initialization skeleton
router.post('/', authMiddleware, async (req, res) => {
  const { systemPrompt } = req.body;
  if (!systemPrompt) {
    return res.status(400).json({ error: 'System prompt is required' });
  }

  try {
    const hash = crypto.createHash('sha256').update(systemPrompt.trim()).digest('hex');
    
    const thread = new Thread({
      userId: req.user.userId,
      agentName: 'Pending Analysis...',
      systemPromptHash: hash,
      latestSystemPrompt: systemPrompt,
      taskDomain: 'general',
      tools: []
    });

    await thread.save();
    res.status(201).json(thread);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Analyze system prompt using Claude or dynamic rule fallback
router.post('/:id/analyze', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const thread = await Thread.findOne({ _id: id, userId: req.user.userId });
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    const promptText = thread.latestSystemPrompt;
    const api_key = process.env.ANTHROPIC_API_KEY;

    let agentName = "Operations Bot";
    let taskDomain = "general";
    let tools = [];

    if (!api_key || api_key.startsWith('your_')) {
      // Dynamic fallback based on prompt content
      const lowerPrompt = promptText.toLowerCase();
      if (lowerPrompt.includes('code') || lowerPrompt.includes('refactor') || lowerPrompt.includes('programming')) {
        agentName = "CodeAssist Agent";
        taskDomain = "coding";
        tools = [
          { name: "read_file", description: "Reads developer file contents", parameters: { type: "object", properties: { path: { type: "string" } } }, riskLevel: "low" },
          { name: "write_file", description: "Writes file outputs", parameters: { type: "object", properties: { path: { type: "string" }, content: { type: "string" } } }, riskLevel: "medium" },
          { name: "delete_file", description: "Removes cache and files permanently", parameters: { type: "object", properties: { path: { type: "string" } } }, riskLevel: "high" }
        ];
      } else if (lowerPrompt.includes('refund') || lowerPrompt.includes('support') || lowerPrompt.includes('customer') || lowerPrompt.includes('order')) {
        agentName = "Support Bot";
        taskDomain = "customer-support";
        tools = [
          { name: "lookup_order", description: "Fetches user order profiles", parameters: { type: "object", properties: { orderId: { type: "string" } } }, riskLevel: "low" },
          { name: "issue_refund", description: "Purges transactions and processes money refunds", parameters: { type: "object", properties: { orderId: { type: "string" }, amount: { type: "number" } } }, riskLevel: "high" },
          { name: "cancel_subscription", description: "Cancels membership plans", parameters: { type: "object", properties: { userId: { type: "string" } } }, riskLevel: "high" },
          { name: "send_email", description: "Sends order verification updates", parameters: { type: "object", properties: { to: { type: "string" }, body: { type: "string" } } }, riskLevel: "low" }
        ];
      } else if (lowerPrompt.includes('payment') || lowerPrompt.includes('finance') || lowerPrompt.includes('invoice') || lowerPrompt.includes('wire')) {
        agentName = "Finance Ledger Bot";
        taskDomain = "finance";
        tools = [
          { name: "query_balance", description: "Returns account balance statistics", parameters: { type: "object" }, riskLevel: "low" },
          { name: "wire_transfer", description: "Sends wire payment transfers to recipient routing", parameters: { type: "object", properties: { routing: { type: "string" }, amount: { type: "number" } } }, riskLevel: "high" }
        ];
      } else {
        // General fallback
        agentName = "General Assistant";
        taskDomain = "general";
        tools = [
          { name: "read_notes", description: "Reads log database", parameters: { type: "object" }, riskLevel: "low" },
          { name: "delete_record", description: "Removes records permanently", parameters: { type: "object", properties: { recordId: { type: "string" } } }, riskLevel: "high" }
        ];
      }
    } else {
      // Call real Claude model
      const anthropic = new Anthropic({ apiKey: api_key });
      const prompt = `
      Analyze this system prompt: "${promptText}".
      Suggest a short descriptive agentName, taskDomain ("customer-support" | "coding" | "finance" | "general"), and a structured tools array [{ name, description, parameters, riskLevel }].
      
      Important: Auto-flag riskLevel as "high" if the tool name or description matches destructive patterns (delete, refund, send, transfer, cancel, remove, wire, pay).
      
      Respond ONLY with a valid JSON block of this structure:
      {
        "agentName": "string",
        "taskDomain": "customer-support" | "coding" | "finance" | "general",
        "tools": [
          {
            "name": "string",
            "description": "string",
            "parameters": {
              "type": "object",
              "properties": {}
            },
            "riskLevel": "low" | "medium" | "high"
          }
        ]
      }
      `;

      try {
        const response = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1500,
          messages: [{ role: 'user', content: prompt }]
        });

        const parsed = JSON.parse(response.content[0].text);
        agentName = parsed.agentName || agentName;
        taskDomain = parsed.taskDomain || taskDomain;
        tools = parsed.tools || [];
      } catch (err) {
        console.error('[PromptAnalyzer] Failed to call LLM or parse JSON, falling back:', err.message);
      }
    }

    // Apply client-side safety overrides on risk levels
    tools = tools.map(t => ({
      ...t,
      riskLevel: getRiskLevel(t.name, t.description)
    }));

    res.json({ agentName, taskDomain, tools });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Confirm Setup & Spawn Run in generating status
router.post('/:id/confirm', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { agentName, taskDomain, tools, versionLabel } = req.body;

  try {
    const thread = await Thread.findOne({ _id: id, userId: req.user.userId });
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    thread.agentName = agentName;
    thread.taskDomain = taskDomain;
    thread.tools = tools;
    await thread.save();

    // Auto calculate version increment if default
    let finalLabel = versionLabel;
    if (!finalLabel) {
      const runCount = await Run.countDocuments({ threadId: thread._id });
      finalLabel = `Run ${runCount + 1}`;
    }

    // Create run
    const run = new Run({
      threadId: thread._id,
      versionLabel: finalLabel,
      status: 'pending',
      overallScore: 100
    });
    await run.save();

    res.status(201).json({ thread, run });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
