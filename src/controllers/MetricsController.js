const GitHubMetricsService = require('../services/GitHubMetricsService');

class MetricsController {
  constructor(githubToken, owner, repo) {
    this.metricsService = new GitHubMetricsService(githubToken, owner, repo);
  }

  async getCommitsPerUser(req, res) {
    try {
      const days = parseInt(req.query.days) || 30;
      const data = await this.metricsService.getCommitsPerUser(days);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getPRMetrics(req, res) {
    try {
      const days = parseInt(req.query.days) || 30;
      const data = await this.metricsService.getPRMetrics(days);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getIssueMetrics(req, res) {
    try {
      const days = parseInt(req.query.days) || 30;
      const data = await this.metricsService.getIssueMetrics(days);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getContributionTrends(req, res) {
    try {
      const days = parseInt(req.query.days) || 30;
      const data = await this.metricsService.getContributionTrends(days);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getActivityHeatmap(req, res) {
    try {
      const days = parseInt(req.query.days) || 30;
      const data = await this.metricsService.getActivityHeatmap(days);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAllMetrics(req, res) {
    try {
      const days = parseInt(req.query.days) || 30;
      const data = await this.metricsService.getAllMetrics(days);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = MetricsController;
