/**
 * Confidence Scoring Utilities
 *
 * Calculate confidence scores for AI-generated insights based on data quality and context
 */

export interface ConfidenceFactors {
    dataPoints: number;
    dataSources: number;
    timeRange: number; // days
    metricVariety: number;
    hasHistoricalData: boolean;
    contextAvailable: boolean;
}

/**
 * Calculate confidence score for an insight (0-1)
 */
export function calculateConfidenceScore(factors: ConfidenceFactors): number {
    let score = 0.3; // Base confidence

    // Data points factor (0-0.25)
    if (factors.dataPoints >= 30) {
        score += 0.25;
    } else if (factors.dataPoints >= 14) {
        score += 0.15;
    } else if (factors.dataPoints >= 7) {
        score += 0.05;
    }

    // Data sources factor (0-0.2)
    if (factors.dataSources >= 3) {
        score += 0.2;
    } else if (factors.dataSources >= 2) {
        score += 0.1;
    } else if (factors.dataSources >= 1) {
        score += 0.05;
    }

    // Time range factor (0-0.15)
    if (factors.timeRange >= 30) {
        score += 0.15;
    } else if (factors.timeRange >= 14) {
        score += 0.1;
    } else if (factors.timeRange >= 7) {
        score += 0.05;
    }

    // Metric variety factor (0-0.1)
    if (factors.metricVariety >= 5) {
        score += 0.1;
    } else if (factors.metricVariety >= 3) {
        score += 0.05;
    }

    // Historical data bonus (0-0.1)
    if (factors.hasHistoricalData) {
        score += 0.1;
    }

    // Business context bonus (0-0.1)
    if (factors.contextAvailable) {
        score += 0.1;
    }

    // Ensure score is between 0 and 1
    return Math.min(Math.max(score, 0), 1);
}

/**
 * Determine if an insight should be shown based on confidence score
 */
export function shouldShowInsight(confidenceScore: number): boolean {
    return confidenceScore >= 0.5;
}

/**
 * Get confidence level label
 */
export function getConfidenceLevel(score: number): "high" | "medium" | "low" {
    if (score >= 0.8) return "high";
    if (score >= 0.5) return "medium";
    return "low";
}

/**
 * Calculate confidence factors from metrics and context
 */
export function extractConfidenceFactors(
    metrics: Record<string, any>,
    contextResults: any[],
    dateRange?: { start: string; end: string },
): ConfidenceFactors {
    // Count data points (assume daily metrics)
    const dataPoints = Array.isArray(metrics.daily)
        ? metrics.daily.length
        : Object.keys(metrics).length;

    // Count unique metric types
    const metricVariety =
        Object.keys(metrics).filter((key) =>
            !["daily", "metadata", "dateRange"].includes(key)
        ).length;

    // Calculate time range in days
    let timeRange = 30; // default
    if (dateRange) {
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        timeRange = Math.floor(
            (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
        );
    }

    // Check for historical data (more than 7 days)
    const hasHistoricalData = timeRange > 7;

    // Check if business context is available
    const contextAvailable = contextResults && contextResults.length > 0;

    // Count data sources (from metadata if available)
    const dataSources = metrics.metadata?.sources?.length || 1;

    return {
        dataPoints,
        dataSources,
        timeRange,
        metricVariety,
        hasHistoricalData,
        contextAvailable,
    };
}
