const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// ─── Load environment variables ──────────────────────────────
dotenv.config();

// ─── Connect to Database ─────────────────────────────────────
connectDB();

// ─── Initialize Express App ──────────────────────────────────
const app = express();

// ─── Global Middlewares ──────────────────────────────────────
app.use(helmet()); // Security headers
app.use(cors()); // Cross-Origin Resource Sharing
app.use(morgan('dev')); // HTTP request logging
app.use(express.json({ limit: '10mb' })); // JSON body parser
app.use(express.urlencoded({ extended: true })); // URL-encoded parser

// ─── Health Check Route ──────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TMS API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── API Routes (will be added as we build modules) ──────────
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/batches', require('./routes/batch.routes'));
// app.use('/api/students', require('./routes/student.routes'));
// app.use('/api/trainers', require('./routes/trainer.routes'));
// app.use('/api/labs', require('./routes/lab.routes'));
// app.use('/api/attendance', require('./routes/attendance.routes'));
// app.use('/api/exams', require('./routes/exam.routes'));
// app.use('/api/results', require('./routes/result.routes'));
// app.use('/api/certificates', require('./routes/certificate.routes'));
// app.use('/api/holidays', require('./routes/holiday.routes'));

// ─── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ─── Start Server ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 TMS Server running on port ${PORT} [${process.env.NODE_ENV}]`);
});

module.exports = app;
