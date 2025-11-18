"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function globalTeardown() {
    // Analysis and reporting is now handled by the custom AIAnalysisReporter
    // which runs after all reporters have completed, ensuring results.json is available
}
exports.default = globalTeardown;
//# sourceMappingURL=global-teardown.js.map