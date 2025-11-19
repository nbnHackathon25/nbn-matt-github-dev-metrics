# GitHub Copilot Instructions

## Project Overview

This is a GitHub Metrics Dashboard application that provides a single-pane view for tracking repository usage and developer effectiveness metrics. The application collects and visualizes key development metrics including commits, pull requests, issues, contributions, and activity patterns.

## Technology Stack

- **Runtime**: Node.js 14.x or higher
- **Framework**: Express 5.x
- **API Client**: @octokit/rest for GitHub API integration
- **Testing**: Jest with >90% code coverage target
- **Additional Libraries**: 
  - dotenv for environment configuration
  - cors for cross-origin resource sharing
  - express-rate-limit for API protection

## Project Structure

```
src/
├── controllers/
│   └── MetricsController.js    # API request handlers
├── services/
│   └── GitHubMetricsService.js # GitHub API integration and metrics calculation
└── server.js                   # Express server setup and routes

tests/
├── GitHubMetricsService.test.js # Service layer tests
└── MetricsController.test.js    # Controller/API tests

public/
└── index.html                   # Dashboard UI
```

## Coding Standards

### JavaScript Style

- Use CommonJS module system (`require`/`module.exports`)
- Use `const` and `let` (no `var`)
- Use async/await for asynchronous operations (no raw promises or callbacks)
- Include comprehensive error handling for all API calls
- Add JSDoc comments for public methods and complex logic

### Naming Conventions

- Classes: PascalCase (e.g., `MetricsController`, `GitHubMetricsService`)
- Functions/Methods: camelCase (e.g., `getCommitsPerUser`, `getPRMetrics`)
- Constants: UPPER_SNAKE_CASE for environment variables (e.g., `GITHUB_TOKEN`)
- Private methods: prefix with underscore (e.g., `_calculateCycleTime`)

### Error Handling

- Always wrap API calls in try/catch blocks
- Log errors with descriptive messages using `console.error`
- Return meaningful error responses with appropriate HTTP status codes
- Validate environment variables on startup

### API Design

- All metric endpoints accept optional `days` query parameter (default: 30)
- Return consistent JSON response structures
- Include metadata (total counts, time periods) in responses
- Use rate limiting (100 requests per 15 minutes per IP)

## Testing Requirements

### Test Coverage

- Maintain >90% code coverage across all modules
- Test both success and error cases
- Include edge cases (empty data, malformed responses, null values)
- Mock external API calls to avoid rate limits

### Test Structure

- Use Jest's describe/it syntax for test organization
- Group tests by feature/metric
- Use descriptive test names that explain the scenario
- Clean up resources after each test

### Running Tests

```bash
npm test              # Run all tests with coverage
npm run test:watch    # Watch mode for development
npm run test:verbose  # Detailed output
```

## Development Workflow

### Adding New Metrics

1. Add method to `src/services/GitHubMetricsService.js`
2. Add controller method to `src/controllers/MetricsController.js`
3. Add route in `src/server.js`
4. Add comprehensive tests to `tests/GitHubMetricsService.test.js`
5. Update dashboard UI in `public/index.html`
6. Update README with new metric details
7. Increment version number in package.json

### Environment Configuration

Required environment variables (see `.env.example`):
- `GITHUB_TOKEN`: Personal access token with `repo` scope
- `GITHUB_OWNER`: Organization or username
- `GITHUB_REPO`: Repository name
- `PORT`: Server port (default: 3000)

### API Endpoints

- `GET /api/metrics/commits?days=30` - Commits per user
- `GET /api/metrics/prs?days=30` - Pull request metrics
- `GET /api/metrics/issues?days=30` - Issue metrics
- `GET /api/metrics/contributions?days=30` - Contribution trends
- `GET /api/metrics/activity?days=30` - Activity heatmap
- `GET /api/metrics/all?days=30` - All metrics combined
- `GET /api/health` - Health check

## Architecture Notes

### Service Layer (GitHubMetricsService)

- Handles all GitHub API interactions
- Calculates metrics from raw API data
- Implements caching to respect rate limits
- Each metric method is independent and reusable

### Controller Layer (MetricsController)

- Validates request parameters
- Handles HTTP request/response lifecycle
- Delegates business logic to service layer
- Returns consistent JSON responses

### Data Flow

1. Client requests metric via API endpoint
2. Controller validates request and extracts parameters
3. Service fetches data from GitHub API via Octokit
4. Service processes and aggregates data
5. Controller returns formatted JSON response

## Important Considerations

### GitHub API Rate Limits

- Authenticated: 5,000 requests per hour
- Include appropriate error handling for rate limit errors
- Consider implementing caching for frequently accessed data

### Security

- Never commit `.env` files or tokens
- Validate all user inputs
- Use rate limiting to prevent abuse
- Sanitize error messages (don't expose internal details)

### Performance

- Minimize API calls by batching requests when possible
- Use efficient data structures for aggregation
- Consider pagination for large result sets

## Common Tasks

### Debugging

- Check server logs for API errors
- Verify environment variables are set correctly
- Test API endpoints with curl or Postman
- Use Jest's `--verbose` flag for detailed test output

### Troubleshooting

- **401 Unauthorized**: Check token permissions and expiration
- **404 Not Found**: Verify GITHUB_OWNER and GITHUB_REPO
- **Rate limit exceeded**: Wait for rate limit reset or implement caching

## Version Control

- Keep commits atomic and focused
- Write descriptive commit messages
- Update version numbers following semantic versioning
- Document all changes in README changelog

## Code Quality

- Run tests before committing (`npm test`)
- Ensure new code maintains >90% coverage
- Follow existing code patterns and conventions
- Keep functions small and focused (single responsibility)
