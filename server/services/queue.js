const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const mongoose = require('mongoose');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Queues placeholders
let scenarioQueue = null;
let runQueue = null;
let useRedis = false;

// Custom simulated in-memory background worker queue
class InMemoryQueue {
  constructor(name, processor) {
    this.name = name;
    this.processor = processor;
    console.log(`[InMemoryQueue] Initialized fallback queue for: ${name}`);
  }

  async add(jobName, data) {
    console.log(`[InMemoryQueue] Enqueued job '${jobName}' on '${this.name}'`);
    // Run asynchronously in the next tick to simulate background execution
    setImmediate(async () => {
      try {
        const job = { id: `mock-job-${Date.now()}`, data };
        await this.processor(job);
      } catch (err) {
        console.error(`[InMemoryQueue] Job processing error in '${this.name}':`, err);
      }
    });
    return { id: `mock-job-${Date.now()}` };
  }
}

// In-memory processor registry
const processors = {};

async function initQueue() {
  return new Promise((resolve) => {
    const redisClient = new IORedis(REDIS_URL, {
      maxRetriesPerRequest: null,
      connectTimeout: 2000, // Quick timeout
    });

    redisClient.on('connect', () => {
      console.log('[Queue] Connected to Redis successfully. Scaling with BullMQ.');
      useRedis = true;
      
      scenarioQueue = new Queue('scenarios', { connection: redisClient });
      runQueue = new Queue('runs', { connection: redisClient });

      // Workers
      new Worker('scenarios', processors['scenarios'], { connection: redisClient });
      new Worker('runs', processors['runs'], { connection: redisClient });

      resolve(true);
    });

    redisClient.on('error', (err) => {
      console.warn(`[Queue] Redis connection failed: ${err.message}. Falling back to in-memory async tasks.`);
      redisClient.disconnect();
      
      // Fall back
      scenarioQueue = new InMemoryQueue('scenarios', processors['scenarios']);
      runQueue = new InMemoryQueue('runs', processors['runs']);

      resolve(false);
    });
  });
}

// Define processors
processors['scenarios'] = async (job) => {
  const { runId, runRedId, runBlueId, taskDomain } = job.data;
  const runController = require('../controllers/runController');

  if (job.name === 'generate-duel' || job.data.type === 'generate-duel') {
    console.log(`[Queue] Generating DUEL scenarios for Runs: ${runRedId} vs ${runBlueId}`);
    await runController.processDuelScenarioGeneration(runRedId, runBlueId, taskDomain);
  } else {
    console.log(`[Queue] Generating scenarios for Run: ${runId}`);
    await runController.processScenarioGeneration(runId);
  }
};

processors['runs'] = async (job) => {
  const { runId } = job.data;
  console.log(`[Queue] Executing Sandbox Run: ${runId}`);
  const runController = require('../controllers/runController');
  await runController.processRunExecution(runId);
};

// Export interfaces
module.exports = {
  initQueue,
  getScenarioQueue: () => scenarioQueue,
  getRunQueue: () => runQueue,
  isUsingRedis: () => useRedis
};
