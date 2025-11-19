# GitHub Metrics Dashboard

Single-pane dashboard for tracking GitHub repository usage and developer effectiveness metrics.

## Version History

### Version 1.0.0 (2025-11-19)
- Initial release with comprehensive metrics dashboard
- Implemented 5 core metrics:
  1. Number of commits per user
  2. PR merge rate and cycle time
  3. Issue triage and resolution speed
  4. Developer contribution trends
  5. Repository activity heatmaps
- Added comprehensive test suite with Jest
- Web-based dashboard with real-time metrics
- RESTful API for programmatic access

## Features

### Dashboard Metrics

1. **Commits per User** - Track individual developer contributions with commit counts
2. **PR Metrics** - Monitor merge rates, cycle times, and pull request status
3. **Issue Metrics** - Analyze triage time and resolution speed for issues
4. **Contribution Trends** - View top contributors and their activity levels
5. **Activity Heatmap** - Visualize repository activity by day, hour, and day of week

### Technical Features

- Real-time data from GitHub API via Octokit
- Configurable time periods (7, 30, or 90 days)
- RESTful API endpoints for all metrics
- Responsive single-pane dashboard
- Comprehensive test suite with >90% coverage
- Environment-based configuration
- Rate limiting protection (100 requests per 15 minutes per IP)

## Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher
- GitHub Personal Access Token with repo access

## Installation

1. Clone the repository:
```bash
git clone https://github.com/nbnHackathon25/nbn-matt-github-dev-metrics.git
cd nbn-matt-github-dev-metrics
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` file with your settings:
```env
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_OWNER=your-organization-or-username
GITHUB_REPO=your-repository-name
PORT=3000
```

### Getting a GitHub Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo` (Full control of private repositories)
4. Generate and copy the token to your `.env` file

## Usage

### Start the Dashboard

```bash
npm start
```

The dashboard will be available at http://localhost:3000

### API Endpoints

All endpoints accept an optional `days` query parameter (default: 30)

- `GET /api/metrics/commits?days=30` - Commits per user
- `GET /api/metrics/prs?days=30` - Pull request metrics
- `GET /api/metrics/issues?days=30` - Issue metrics
- `GET /api/metrics/contributions?days=30` - Contribution trends
- `GET /api/metrics/activity?days=30` - Activity heatmap
- `GET /api/metrics/all?days=30` - All metrics in one call
- `GET /api/health` - Health check endpoint

### Example API Response

```bash
curl http://localhost:3000/api/metrics/all?days=30
```

```json
{
  "commits": {
    "total": 150,
    "byUser": {
      "developer1": 75,
      "developer2": 50,
      "developer3": 25
    },
    "period": "30 days"
  },
  "prMetrics": {
    "total": 45,
    "merged": 40,
    "open": 3,
    "closed": 2,
    "mergeRate": "88.89%",
    "avgCycleTimeHours": "24.50",
    "avgCycleTimeDays": "1.02"
  },
  ...
}
```

## Testing

The project includes a comprehensive, reusable test suite that validates all metrics functionality.

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Verbose Output

```bash
npm run test:verbose
```

### Test Coverage

The test suite covers:
- ✅ All 5 metric calculations
- ✅ API endpoint responses
- ✅ Error handling
- ✅ Edge cases (empty data, malformed responses)
- ✅ Time period configurations
- ✅ Data aggregation logic

Current coverage: >90% across all modules

### Test Structure

```
tests/
├── GitHubMetricsService.test.js  # Core metrics logic tests
└── MetricsController.test.js      # API controller tests
```

### Running Tests in CI/CD

The test suite is designed to be run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Install dependencies
  run: npm install
- name: Run tests
  run: npm test
```

## Project Structure

```
nbn-matt-github-dev-metrics/
├── src/
│   ├── controllers/
│   │   └── MetricsController.js      # API request handlers
│   ├── services/
│   │   └── GitHubMetricsService.js   # GitHub API integration
│   └── server.js                      # Express server setup
├── public/
│   └── index.html                     # Dashboard UI
├── tests/
│   ├── GitHubMetricsService.test.js  # Service tests
│   └── MetricsController.test.js      # Controller tests
├── .env.example                       # Environment template
├── .gitignore                         # Git ignore rules
├── jest.config.js                     # Test configuration
├── package.json                       # Project dependencies
└── README.md                          # This file
```

## Development

### Adding New Metrics

1. Add method to `src/services/GitHubMetricsService.js`
2. Add controller method to `src/controllers/MetricsController.js`
3. Add route in `src/server.js`
4. Add tests to `tests/GitHubMetricsService.test.js`
5. Update dashboard UI in `public/index.html`
6. Update README with new metric details
7. Increment version number in README and package.json

### Code Style

- Use async/await for asynchronous operations
- Include error handling for all API calls
- Add JSDoc comments for public methods
- Follow existing naming conventions

## Troubleshooting

### Common Issues

**Error: GITHUB_TOKEN is not set**
- Make sure you've created a `.env` file with your GitHub token

**Error: 401 Unauthorized**
- Verify your GitHub token has the correct permissions
- Check if the token has expired

**Error: 404 Not Found**
- Verify the GITHUB_OWNER and GITHUB_REPO are correct
- Ensure your token has access to the repository

**Tests failing**
- Run `npm install` to ensure all dependencies are installed
- Check that Jest is properly configured

### GitHub API Rate Limits

- Authenticated requests: 5,000 per hour
- The dashboard caches data on page load
- Use the refresh button to manually update metrics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add/update tests
5. Ensure all tests pass: `npm test`
6. Update README if needed
7. Submit a pull request

## License

ISC

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Check existing issues for solutions

## Changelog

### Future Enhancements (Planned)
- Data export functionality (CSV, JSON)
- Historical trend graphs
- Team comparison views
- Custom metric configurations
- Webhook support for real-time updates
- Multi-repository support

