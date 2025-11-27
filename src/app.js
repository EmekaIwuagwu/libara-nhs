const express = require('express');
const session = require('express-session');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const flash = require('connect-flash');
require('dotenv').config();

// Import configurations
const sessionConfig = require('./config/session');
require('./config/database'); // Initialize database connection

// Import middleware
const { setUserLocals } = require('./middleware/auth');

// Import routes
const publicRoutes = require('./routes/public');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const resumeRoutes = require('./routes/resume');
const configRoutes = require('./routes/config');
const settingsRoutes = require('./routes/settings');
const automationRoutes = require('./routes/automation');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy (required for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      upgradeInsecureRequests: [], // Auto-upgrade HTTP to HTTPS
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
}));

// Compression
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs (increased for development)
  message: 'Too many authentication attempts, please try again later.'
});

app.use('/api/', limiter);
// Only apply rate limiter to POST requests (actual login/register attempts)
// Not to GET requests (viewing the login/register page)

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session(sessionConfig));

// Flash messages
app.use(flash());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Set user locals middleware (makes user available in all views)
app.use(setUserLocals);

// Make flash messages available in all views
app.use((req, res, next) => {
  res.locals.successMessage = req.session.successMessage || null;
  res.locals.errorMessage = req.session.errorMessage || null;
  res.locals.errors = req.session.errors || [];
  res.locals.oldInput = req.session.oldInput || {};
  next();
});

// Routes
app.use('/', publicRoutes);
app.use('/', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/dashboard/resume', resumeRoutes);
app.use('/dashboard/config', configRoutes);
app.use('/dashboard/settings', settingsRoutes);
app.use('/dashboard/automation', automationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('errors/404', {
    title: '404 - Page Not Found',
    page: 'error'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500).render('errors/500', {
    title: 'Error - LibaraNHS',
    page: 'error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('==========================================');
  console.log(`  LibaraNHS Server`);
  console.log('==========================================');
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Port: ${PORT}`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log('==========================================');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
