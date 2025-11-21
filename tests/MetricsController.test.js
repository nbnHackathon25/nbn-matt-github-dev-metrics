const request = require('supertest');
const express = require('express');

// Mock the GitHubMetricsService before requiring the controller
jest.mock('../src/services/GitHubMetricsService', () => {
  return jest.fn().mockImplementation(() => ({
    getCommitsPerUser: jest.fn(),
    getPRMetrics: jest.fn(),
    getIssueMetrics: jest.fn(),
    getContributionTrends: jest.fn(),
    getActivityHeatmap: jest.fn(),
    getAllMetrics: jest.fn(),
  }));
});

const MetricsController = require('../src/controllers/MetricsController');
const GitHubMetricsService = require('../src/services/GitHubMetricsService');

describe('MetricsController API Tests', () => {
  let app;
  let controller;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create Express app for testing
    app = express();
    app.use(express.json());

    // Create controller (which will use the mocked service)
    controller = new MetricsController('fake-token', 'test-owner', 'test-repo');
    
    // Set up routes with the controller
    app.get('/api/metrics/commits', (req, res) =>
      controller.getCommitsPerUser(req, res)
    );
    app.get('/api/metrics/prs', (req, res) =>
      controller.getPRMetrics(req, res)
    );
    app.get('/api/metrics/issues', (req, res) =>
      controller.getIssueMetrics(req, res)
    );
    app.get('/api/metrics/contributions', (req, res) =>
      controller.getContributionTrends(req, res)
    );
    app.get('/api/metrics/activity', (req, res) =>
      controller.getActivityHeatmap(req, res)
    );
    app.get('/api/metrics/all', (req, res) =>
      controller.getAllMetrics(req, res)
    );
  });

  describe('GET /api/metrics/commits', () => {
    test('should return commits per user data', async () => {
      const mockData = {
        total: 10,
        byUser: { user1: 5, user2: 5 },
        period: '30 days',
      };

      controller.metricsService.getCommitsPerUser.mockResolvedValue(mockData);

      const response = await request(app).get('/api/metrics/commits');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
      expect(controller.metricsService.getCommitsPerUser).toHaveBeenCalledWith(30);
    });

    test('should accept days query parameter', async () => {
      const mockData = {
        total: 5,
        byUser: { user1: 5 },
        period: '7 days',
      };

      controller.metricsService.getCommitsPerUser.mockResolvedValue(mockData);

      const response = await request(app).get('/api/metrics/commits?days=7');

      expect(response.status).toBe(200);
      expect(controller.metricsService.getCommitsPerUser).toHaveBeenCalledWith(7);
    });

    test('should handle errors', async () => {
      controller.metricsService.getCommitsPerUser.mockRejectedValue(
        new Error('API error')
      );

      const response = await request(app).get('/api/metrics/commits');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'API error');
    });
  });

  describe('GET /api/metrics/prs', () => {
    test('should return PR metrics', async () => {
      const mockData = {
        total: 20,
        merged: 15,
        open: 3,
        closed: 2,
        mergeRate: '75.00%',
        avgCycleTimeHours: '48.00',
        avgCycleTimeDays: '2.00',
        period: '30 days',
      };

      controller.metricsService.getPRMetrics.mockResolvedValue(mockData);

      const response = await request(app).get('/api/metrics/prs');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
    });

    test('should handle errors', async () => {
      controller.metricsService.getPRMetrics.mockRejectedValue(
        new Error('API error')
      );

      const response = await request(app).get('/api/metrics/prs');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'API error');
    });
  });

  describe('GET /api/metrics/issues', () => {
    test('should return issue metrics', async () => {
      const mockData = {
        total: 15,
        open: 5,
        closed: 10,
        avgTriageTimeHours: '4.50',
        avgResolutionTimeHours: '72.00',
        avgResolutionTimeDays: '3.00',
        period: '30 days',
      };

      controller.metricsService.getIssueMetrics.mockResolvedValue(mockData);

      const response = await request(app).get('/api/metrics/issues');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
    });

    test('should handle errors', async () => {
      controller.metricsService.getIssueMetrics.mockRejectedValue(
        new Error('API error')
      );

      const response = await request(app).get('/api/metrics/issues');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'API error');
    });
  });

  describe('GET /api/metrics/contributions', () => {
    test('should return contribution trends', async () => {
      const mockData = {
        contributors: [
          { user: 'user1', commits: 10, prsCreated: 5, totalActivity: 15 },
          { user: 'user2', commits: 8, prsCreated: 3, totalActivity: 11 },
        ],
        totalContributors: 2,
        period: '30 days',
      };

      controller.metricsService.getContributionTrends.mockResolvedValue(mockData);

      const response = await request(app).get('/api/metrics/contributions');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
    });

    test('should handle errors', async () => {
      controller.metricsService.getContributionTrends.mockRejectedValue(
        new Error('API error')
      );

      const response = await request(app).get('/api/metrics/contributions');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'API error');
    });
  });

  describe('GET /api/metrics/activity', () => {
    test('should return activity heatmap data', async () => {
      const mockData = {
        activityByDay: { '2024-01-15': 5, '2024-01-16': 3 },
        activityByHour: { '10': 4, '14': 4 },
        activityByDayOfWeek: {
          Sunday: 0,
          Monday: 3,
          Tuesday: 5,
          Wednesday: 0,
          Thursday: 0,
          Friday: 0,
          Saturday: 0,
        },
        totalCommits: 8,
        period: '30 days',
      };

      controller.metricsService.getActivityHeatmap.mockResolvedValue(mockData);

      const response = await request(app).get('/api/metrics/activity');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
    });

    test('should handle errors', async () => {
      controller.metricsService.getActivityHeatmap.mockRejectedValue(
        new Error('API error')
      );

      const response = await request(app).get('/api/metrics/activity');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'API error');
    });
  });

  describe('GET /api/metrics/all', () => {
    test('should return all metrics combined', async () => {
      const mockData = {
        commits: { total: 10, byUser: {}, period: '30 days' },
        prMetrics: { total: 20, merged: 15, period: '30 days' },
        issueMetrics: { total: 15, open: 5, period: '30 days' },
        contributionTrends: { contributors: [], totalContributors: 0, period: '30 days' },
        activityHeatmap: { activityByDay: {}, period: '30 days' },
        generatedAt: new Date().toISOString(),
      };

      controller.metricsService.getAllMetrics.mockResolvedValue(mockData);

      const response = await request(app).get('/api/metrics/all');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('commits');
      expect(response.body).toHaveProperty('prMetrics');
      expect(response.body).toHaveProperty('issueMetrics');
      expect(response.body).toHaveProperty('contributionTrends');
      expect(response.body).toHaveProperty('activityHeatmap');
      expect(response.body).toHaveProperty('generatedAt');
    });

    test('should handle custom time periods', async () => {
      const mockData = {
        commits: { total: 50, byUser: {}, period: '90 days' },
        prMetrics: { total: 100, merged: 80, period: '90 days' },
        issueMetrics: { total: 60, open: 10, period: '90 days' },
        contributionTrends: { contributors: [], totalContributors: 0, period: '90 days' },
        activityHeatmap: { activityByDay: {}, period: '90 days' },
        generatedAt: new Date().toISOString(),
      };

      controller.metricsService.getAllMetrics.mockResolvedValue(mockData);

      const response = await request(app).get('/api/metrics/all?days=90');

      expect(response.status).toBe(200);
      expect(controller.metricsService.getAllMetrics).toHaveBeenCalledWith(90);
    });

    test('should handle errors', async () => {
      controller.metricsService.getAllMetrics.mockRejectedValue(
        new Error('API error')
      );

      const response = await request(app).get('/api/metrics/all');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'API error');
    });
  });
});
