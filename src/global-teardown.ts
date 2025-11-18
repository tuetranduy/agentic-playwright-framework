async function globalTeardown() {
    // Analysis and reporting is now handled by the custom AIAnalysisReporter
    // which runs after all reporters have completed, ensuring results.json is available
}

export default globalTeardown;
