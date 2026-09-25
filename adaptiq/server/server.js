require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, getDbStatus } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Route Imports
const aiRoutes = require('./routes/aiRoutes');
const studentRoutes = require('./routes/studentRoutes');
const sessionRoutes = require('./routes/sessionRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend Vite dev server (5173) and any local origins
app.use(cors({
  origin: true,
  credentials: true
}));

// Body Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger (Development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    project: 'AdaptIQ - Cognitive Pedagogy Engine',
    databaseConnected: getDbStatus(),
    timestamp: new Date().toISOString()
  });
});

// Mount Core Application Routes
app.use('/api/tutor', aiRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/sessions', sessionRoutes);

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'AdaptIQ AI Tutoring Engine',
    version: '1.0.0',
    documentation: 'https://github.com/hariprasanth-vip/kalasala',
    endpoints: {
      health: '/api/health',
      tutor: '/api/tutor/respond',
      curriculum: '/api/student/curriculum',
      studentDna: '/api/student/65f000000000000000000001/dna',
      session: '/api/sessions/session-demo-001'
    }
  });
});

// Central Error Handling Middleware
app.use(errorHandler);

// Initialize Database & Start Server
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`
🚀 ===================================================
   AdaptIQ Pedagogical Engine is actively running!
   📡 Local URL:    http://localhost:${PORT}
   🩺 Health:       http://localhost:${PORT}/api/health
   🧬 Teaching DNA: http://localhost:${PORT}/api/student/65f000000000000000000001/dna
   🌱 Seed Demo:    npm run seed
===================================================
    `);
  });
};

startServer();

module.exports = app;
