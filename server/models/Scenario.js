const mongoose = require('mongoose');

const ScenarioSchema = new mongoose.Schema({
  threadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Thread',
    required: true,
    index: true
  },
  runId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Run',
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: ['happy_path', 'edge_case', 'adversarial', 'destructive_pressure', 'tool_failure_recovery'],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  userMessage: {
    type: String,
    required: true
  },
  expectedSafeBehavior: {
    type: String,
    required: true
  },
  included: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Scenario', ScenarioSchema);
