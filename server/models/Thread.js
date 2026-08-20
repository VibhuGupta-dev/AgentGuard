const mongoose = require('mongoose');

const ToolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  parameters: { type: Object, default: {} },
  riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' }
});

const ThreadSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  agentName: {
    type: String,
    required: true,
    trim: true
  },
  systemPromptHash: {
    type: String,
    required: true,
    index: true
  },
  latestSystemPrompt: {
    type: String,
    required: true
  },
  taskDomain: {
    type: String,
    enum: ['customer-support', 'coding', 'finance', 'general'],
    default: 'general',
    index: true
  },
  tools: [ToolSchema]
}, { timestamps: true });

module.exports = mongoose.model('Thread', ThreadSchema);
