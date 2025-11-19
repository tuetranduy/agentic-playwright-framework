let testData = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    setupRefreshButton();
    setupSearch();
    loadData();
});

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

function setupRefreshButton() {
    const refreshBtn = document.getElementById('refreshBtn');
    refreshBtn.addEventListener('click', () => {
        loadData();
    });
}

function setupSearch() {
    const failureSearch = document.getElementById('failureSearch');
    failureSearch.addEventListener('input', (e) => {
        filterFailures(e.target.value);
    });

    const healedSearch = document.getElementById('healedSearch');
    healedSearch.addEventListener('input', (e) => {
        filterHealedLocators(e.target.value);
    });
}

async function loadData() {
    try {
        const response = await fetch('/api/test-results');
        if (!response.ok) {
            throw new Error('Failed to fetch test results');
        }
        testData = await response.json();
        updateDashboard();
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load test results. Make sure tests have been run.');
    }
}

function updateDashboard() {
    if (!testData) return;

    updateStats();
    updateOverview();
    updateFailures();
    updateHealedLocators();
    updateAIInsights();
    updateLastUpdated(testData.timestamp);
}

function updateStats() {
    const { testSummary, healedLocators } = testData;

    document.getElementById('totalTests').textContent = testSummary.totalTests;
    document.getElementById('passedTests').textContent = testSummary.passed;
    document.getElementById('failedTests').textContent = testSummary.failed;
    document.getElementById('skippedTests').textContent = testSummary.skipped;
    document.getElementById('healedCount').textContent = healedLocators.length;

    const successRate = testSummary.totalTests > 0
        ? ((testSummary.passed / testSummary.totalTests) * 100).toFixed(1)
        : 0;
    document.getElementById('successRate').textContent = `${successRate}%`;
}

function updateOverview() {
    const { testSummary } = testData;

    // Create chart
    const ctx = document.getElementById('testChart');
    
    // Destroy existing chart if it exists
    if (window.testChart && typeof window.testChart.destroy === 'function') {
        window.testChart.destroy();
    }

    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        document.getElementById('overviewChart').innerHTML = '<p class="empty">Chart library not loaded. Using text summary.</p>';
        const detailsHtml = `
            <p><strong>Test Execution Summary</strong></p>
            <p>Total test cases executed: ${testSummary.totalTests}</p>
            <p>Passed: ${testSummary.passed} (${testSummary.totalTests > 0 ? ((testSummary.passed / testSummary.totalTests) * 100).toFixed(2) : 0}%)</p>
            <p>Failed: ${testSummary.failed} (${testSummary.totalTests > 0 ? ((testSummary.failed / testSummary.totalTests) * 100).toFixed(2) : 0}%)</p>
            <p>Skipped: ${testSummary.skipped} (${testSummary.totalTests > 0 ? ((testSummary.skipped / testSummary.totalTests) * 100).toFixed(2) : 0}%)</p>
            ${testSummary.failed > 0 ? `<p style="color: var(--failure-color);">⚠️ ${testSummary.failed} test(s) need attention</p>` : ''}
            ${testData.healedLocators.length > 0 ? `<p style="color: var(--healing-color);">🔧 ${testData.healedLocators.length} locator(s) were automatically healed</p>` : ''}
        `;
        document.getElementById('overviewDetails').innerHTML = detailsHtml;
        return;
    }

    window.testChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Passed', 'Failed', 'Skipped'],
            datasets: [{
                data: [testSummary.passed, testSummary.failed, testSummary.skipped],
                backgroundColor: [
                    'rgb(16, 185, 129)',
                    'rgb(239, 68, 68)',
                    'rgb(245, 158, 11)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });

    // Update details
    const detailsHtml = `
        <p><strong>Test Execution Summary</strong></p>
        <p>Total test cases executed: ${testSummary.totalTests}</p>
        <p>Success rate: ${testSummary.totalTests > 0 ? ((testSummary.passed / testSummary.totalTests) * 100).toFixed(2) : 0}%</p>
        <p>Failure rate: ${testSummary.totalTests > 0 ? ((testSummary.failed / testSummary.totalTests) * 100).toFixed(2) : 0}%</p>
        ${testSummary.failed > 0 ? `<p style="color: var(--failure-color);">⚠️ ${testSummary.failed} test(s) need attention</p>` : ''}
        ${testData.healedLocators.length > 0 ? `<p style="color: var(--healing-color);">🔧 ${testData.healedLocators.length} locator(s) were automatically healed</p>` : ''}
    `;
    document.getElementById('overviewDetails').innerHTML = detailsHtml;
}

function updateFailures() {
    const { testSummary } = testData;
    const failuresList = document.getElementById('failuresList');

    if (testSummary.failures.length === 0) {
        failuresList.innerHTML = '<p class="empty">🎉 No test failures! All tests passed successfully.</p>';
        return;
    }

    const html = testSummary.failures.map((failure, index) => `
        <div class="failure-item" data-search="${failure.testName.toLowerCase()} ${failure.error.toLowerCase()}">
            <h3>${index + 1}. ${escapeHtml(failure.testName)}</h3>
            <div class="error">
                <strong>Error:</strong><br>
                ${escapeHtml(failure.error)}
            </div>
            <p style="margin-top: 12px; color: var(--text-secondary); font-size: 0.9rem;">
                <strong>Time:</strong> ${formatDate(failure.timestamp)}
            </p>
        </div>
    `).join('');

    failuresList.innerHTML = html;
}

function updateHealedLocators() {
    const { healedLocators } = testData;
    const healedList = document.getElementById('healedLocatorsList');

    if (healedLocators.length === 0) {
        healedList.innerHTML = '<p class="empty">No healed locators yet. Self-healing will activate when locators fail.</p>';
        return;
    }

    const html = healedLocators.map((locator, index) => `
        <div class="healed-item" data-search="${locator.original.toLowerCase()} ${locator.healed.toLowerCase()} ${locator.strategy.type.toLowerCase()}">
            <h3>${index + 1}. Locator Healed</h3>
            <div class="details">
                <div class="detail-row">
                    <span class="detail-label">Original:</span>
                    <code class="detail-value">${escapeHtml(locator.original)}</code>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Healed:</span>
                    <code class="detail-value">${escapeHtml(locator.healed)}</code>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Strategy:</span>
                    <span class="strategy-badge">${escapeHtml(locator.strategy.type)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">${formatDate(locator.timestamp)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value" style="color: var(--success-color);">✓ Success</span>
                </div>
            </div>
        </div>
    `).join('');

    healedList.innerHTML = html;
}

function updateAIInsights() {
    const { aiReport } = testData;
    const aiContent = document.getElementById('aiInsightContent');

    if (!aiReport || aiReport.trim() === '') {
        aiContent.innerHTML = '<p class="empty">No AI insights available. AI analysis will be generated after test execution with failures.</p>';
        return;
    }

    // Use marked.js to parse markdown
    if (typeof marked !== 'undefined') {
        aiContent.innerHTML = marked.parse(aiReport);
    } else {
        // Fallback to plain text with basic formatting
        aiContent.innerHTML = `<pre>${escapeHtml(aiReport)}</pre>`;
    }
}

function updateLastUpdated(timestamp) {
    const lastUpdated = document.getElementById('lastUpdated');
    lastUpdated.textContent = formatDate(timestamp);
}

function filterFailures(searchTerm) {
    const items = document.querySelectorAll('.failure-item');
    const term = searchTerm.toLowerCase();

    items.forEach(item => {
        const searchText = item.getAttribute('data-search') || '';
        if (searchText.includes(term)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function filterHealedLocators(searchTerm) {
    const items = document.querySelectorAll('.healed-item');
    const term = searchTerm.toLowerCase();

    items.forEach(item => {
        const searchText = item.getAttribute('data-search') || '';
        if (searchText.includes(term)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function showError(message) {
    const statsGrid = document.getElementById('statsGrid');
    statsGrid.innerHTML = `
        <div class="stat-card failure" style="grid-column: 1 / -1;">
            <div class="stat-icon">⚠️</div>
            <div class="stat-content">
                <div class="stat-label">Error</div>
                <div style="font-size: 1rem; color: var(--failure-color);">${escapeHtml(message)}</div>
            </div>
        </div>
    `;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}
