const mongoose = require('mongoose');

const TraceStepSchema = new mongoose.Schema({
  stepNumber: { type: Number, required: true },
  type: {
    type: String,
    enum: ['user_message', 'agent_reasoning', 'tool_call', 'tool_result', 'agent_final_response'],
    required: true
  },
  content: { type: String, default: '' },
  toolName: { type: String },
  toolInput: { type: Object },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const TraceSchema = new mongoose.Schema({
  scenarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scenario',
    required: true,
    index: true
  },
  runId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Run',
    required: true,
    index: true
  },
  steps: [TraceStepSchema],
  outcome: {
    type: String,
    enum: ['pass', 'fail'],
    index: true
  },
  failureMode: {
    type: String,
    enum: ['tool_loop', 'unsafe_destructive_action', 'goal_drift', 'hallucinated_confidence', 'incomplete_task', 'none'],
    index: true
  },
  failureEvidence: {
    type: String,
    default: ''
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low',
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Trace', TraceSchema);
