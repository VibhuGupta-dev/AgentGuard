const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const { initQueue } = require('./services/queue');
const { setSocketIo } = require('./services/sandboxExecutor');

// Import routes
const authRoutes = require('./routes/auth');
const threadRoutes = require('./routes/threads');
const runRoutes = require('./routes/runs');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// CORS configuration supporting cookies and headers credentials
const allowedOrigins = [CLIENT_URL, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(cookieParser());

// REST Route registers
app.use('/api/auth', authRoutes);
app.use('/api/threads', threadRoutes);
app.use('/api/runs', runRoutes);
app.use('/api/arena', require('./routes/arena'));

// Health Check
app.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy';
  const { isUsingRedis } = require('./services/queue');
  
  res.json({
    status: 'healthy',
    database: dbStatus,
    queueMode: isUsingRedis() ? 'Redis/BullMQ' : 'In-Memory Async Fallback',
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]:', err.message, err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Connect to Database & Launch Server
connectDB().then(async () => {
  // Initialize Background queues (BullMQ or fallback)
  await initQueue();

  // Socket.IO setup
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('[Socket.IO] Client connected:', socket.id);
    
    socket.on('join-run', (runId) => {
      socket.join(`run:${runId}`);
      console.log(`[Socket.IO] Client ${socket.id} joined room: run:${runId}`);
    });

    socket.on('leave-run', (runId) => {
      socket.leave(`run:${runId}`);
      console.log(`[Socket.IO] Client ${socket.id} left room: run:${runId}`);
    });

    socket.on('disconnect', () => {
      console.log('[Socket.IO] Client disconnected:', socket.id);
    });
  });

  // Share socket handle with SandboxExecutor
  setSocketIo(io);

  server.listen(PORT, () => {
    console.log(`[Express Gateway Server] Active on port ${PORT}`);
  });
}).catch(err => {
  console.error('[Server Start Failed]:', err);
});
