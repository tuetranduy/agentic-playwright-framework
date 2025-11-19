const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Simple in-memory rate limiting
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 100; // Max requests per window

function rateLimiter(req, res, next) {
  const clientId = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!requestCounts.has(clientId)) {
    requestCounts.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  const clientData = requestCounts.get(clientId);
  
  if (now > clientData.resetTime) {
    clientData.count = 1;
    clientData.resetTime = now + RATE_LIMIT_WINDOW;
    return next();
  }
  
  if (clientData.count >= MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many requests, please try again later' });
  }
  
  clientData.count++;
  next();
}

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [clientId, data] of requestCounts.entries()) {
    if (now > data.resetTime) {
      requestCounts.delete(clientId);
    }
  }
}, 5 * 60 * 1000);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Apply rate limiting to API routes
app.use('/api', rateLimiter);

// API endpoint to get test results summary
app.get('/api/test-results', (req, res) => {
  try {
    const resultsDir = path.join(__dirname, '../../test-results');
    
    // Try to read healed-locators.json
    let healedLocators = [];
    const healedLocatorsPath = path.join(resultsDir, 'healed-locators.json');
    if (fs.existsSync(healedLocatorsPath)) {
      const data = fs.readFileSync(healedLocatorsPath, 'utf-8');
      healedLocators = JSON.parse(data);
    }
    
    // Try to read ai-analysis-report.md
    let aiReport = '';
    const aiReportPath = path.join(resultsDir, 'ai-analysis-report.md');
    if (fs.existsSync(aiReportPath)) {
      aiReport = fs.readFileSync(aiReportPath, 'utf-8');
    }
    
    // Parse test results from results.json
    let testSummary = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      failures: []
    };
    
    const resultsPath = path.join(resultsDir, 'results.json');
    if (fs.existsSync(resultsPath)) {
      const resultsData = fs.readFileSync(resultsPath, 'utf-8');
      const results = JSON.parse(resultsData);
      testSummary = parseTestResults(results);
    }
    
    res.json({
      testSummary,
      healedLocators,
      aiReport,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error reading test results:', error);
    res.status(500).json({ 
      error: 'Failed to read test results',
      message: error.message 
    });
  }
});

// API endpoint to get list of all test result files
app.get('/api/test-files', (req, res) => {
  try {
    const resultsDir = path.join(__dirname, '../../test-results');
    
    if (!fs.existsSync(resultsDir)) {
      return res.json({ files: [] });
    }
    
    const files = fs.readdirSync(resultsDir).filter(file => {
      return file.endsWith('.json') || file.endsWith('.md');
    }).map(file => ({
      name: file,
      path: path.join(resultsDir, file),
      modified: fs.statSync(path.join(resultsDir, file)).mtime
    }));
    
    res.json({ files });
  } catch (error) {
    console.error('Error reading test files:', error);
    res.status(500).json({ 
      error: 'Failed to read test files',
      message: error.message 
    });
  }
});

function parseTestResults(results) {
  const summary = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    failures: []
  };
  
  if (results.suites) {
    parseSuites(results.suites, summary);
  } else if (results.stats) {
    summary.passed = results.stats.expected || 0;
    summary.failed = results.stats.unexpected || 0;
    summary.skipped = results.stats.skipped || 0;
    summary.totalTests = summary.passed + summary.failed + summary.skipped;
  }
  
  return summary;
}

function parseSuites(suites, summary) {
  for (const suite of suites) {
    if (suite.specs) {
      for (const spec of suite.specs) {
        summary.totalTests++;
        
        if (spec.ok) {
          summary.passed++;
        } else if (spec.tests) {
          const test = spec.tests[0];
          const results = test?.results;
          if (results?.[0]?.status === 'skipped') {
            summary.skipped++;
          } else {
            summary.failed++;
            const result = results?.[0];
            const error = result?.error;
            summary.failures.push({
              testName: spec.title || 'Unknown test',
              error: error?.message || 'Unknown error',
              timestamp: new Date(result?.startTime || Date.now()).toISOString()
            });
          }
        }
      }
    }
    
    if (suite.suites) {
      parseSuites(suite.suites, summary);
    }
  }
}

app.listen(PORT, () => {
  console.log(`Dashboard server running at http://localhost:${PORT}`);
  console.log(`Press Ctrl+C to stop`);
});
