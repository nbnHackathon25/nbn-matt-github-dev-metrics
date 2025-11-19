const { Octokit } = require('@octokit/rest');

class GitHubMetricsService {
  constructor(token, owner, repo) {
    this.octokit = new Octokit({ auth: token });
    this.owner = owner;
    this.repo = repo;
  }

  /**
   * Metric 1: Get number of commits per user
   * @param {number} days - Number of days to look back
   * @returns {Promise<Object>} Commits per user
   */
  async getCommitsPerUser(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    try {
      const commits = await this.octokit.paginate(
        this.octokit.repos.listCommits,
        {
          owner: this.owner,
          repo: this.repo,
          since: since.toISOString(),
          per_page: 100,
        }
      );

      const commitsPerUser = {};
      commits.forEach((commit) => {
        const author = commit.author?.login || commit.commit.author.name || 'Unknown';
        commitsPerUser[author] = (commitsPerUser[author] || 0) + 1;
      });

      return {
        total: commits.length,
        byUser: commitsPerUser,
        period: `${days} days`,
      };
    } catch (error) {
      console.error('Error fetching commits:', error.message);
      throw error;
    }
  }

  /**
   * Metric 2: Get PR merge rate and cycle time
   * @param {number} days - Number of days to look back
   * @returns {Promise<Object>} PR metrics
   */
  async getPRMetrics(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    try {
      const allPRs = await this.octokit.paginate(
        this.octokit.pulls.list,
        {
          owner: this.owner,
          repo: this.repo,
          state: 'all',
          sort: 'updated',
          direction: 'desc',
          per_page: 100,
        }
      );

      // Filter PRs by date
      const recentPRs = allPRs.filter(
        (pr) => new Date(pr.created_at) >= since
      );

      const mergedPRs = recentPRs.filter((pr) => pr.merged_at);
      const openPRs = recentPRs.filter((pr) => pr.state === 'open');
      const closedPRs = recentPRs.filter(
        (pr) => pr.state === 'closed' && !pr.merged_at
      );

      // Calculate cycle times for merged PRs
      const cycleTimes = mergedPRs.map((pr) => {
        const created = new Date(pr.created_at);
        const merged = new Date(pr.merged_at);
        return (merged - created) / (1000 * 60 * 60); // hours
      });

      const avgCycleTime =
        cycleTimes.length > 0
          ? cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length
          : 0;

      const mergeRate =
        recentPRs.length > 0 ? (mergedPRs.length / recentPRs.length) * 100 : 0;

      return {
        total: recentPRs.length,
        merged: mergedPRs.length,
        open: openPRs.length,
        closed: closedPRs.length,
        mergeRate: mergeRate.toFixed(2) + '%',
        avgCycleTimeHours: avgCycleTime.toFixed(2),
        avgCycleTimeDays: (avgCycleTime / 24).toFixed(2),
        period: `${days} days`,
      };
    } catch (error) {
      console.error('Error fetching PR metrics:', error.message);
      throw error;
    }
  }

  /**
   * Metric 3: Get issue triage and resolution speed
   * @param {number} days - Number of days to look back
   * @returns {Promise<Object>} Issue metrics
   */
  async getIssueMetrics(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    try {
      const allIssues = await this.octokit.paginate(
        this.octokit.issues.listForRepo,
        {
          owner: this.owner,
          repo: this.repo,
          state: 'all',
          since: since.toISOString(),
          per_page: 100,
        }
      );

      // Filter out pull requests (they appear in issues endpoint too)
      const issues = allIssues.filter((issue) => !issue.pull_request);

      const openIssues = issues.filter((issue) => issue.state === 'open');
      const closedIssues = issues.filter((issue) => issue.state === 'closed');

      // Calculate time to first response (triage)
      const triageTimes = [];
      for (const issue of issues.slice(0, 50)) {
        // Limit to avoid rate limiting
        try {
          const comments = await this.octokit.issues.listComments({
            owner: this.owner,
            repo: this.repo,
            issue_number: issue.number,
            per_page: 1,
          });

          if (comments.data.length > 0) {
            const created = new Date(issue.created_at);
            const firstComment = new Date(comments.data[0].created_at);
            triageTimes.push((firstComment - created) / (1000 * 60 * 60)); // hours
          }
        } catch (error) {
          console.error(
            `Error fetching comments for issue ${issue.number}:`,
            error.message
          );
        }
      }

      const avgTriageTime =
        triageTimes.length > 0
          ? triageTimes.reduce((a, b) => a + b, 0) / triageTimes.length
          : 0;

      // Calculate resolution time for closed issues
      const resolutionTimes = closedIssues.map((issue) => {
        const created = new Date(issue.created_at);
        const closed = new Date(issue.closed_at);
        return (closed - created) / (1000 * 60 * 60); // hours
      });

      const avgResolutionTime =
        resolutionTimes.length > 0
          ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
          : 0;

      return {
        total: issues.length,
        open: openIssues.length,
        closed: closedIssues.length,
        avgTriageTimeHours: avgTriageTime.toFixed(2),
        avgResolutionTimeHours: avgResolutionTime.toFixed(2),
        avgResolutionTimeDays: (avgResolutionTime / 24).toFixed(2),
        period: `${days} days`,
      };
    } catch (error) {
      console.error('Error fetching issue metrics:', error.message);
      throw error;
    }
  }

  /**
   * Metric 4: Get developer contribution trends
   * @param {number} days - Number of days to look back
   * @returns {Promise<Object>} Contribution trends
   */
  async getContributionTrends(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    try {
      const commits = await this.octokit.paginate(
        this.octokit.repos.listCommits,
        {
          owner: this.owner,
          repo: this.repo,
          since: since.toISOString(),
          per_page: 100,
        }
      );

      const allPRs = await this.octokit.paginate(
        this.octokit.pulls.list,
        {
          owner: this.owner,
          repo: this.repo,
          state: 'all',
          sort: 'updated',
          direction: 'desc',
          per_page: 100,
        }
      );

      const recentPRs = allPRs.filter(
        (pr) => new Date(pr.created_at) >= since
      );

      const contributorStats = {};

      // Count commits per user
      commits.forEach((commit) => {
        const author = commit.author?.login || commit.commit.author.name || 'Unknown';
        if (!contributorStats[author]) {
          contributorStats[author] = {
            commits: 0,
            prsCreated: 0,
            prsReviewed: 0,
          };
        }
        contributorStats[author].commits++;
      });

      // Count PRs created
      recentPRs.forEach((pr) => {
        const author = pr.user?.login || 'Unknown';
        if (!contributorStats[author]) {
          contributorStats[author] = {
            commits: 0,
            prsCreated: 0,
            prsReviewed: 0,
          };
        }
        contributorStats[author].prsCreated++;
      });

      // Sort by total activity
      const sortedContributors = Object.entries(contributorStats)
        .map(([user, stats]) => ({
          user,
          ...stats,
          totalActivity: stats.commits + stats.prsCreated + stats.prsReviewed,
        }))
        .sort((a, b) => b.totalActivity - a.totalActivity);

      return {
        contributors: sortedContributors,
        totalContributors: sortedContributors.length,
        period: `${days} days`,
      };
    } catch (error) {
      console.error('Error fetching contribution trends:', error.message);
      throw error;
    }
  }

  /**
   * Metric 5: Get repository activity heatmap data
   * @param {number} days - Number of days to look back
   * @returns {Promise<Object>} Activity heatmap data
   */
  async getActivityHeatmap(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    try {
      const commits = await this.octokit.paginate(
        this.octokit.repos.listCommits,
        {
          owner: this.owner,
          repo: this.repo,
          since: since.toISOString(),
          per_page: 100,
        }
      );

      const activityByDay = {};
      const activityByHour = {};
      const activityByDayOfWeek = {
        Sunday: 0,
        Monday: 0,
        Tuesday: 0,
        Wednesday: 0,
        Thursday: 0,
        Friday: 0,
        Saturday: 0,
      };

      commits.forEach((commit) => {
        const date = new Date(commit.commit.author.date);
        const dayKey = date.toISOString().split('T')[0];
        const hour = date.getHours();
        const dayOfWeek = [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ][date.getDay()];

        activityByDay[dayKey] = (activityByDay[dayKey] || 0) + 1;
        activityByHour[hour] = (activityByHour[hour] || 0) + 1;
        activityByDayOfWeek[dayOfWeek]++;
      });

      return {
        activityByDay,
        activityByHour,
        activityByDayOfWeek,
        totalCommits: commits.length,
        period: `${days} days`,
      };
    } catch (error) {
      console.error('Error fetching activity heatmap:', error.message);
      throw error;
    }
  }

  /**
   * Get all metrics in one call
   * @param {number} days - Number of days to look back
   * @returns {Promise<Object>} All metrics
   */
  async getAllMetrics(days = 30) {
    try {
      const [
        commits,
        prMetrics,
        issueMetrics,
        contributionTrends,
        activityHeatmap,
      ] = await Promise.all([
        this.getCommitsPerUser(days),
        this.getPRMetrics(days),
        this.getIssueMetrics(days),
        this.getContributionTrends(days),
        this.getActivityHeatmap(days),
      ]);

      return {
        commits,
        prMetrics,
        issueMetrics,
        contributionTrends,
        activityHeatmap,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching all metrics:', error.message);
      throw error;
    }
  }
}

module.exports = GitHubMetricsService;
