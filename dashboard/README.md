# Agentic Playwright Dashboard

A modern, friendly web dashboard for visualizing test results and self-healed locators from the Agentic Playwright Framework.

## Features

- 📊 **Test Results Visualization**: View test execution summary with interactive charts
- ✅ **Pass/Fail Statistics**: Track success rates and identify failing tests
- 🔧 **Healed Locators Tracking**: Monitor self-healing locator activity
- 🤖 **AI Insights**: View AI-powered analysis of test failures
- 🔍 **Search & Filter**: Quickly find specific failures or healed locators
- 🎨 **Modern UI**: Beautiful, responsive design that works on all devices
- 🐳 **Docker Support**: Easy deployment with Docker

## Quick Start

### Option 1: Run Locally

1. **Install dependencies:**
   ```bash
   cd dashboard
   npm install
   ```

2. **Start the dashboard:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

### Option 2: Run with Docker

1. **Build and start the container:**
   ```bash
   docker-compose up -d
   ```

2. **Open your browser:**
   Navigate to `http://localhost:3000`

3. **Stop the container:**
   ```bash
   docker-compose down
   ```

### Option 3: Run from Root Directory

From the project root directory:
```bash
npm run dashboard
```

## Usage

1. **Run your tests** to generate test results:
   ```bash
   npm test
   ```

2. **Start the dashboard** using any of the methods above

3. **View your results** at `http://localhost:3000`

4. **Refresh the dashboard** by clicking the refresh button to load the latest results

## Dashboard Sections

### Overview
- Test execution summary with pass/fail statistics
- Interactive doughnut chart showing test distribution
- Success rate calculation
- Healed locators count

### Test Failures
- Detailed list of all failed tests
- Error messages and stack traces
- Timestamps for each failure
- Search functionality to filter failures

### Healed Locators
- Complete list of self-healed locators
- Original vs healed selector comparison
- Healing strategy used (text, role, CSS, XPath, etc.)
- Success status and timestamps
- Search functionality

### AI Insights
- AI-powered analysis of test failures
- Root cause identification
- Actionable recommendations
- Formatted markdown reports

## Docker Configuration

The dashboard runs in a lightweight Node.js Alpine container with the following features:

- **Port**: 3000 (configurable via environment variable)
- **Volume Mount**: `./test-results` directory is mounted read-only
- **Health Check**: Automatic health monitoring
- **Auto-restart**: Container restarts automatically on failure

### Environment Variables

- `PORT`: Dashboard port (default: 3000)
- `NODE_ENV`: Node environment (default: production)

### Custom Port

To run on a different port:

```bash
# Using docker-compose
PORT=8080 docker-compose up -d

# Using docker run
docker run -p 8080:8080 -e PORT=8080 -v ./test-results:/app/test-results agentic-playwright-dashboard
```

## Data Sources

The dashboard reads data from:

- `test-results/results.json` - Test execution results
- `test-results/healed-locators.json` - Self-healed locators data
- `test-results/ai-analysis-report.md` - AI analysis report

Make sure to run your tests before viewing the dashboard to generate these files.

## Development

To modify the dashboard:

1. **Frontend files** are in `dashboard/public/`:
   - `index.html` - Dashboard structure
   - `styles.css` - Styling and layout
   - `app.js` - Dashboard logic and data handling

2. **Backend server** is in `dashboard/server/`:
   - `index.js` - Express server and API endpoints

3. **Restart the server** after making changes:
   ```bash
   cd dashboard
   npm start
   ```

## API Endpoints

The dashboard provides the following REST API endpoints:

- `GET /api/test-results` - Get test results, healed locators, and AI report
- `GET /api/test-files` - List all test result files

## Troubleshooting

**Dashboard shows "No data available":**
- Make sure you've run tests first: `npm test`
- Check that the `test-results` directory exists
- Verify that result files are present in `test-results/`

**Docker container won't start:**
- Check that port 3000 is not already in use
- Verify Docker is running
- Check logs: `docker-compose logs dashboard`

**Can't access dashboard:**
- Verify the server is running on `http://localhost:3000`
- Check firewall settings
- Ensure no other service is using port 3000

## Browser Compatibility

The dashboard works on all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Performance

The dashboard is lightweight and performant:
- Loads data on demand
- Efficient rendering for large test suites
- Responsive design for mobile devices
- Minimal dependencies

## License

MIT
