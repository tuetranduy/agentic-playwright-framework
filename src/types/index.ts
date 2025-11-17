export interface LocatorStrategy {
  type: 'text' | 'role' | 'testId' | 'xpath' | 'css' | 'visual';
  selector: string;
  confidence?: number;
}

export interface HealedLocator {
  original: string;
  healed: string;
  strategy: LocatorStrategy;
  timestamp: Date;
  success: boolean;
}

export interface TestFailure {
  testName: string;
  error: string;
  screenshot?: string;
  trace?: string;
  timestamp: Date;
}

export interface AIAnalysisResult {
  summary: string;
  rootCause?: string;
  suggestions: string[];
  confidence: number;
}

export interface ReportAnalysis {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  failures: TestFailure[];
  aiInsights?: AIAnalysisResult;
  healedLocators: HealedLocator[];
}
