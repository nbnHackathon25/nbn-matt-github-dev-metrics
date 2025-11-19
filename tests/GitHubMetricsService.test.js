const GitHubMetricsService = require('../src/services/GitHubMetricsService');

// Mock the Octokit library
jest.mock('@octokit/rest', () => {
  return {
    Octokit: jest.fn().mockImplementation(() => ({
      paginate: jest.fn(),
      repos: {
        listCommits: jest.fn(),
      },
      pulls: {
        list: jest.fn(),
      },
      issues: {
        listForRepo: jest.fn(),
        listComments: jest.fn(),
      },
    })),
  };
});

describe('GitHubMetricsService', () => {
  let service;
  let mockOctokit;

  beforeEach(() => {
    const { Octokit } = require('@octokit/rest');
    service = new GitHubMetricsService('fake-token', 'test-owner', 'test-repo');
    mockOctokit = service.octokit;
    jest.clearAllMocks();
  });

  describe('Metric 1: getCommitsPerUser', () => {
    test('should return commits per user', async () => {
      const mockCommits = [
        {
          author: { login: 'user1' },
          commit: { author: { name: 'User One', date: new Date().toISOString() } },
        },
        {
          author: { login: 'user1' },
          commit: { author: { name: 'User One', date: new Date().toISOString() } },
        },
        {
          author: { login: 'user2' },
          commit: { author: { name: 'User Two', date: new Date().toISOString() } },
        },
      ];

      mockOctokit.paginate.mockResolvedValue(mockCommits);

      const result = await service.getCommitsPerUser(30);

      expect(result).toHaveProperty('total', 3);
      expect(result).toHaveProperty('byUser');
      expect(result.byUser).toEqual({
        user1: 2,
        user2: 1,
      });
      expect(result.period).toBe('30 days');
    });

    test('should handle commits without author login', async () => {
      const mockCommits = [
        {
          author: null,
          commit: { author: { name: 'External User', date: new Date().toISOString() } },
        },
      ];

      mockOctokit.paginate.mockResolvedValue(mockCommits);

      const result = await service.getCommitsPerUser(30);

      expect(result.byUser).toHaveProperty('External User', 1);
    });

    test('should handle errors gracefully', async () => {
      mockOctokit.paginate.mockRejectedValue(new Error('API error'));

      await expect(service.getCommitsPerUser(30)).rejects.toThrow('API error');
    });
  });

  describe('Metric 2: getPRMetrics', () => {
    test('should calculate PR merge rate and cycle time', async () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      const mockPRs = [
        {
          created_at: yesterday.toISOString(),
          merged_at: now.toISOString(),
          state: 'closed',
        },
        {
          created_at: yesterday.toISOString(),
          merged_at: now.toISOString(),
          state: 'closed',
        },
        {
          created_at: yesterday.toISOString(),
          merged_at: null,
          state: 'open',
        },
      ];

      mockOctokit.paginate.mockResolvedValue(mockPRs);

      const result = await service.getPRMetrics(30);

      expect(result).toHaveProperty('total', 3);
      expect(result).toHaveProperty('merged', 2);
      expect(result).toHaveProperty('open', 1);
      expect(result).toHaveProperty('closed', 0);
      expect(result.mergeRate).toBe('66.67%');
      expect(parseFloat(result.avgCycleTimeHours)).toBeGreaterThan(0);
    });

    test('should handle zero PRs', async () => {
      mockOctokit.paginate.mockResolvedValue([]);

      const result = await service.getPRMetrics(30);

      expect(result.total).toBe(0);
      expect(result.mergeRate).toBe('0.00%');
      expect(result.avgCycleTimeHours).toBe('0.00');
    });
  });

  describe('Metric 3: getIssueMetrics', () => {
    test('should calculate issue triage and resolution times', async () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      const mockIssues = [
        {
          number: 1,
          created_at: yesterday.toISOString(),
          closed_at: now.toISOString(),
          state: 'closed',
        },
        {
          number: 2,
          created_at: yesterday.toISOString(),
          closed_at: null,
          state: 'open',
        },
      ];

      mockOctokit.paginate.mockResolvedValue(mockIssues);
      mockOctokit.issues.listComments.mockResolvedValue({ data: [] });

      const result = await service.getIssueMetrics(30);

      expect(result).toHaveProperty('total', 2);
      expect(result).toHaveProperty('open', 1);
      expect(result).toHaveProperty('closed', 1);
      expect(parseFloat(result.avgResolutionTimeHours)).toBeGreaterThan(0);
    });

    test('should filter out pull requests from issues', async () => {
      const mockIssues = [
        {
          number: 1,
          created_at: new Date().toISOString(),
          state: 'open',
        },
        {
          number: 2,
          created_at: new Date().toISOString(),
          state: 'open',
          pull_request: { url: 'https://github.com/test/test/pulls/2' },
        },
      ];

      mockOctokit.paginate.mockResolvedValue(mockIssues);
      mockOctokit.issues.listComments.mockResolvedValue({ data: [] });

      const result = await service.getIssueMetrics(30);

      expect(result.total).toBe(1);
    });
  });

  describe('Metric 4: getContributionTrends', () => {
    test('should calculate contributor statistics', async () => {
      const mockCommits = [
        {
          author: { login: 'user1' },
          commit: { author: { name: 'User One', date: new Date().toISOString() } },
        },
        {
          author: { login: 'user2' },
          commit: { author: { name: 'User Two', date: new Date().toISOString() } },
        },
      ];

      const mockPRs = [
        {
          created_at: new Date().toISOString(),
          user: { login: 'user1' },
        },
      ];

      mockOctokit.paginate
        .mockResolvedValueOnce(mockCommits)
        .mockResolvedValueOnce(mockPRs);

      const result = await service.getContributionTrends(30);

      expect(result).toHaveProperty('contributors');
      expect(result).toHaveProperty('totalContributors', 2);
      expect(result.contributors[0]).toHaveProperty('user');
      expect(result.contributors[0]).toHaveProperty('commits');
      expect(result.contributors[0]).toHaveProperty('prsCreated');
    });

    test('should sort contributors by total activity', async () => {
      const mockCommits = [
        {
          author: { login: 'user1' },
          commit: { author: { name: 'User One', date: new Date().toISOString() } },
        },
        {
          author: { login: 'user1' },
          commit: { author: { name: 'User One', date: new Date().toISOString() } },
        },
        {
          author: { login: 'user2' },
          commit: { author: { name: 'User Two', date: new Date().toISOString() } },
        },
      ];

      const mockPRs = [];

      mockOctokit.paginate
        .mockResolvedValueOnce(mockCommits)
        .mockResolvedValueOnce(mockPRs);

      const result = await service.getContributionTrends(30);

      expect(result.contributors[0].user).toBe('user1');
      expect(result.contributors[0].commits).toBe(2);
    });
  });

  describe('Metric 5: getActivityHeatmap', () => {
    test('should generate activity heatmap data', async () => {
      const mockCommits = [
        {
          commit: {
            author: {
              date: new Date('2024-01-15T10:00:00Z').toISOString(),
            },
          },
        },
        {
          commit: {
            author: {
              date: new Date('2024-01-15T14:00:00Z').toISOString(),
            },
          },
        },
        {
          commit: {
            author: {
              date: new Date('2024-01-16T10:00:00Z').toISOString(),
            },
          },
        },
      ];

      mockOctokit.paginate.mockResolvedValue(mockCommits);

      const result = await service.getActivityHeatmap(30);

      expect(result).toHaveProperty('activityByDay');
      expect(result).toHaveProperty('activityByHour');
      expect(result).toHaveProperty('activityByDayOfWeek');
      expect(result).toHaveProperty('totalCommits', 3);
      expect(Object.keys(result.activityByDayOfWeek)).toHaveLength(7);
    });

    test('should count commits by hour correctly', async () => {
      const mockCommits = [
        {
          commit: {
            author: {
              date: new Date('2024-01-15T10:00:00Z').toISOString(),
            },
          },
        },
        {
          commit: {
            author: {
              date: new Date('2024-01-15T10:30:00Z').toISOString(),
            },
          },
        },
      ];

      mockOctokit.paginate.mockResolvedValue(mockCommits);

      const result = await service.getActivityHeatmap(30);

      expect(result.activityByHour[10]).toBe(2);
    });
  });

  describe('getAllMetrics', () => {
    test('should return all metrics combined', async () => {
      const mockCommits = [
        {
          author: { login: 'user1' },
          commit: { author: { name: 'User One', date: new Date().toISOString() } },
        },
      ];

      const mockPRs = [
        {
          created_at: new Date().toISOString(),
          merged_at: new Date().toISOString(),
          state: 'closed',
          user: { login: 'user1' },
        },
      ];

      const mockIssues = [
        {
          number: 1,
          created_at: new Date().toISOString(),
          state: 'open',
        },
      ];

      mockOctokit.paginate.mockImplementation((fn, params) => {
        if (params.per_page === 100 && fn === mockOctokit.repos.listCommits) {
          return Promise.resolve(mockCommits);
        }
        if (fn === mockOctokit.pulls.list) {
          return Promise.resolve(mockPRs);
        }
        if (fn === mockOctokit.issues.listForRepo) {
          return Promise.resolve(mockIssues);
        }
        return Promise.resolve([]);
      });

      mockOctokit.issues.listComments.mockResolvedValue({ data: [] });

      const result = await service.getAllMetrics(30);

      expect(result).toHaveProperty('commits');
      expect(result).toHaveProperty('prMetrics');
      expect(result).toHaveProperty('issueMetrics');
      expect(result).toHaveProperty('contributionTrends');
      expect(result).toHaveProperty('activityHeatmap');
      expect(result).toHaveProperty('generatedAt');
    });
  });
});
