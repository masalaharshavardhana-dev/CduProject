require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'CampusConnect API is running smoothly' });
});

// Setup routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/student', require('./routes/student.routes'));
app.use('/api/recruiter', require('./routes/recruiter.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

module.exports = app;
