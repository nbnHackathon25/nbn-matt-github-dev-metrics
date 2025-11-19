require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const MetricsController = require('./controllers/MetricsController');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiter configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(limiter);
app.use(express.static('public'));

// Validate environment variables
if (!process.env.GITHUB_TOKEN) {
  console.error('Error: GITHUB_TOKEN is not set in environment variables');
  console.log('Please create a .env file with your GitHub token');
  process.exit(1);
}

if (!process.env.GITHUB_OWNER || !process.env.GITHUB_REPO) {
  console.error('Error: GITHUB_OWNER and GITHUB_REPO must be set in environment variables');
  console.log('Please set these in your .env file');
  process.exit(1);
}

// Initialize controller
const metricsController = new MetricsController(
  process.env.GITHUB_TOKEN,
  process.env.GITHUB_OWNER,
  process.env.GITHUB_REPO
);

// API Routes
app.get('/api/metrics/commits', (req, res) =>
  metricsController.getCommitsPerUser(req, res)
);
app.get('/api/metrics/prs', (req, res) =>
  metricsController.getPRMetrics(req, res)
);
app.get('/api/metrics/issues', (req, res) =>
  metricsController.getIssueMetrics(req, res)
);
app.get('/api/metrics/contributions', (req, res) =>
  metricsController.getContributionTrends(req, res)
);
app.get('/api/metrics/activity', (req, res) =>
  metricsController.getActivityHeatmap(req, res)
);
app.get('/api/metrics/all', (req, res) =>
  metricsController.getAllMetrics(req, res)
);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`GitHub Metrics Dashboard running on port ${PORT}`);
  console.log(`Monitoring: ${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}`);
  console.log(`Dashboard: http://localhost:${PORT}`);
});

module.exports = { app, server };
