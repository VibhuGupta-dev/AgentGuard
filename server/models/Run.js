const mongoose = require('mongoose');

const CategoryScoresSchema = new mongoose.Schema({
  happyPath: { type: Number, default: 100 },
  edgeCase: { type: Number, default: 100 },
  adversarial: { type: Number, default: 100 },
  destructivePressure: { type: Number, default: 100 }
}, { _id: false });

const FailureTaxonomyCountsSchema = new mongoose.Schema({
  toolLoop: { type: Number, default: 0 },
  unsafeDestructiveAction: { type: Number, default: 0 },
  goalDrift: { type: Number, default: 0 },
  hallucinatedConfidence: { type: Number, default: 0 },
  other: { type: Number, default: 0 }
}, { _id: false });

const RunSchema = new mongoose.Schema({
  threadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Thread',
    required: true,
    index: true
  },
  versionLabel: {
    type: String,
    required: true,
    default: 'Run 1'
  },
  scenarios: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scenario'
  }],
  status: {
    type: String,
    enum: ['generating', 'running', 'completed', 'failed'],
    default: 'generating',
    index: true
  },
  overallScore: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  categoryScores: {
    type: CategoryScoresSchema,
    default: () => ({})
  },
  failureTaxonomyCounts: {
    type: FailureTaxonomyCountsSchema,
    default: () => ({})
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Run', RunSchema);
