const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Basic middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'PCC Portal API is running',
    timestamp: new Date().toISOString()
  });
});

// Basic auth endpoint for testing
app.post('/api/auth/login', (req, res) => {
  console.log('Login attempt:', req.body);
  res.json({
    success: false,
    message: 'Database not configured - this is a test response',
    data: null
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});
