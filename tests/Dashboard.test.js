const fs = require('fs');
const path = require('path');

describe('Dashboard Color Scheme', () => {
  let htmlContent;

  beforeAll(() => {
    const htmlPath = path.join(__dirname, '../public/index.html');
    htmlContent = fs.readFileSync(htmlPath, 'utf-8');
  });

  describe('Primary Colors', () => {
    test('should use GitHub blue accent color (#58a6ff)', () => {
      expect(htmlContent).toMatch(/#58a6ff/i);
    });

    test('should use dark background gradients', () => {
      expect(htmlContent).toMatch(/#1a1f2e/i);
      expect(htmlContent).toMatch(/#0f1419/i);
    });

    test('should use light text color (#e6edf3)', () => {
      expect(htmlContent).toMatch(/#e6edf3/i);
    });

    test('should use muted text color (#9198a1)', () => {
      expect(htmlContent).toMatch(/#9198a1/i);
    });
  });

  describe('Success Colors', () => {
    test('should use green gradients for success states', () => {
      expect(htmlContent).toMatch(/#2ea043/i);
      expect(htmlContent).toMatch(/#238636/i);
      expect(htmlContent).toMatch(/#3fb950/i);
    });
  });

  describe('Error Colors', () => {
    test('should use red gradients for error states', () => {
      expect(htmlContent).toMatch(/#da3633/i);
      expect(htmlContent).toMatch(/#b62324/i);
    });
  });

  describe('Semantic UI Elements', () => {
    test('should have dark card backgrounds', () => {
      expect(htmlContent).toContain('background: rgba(22, 27, 34');
    });

    test('should have consistent border colors', () => {
      expect(htmlContent).toMatch(/#444c56/i);
      expect(htmlContent).toMatch(/#21262d/i);
    });

    test('should use gradient text for metric values', () => {
      expect(htmlContent).toContain('linear-gradient(135deg, #79c0ff 0%, #58a6ff 100%)');
      expect(htmlContent).toContain('-webkit-background-clip: text');
      expect(htmlContent).toContain('-webkit-text-fill-color: transparent');
    });

    test('should have hover effects with accent color', () => {
      expect(htmlContent).toContain('border-color: #58a6ff');
      expect(htmlContent).toContain('outline: 2px solid #58a6ff');
    });
  });

  describe('Interactive Elements', () => {
    test('should have button gradient', () => {
      expect(htmlContent).toContain('linear-gradient(135deg, #2ea043 0%, #238636 100%)');
    });

    test('should have hover states for buttons', () => {
      expect(htmlContent).toContain('linear-gradient(135deg, #3fb950 0%, #2ea043 100%)');
    });

    test('should have box shadows for depth', () => {
      expect(htmlContent).toContain('box-shadow:');
    });

    test('should have transition effects', () => {
      expect(htmlContent).toContain('transition:');
    });
  });

  describe('Heatmap Colors', () => {
    test('should have heatmap cell backgrounds', () => {
      expect(htmlContent).toContain('.heatmap-cell');
    });

    test('should have active state for heatmap cells', () => {
      expect(htmlContent).toContain('.heatmap-cell.active');
    });

    test('should have high intensity state for heatmap cells', () => {
      expect(htmlContent).toContain('.heatmap-cell.high');
    });
  });

  describe('Accessibility', () => {
    test('should have sufficient contrast ratios', () => {
      // Primary text on dark background
      expect(htmlContent).toContain('color: #e6edf3');
      // White text on green buttons
      expect(htmlContent).toContain('color: white');
    });

    test('should have focus indicators', () => {
      expect(htmlContent).toContain('outline: 2px solid #58a6ff');
      expect(htmlContent).toContain('outline-offset: 2px');
    });

    test('should have proper viewport meta tag', () => {
      expect(htmlContent).toContain('viewport');
      expect(htmlContent).toContain('width=device-width');
    });

    test('should have lang attribute', () => {
      expect(htmlContent).toContain('lang="en"');
    });
  });

  describe('Typography', () => {
    test('should use system font stack', () => {
      expect(htmlContent).toContain('-apple-system');
      expect(htmlContent).toContain('BlinkMacSystemFont');
      expect(htmlContent).toContain('Segoe UI');
    });

    test('should have consistent line height', () => {
      expect(htmlContent).toContain('line-height:');
    });

    test('should have responsive font sizes', () => {
      expect(htmlContent).toMatch(/font-size:\s*[\d.]+em/);
    });
  });

  describe('Layout and Spacing', () => {
    test('should use CSS Grid', () => {
      expect(htmlContent).toContain('display: grid');
      expect(htmlContent).toContain('grid-template-columns:');
    });

    test('should have responsive breakpoints', () => {
      expect(htmlContent).toContain('auto-fit');
      expect(htmlContent).toContain('minmax');
    });

    test('should have consistent spacing', () => {
      expect(htmlContent).toContain('gap:');
      expect(htmlContent).toContain('padding:');
      expect(htmlContent).toContain('margin:');
    });
  });

  describe('Visual Effects', () => {
    test('should use backdrop filter for glassmorphism', () => {
      expect(htmlContent).toContain('backdrop-filter: blur');
    });

    test('should have border radius for rounded corners', () => {
      expect(htmlContent).toContain('border-radius:');
    });

    test('should use text shadows for depth', () => {
      expect(htmlContent).toContain('text-shadow:');
    });
  });

  describe('Dashboard Structure', () => {
    test('should have main title', () => {
      expect(htmlContent).toContain('GitHub Metrics Dashboard');
    });

    test('should have time range selector', () => {
      expect(htmlContent).toContain('id="timeRange"');
      expect(htmlContent).toContain('value="7"');
      expect(htmlContent).toContain('value="30"');
      expect(htmlContent).toContain('value="90"');
    });

    test('should have refresh button', () => {
      expect(htmlContent).toContain('onclick="loadMetrics()"');
      expect(htmlContent).toContain('Refresh Data');
    });

    test('should have loading indicator', () => {
      expect(htmlContent).toContain('id="loading"');
      expect(htmlContent).toContain('Loading metrics...');
    });

    test('should have error container', () => {
      expect(htmlContent).toContain('id="error-container"');
    });

    test('should have metrics container', () => {
      expect(htmlContent).toContain('id="metrics-container"');
    });

    test('should have timestamp display', () => {
      expect(htmlContent).toContain('id="timestamp"');
    });
  });

  describe('JavaScript Functionality', () => {
    test('should have loadMetrics function', () => {
      expect(htmlContent).toContain('async function loadMetrics()');
    });

    test('should have render functions for each metric card', () => {
      expect(htmlContent).toContain('function renderCommitsCard');
      expect(htmlContent).toContain('function renderPRCard');
      expect(htmlContent).toContain('function renderIssuesCard');
      expect(htmlContent).toContain('function renderContributionsCard');
      expect(htmlContent).toContain('function renderActivityHeatmap');
    });

    test('should call loadMetrics on page load', () => {
      expect(htmlContent).toContain('window.addEventListener');
      expect(htmlContent).toContain('DOMContentLoaded');
      expect(htmlContent).toContain('loadMetrics()');
    });

    test('should fetch from API endpoint', () => {
      expect(htmlContent).toContain('/api/metrics/all');
    });
  });

  describe('Metric Cards', () => {
    test('should have metric card styles', () => {
      expect(htmlContent).toContain('.metric-card');
      expect(htmlContent).toContain('.metric-value');
      expect(htmlContent).toContain('.metric-label');
    });

    test('should have bar chart styles', () => {
      expect(htmlContent).toContain('.bar');
      expect(htmlContent).toContain('.bar-label');
    });

    test('should have contributor list styles', () => {
      expect(htmlContent).toContain('.contributor-list');
      expect(htmlContent).toContain('.contributor-item');
      expect(htmlContent).toContain('.contributor-header');
    });

    test('should have stat box styles', () => {
      expect(htmlContent).toContain('.stat-row');
      expect(htmlContent).toContain('.stat-box');
    });
  });

  describe('Color Consistency', () => {
    test('should use consistent blue accent throughout', () => {
      const blueMatches = htmlContent.match(/#58a6ff/gi);
      expect(blueMatches).not.toBeNull();
      expect(blueMatches.length).toBeGreaterThan(5);
    });

    test('should use consistent green for positive actions', () => {
      const greenMatches = htmlContent.match(/#2ea043|#238636|#3fb950/gi);
      expect(greenMatches).not.toBeNull();
      expect(greenMatches.length).toBeGreaterThan(3);
    });

    test('should use consistent dark backgrounds', () => {
      const darkBgMatches = htmlContent.match(/rgba\(22, 27, 34/gi);
      expect(darkBgMatches).not.toBeNull();
      expect(darkBgMatches.length).toBeGreaterThan(2);
    });
  });
});
