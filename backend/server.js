const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Security Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: 'Too many requests, please try again later.' }
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many login attempts, please try again later.' }
});

// Apply rate limiters
app.use('/api/v1/auth', authLimiter);
app.use('/api/', generalLimiter);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes - Existing
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/ngos', require('./routes/ngos'));
app.use('/api/v1/donations', require('./routes/donations'));
app.use('/api/v1/wishes', require('./routes/wishes'));
app.use('/api/v1/emergency-funds', require('./routes/emergencyFunds'));
app.use('/api/v1/adopt-a-day', require('./routes/adoptADay'));
app.use('/api/v1/gratitude', require('./routes/gratitude'));
app.use('/api/v1/impact-stories', require('./routes/impactStories'));
app.use('/api/v1/discussions', require('./routes/discussions'));
app.use('/api/v1/analytics', require('./routes/analytics'));
app.use('/api/v1/system-maintenance', require('./routes/systemMaintenance'));
app.use('/api/v1/payments', require('./routes/payments'));

// Routes -- HeartBridge Enterprise Modules
app.use('/api/v1/beneficiaries', require('./routes/beneficiaries'));
app.use('/api/v1/volunteers', require('./routes/volunteers'));
app.use('/api/v1/inventory', require('./routes/inventory'));
app.use('/api/v1/corporate', require('./routes/corporate'));
app.use('/api/v1/emergency-incidents', require('./routes/emergencyIncidents'));
app.use('/api/v1/ai', require('./routes/ai'));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to HeartBridge API',
    version: 'v1.0',
    health: '/api/v1/health',
    documentation: 'API endpoints available at /api/v1/*'
  });
});

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'OK', message: 'HeartBridge API is running', timestamp: new Date().toISOString() });
});

// Error handler middleware (must be after all routes)
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/heartbridge', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ MongoDB Connected');
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`🚀 HeartBridge Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;
