/**
 * GPT Prompt Templates
 *
 * Model-specific prompts optimized for gpt-4o-mini, gpt-4o, and o1-mini
 * with RAG integration for business context
 */

export interface PromptConfig {
    system: string;
    user: string;
    temperature: number;
    maxTokens: number;
}

/**
 * Build system prompt with business context
 */
export function buildSystemPrompt(
    businessContext?: string[],
    brandName?: string,
): string {
    const brand = brandName || "your business";

    let prompt =
        `You are an expert marketing analytics consultant specializing in digital marketing performance analysis for ${brand}.

Your expertise includes:
- Multi-platform analytics (GA4, Meta Ads, Instagram Business, Shopify, HubSpot, Google Ads, Wix)
- Trend analysis and pattern recognition
- Anomaly detection and root-cause analysis
- Strategic marketing recommendations
- ROI optimization and budget allocation

Your analysis should be:
- Data-driven and specific
- Actionable with clear next steps
- Aligned with business goals
- Prioritized by impact

Always respond in JSON format with this structure:
{
  "insights": "detailed analysis of the metrics with specific numbers and trends",
  "recommendations": ["specific action 1", "specific action 2", "specific action 3"],
  "priority": "high|medium|low",
  "category": "trend|anomaly|opportunity|performance|attribution"
}`;

    if (businessContext && businessContext.length > 0) {
        prompt += `\n\n=== BUSINESS CONTEXT ===\n${
            businessContext.join("\n\n")
        }`;
        prompt +=
            "\n\n=== IMPORTANT ===\nAll insights and recommendations MUST align with the business context above. Reference specific goals, KPIs, and brand guidelines when relevant.";
    }

    return prompt;
}

/**
 * Build user prompt for metric analysis
 */
export function buildMetricAnalysisPrompt(
    metrics: Record<string, any>,
    platform?: string,
    dateRange?: { start: string; end: string },
): string {
    const platformText = platform
        ? ` from ${platform}`
        : " across all platforms";
    const dateText = dateRange
        ? ` for ${dateRange.start} to ${dateRange.end}`
        : "";

    let prompt =
        `Analyze these marketing metrics${platformText}${dateText}:\n\n`;

    // Format metrics in a structured way
    for (const [key, value] of Object.entries(metrics)) {
        if (typeof value === "object" && value !== null) {
            if (Array.isArray(value)) {
                prompt += `${key}:\n${JSON.stringify(value, null, 2)}\n\n`;
            } else {
                prompt += `${key}:\n`;
                for (const [subKey, subValue] of Object.entries(value)) {
                    prompt += `  - ${subKey}: ${subValue}\n`;
                }
                prompt += "\n";
            }
        } else {
            prompt += `${key}: ${value}\n`;
        }
    }

    prompt += `\nProvide:
1. Key insights about performance trends (be specific with numbers and percentages)
2. Any anomalies, concerning patterns, or opportunities
3. 3-5 specific, actionable recommendations prioritized by impact
4. Priority level (high/medium/low) based on business impact and urgency`;

    return prompt;
}

/**
 * Build prompt for deep analysis (escalation model)
 */
export function buildDeepAnalysisPrompt(
    metrics: Record<string, any>,
    question: string,
    businessContext?: string[],
): string {
    let prompt =
        `Perform a deep, multi-step analysis to answer this question:\n\n"${question}"\n\n`;

    prompt += `Available metrics:\n${JSON.stringify(metrics, null, 2)}\n\n`;

    if (businessContext && businessContext.length > 0) {
        prompt += `Business context:\n${businessContext.join("\n\n")}\n\n`;
    }

    prompt += `Your analysis should:
1. Break down the problem into components
2. Examine cross-platform effects and attribution
3. Identify root causes, not just symptoms
4. Consider multiple hypotheses
5. Provide evidence-based conclusions
6. Recommend strategic actions with expected outcomes

Use chain-of-thought reasoning. Show your analytical process.

Respond in JSON format:
{
  "analysis": "detailed multi-step analysis with reasoning",
  "root_causes": ["cause 1", "cause 2"],
  "insights": "key findings",
  "recommendations": ["strategic action 1", "strategic action 2"],
  "priority": "high|medium|low",
  "category": "attribution|root_cause|strategic"
}`;

    return prompt;
}

/**
 * Build prompt for anomaly explanation
 */
export function buildAnomalyPrompt(
    metric: string,
    currentValue: number,
    expectedValue: number,
    historicalData: any[],
    businessContext?: string[],
): string {
    const deviation = ((currentValue - expectedValue) / expectedValue * 100)
        .toFixed(1);

    let prompt = `Explain this anomaly:\n\n`;
    prompt += `Metric: ${metric}\n`;
    prompt += `Current Value: ${currentValue}\n`;
    prompt += `Expected Value: ${expectedValue}\n`;
    prompt += `Deviation: ${deviation}%\n\n`;
    prompt += `Historical Data:\n${
        JSON.stringify(historicalData, null, 2)
    }\n\n`;

    if (businessContext && businessContext.length > 0) {
        prompt += `Business Context:\n${businessContext.join("\n\n")}\n\n`;
    }

    prompt += `Provide:
1. Possible root causes for this anomaly
2. Whether this is concerning or an opportunity
3. Recommended immediate actions
4. What to monitor going forward

Respond in JSON format:
{
  "root_causes": ["cause 1", "cause 2"],
  "severity": "critical|concerning|normal|positive",
  "insights": "explanation of the anomaly",
  "recommendations": ["action 1", "action 2"],
  "priority": "high|medium|low",
  "category": "anomaly"
}`;

    return prompt;
}

/**
 * Build prompt for trend analysis
 */
export function buildTrendPrompt(
    metrics: Record<string, any>,
    comparisonPeriod: "week" | "month" | "quarter",
    businessContext?: string[],
): string {
    let prompt = `Analyze trends over the past ${comparisonPeriod}:\n\n`;
    prompt += `Metrics:\n${JSON.stringify(metrics, null, 2)}\n\n`;

    if (businessContext && businessContext.length > 0) {
        prompt += `Business Context:\n${businessContext.join("\n\n")}\n\n`;
    }

    prompt += `Identify:
1. Upward and downward trends with specific percentages
2. Seasonal patterns or cyclical behavior
3. Correlation between different metrics
4. Opportunities to capitalize on positive trends
5. Actions to reverse negative trends

Respond in JSON format:
{
  "trends": {
    "positive": ["trend 1", "trend 2"],
    "negative": ["trend 1", "trend 2"],
    "neutral": ["trend 1"]
  },
  "insights": "detailed trend analysis",
  "recommendations": ["action 1", "action 2"],
  "priority": "high|medium|low",
  "category": "trend"
}`;

    return prompt;
}

/**
 * Build prompt for cross-platform attribution
 */
export function buildAttributionPrompt(
    gaMetrics: any,
    metaMetrics: any,
    instagramMetrics: any,
    businessContext?: string[],
): string {
    let prompt = `Analyze cross-platform attribution and performance:\n\n`;
    prompt += `GA4 Metrics:\n${JSON.stringify(gaMetrics, null, 2)}\n\n`;
    prompt += `Meta Ads Metrics:\n${JSON.stringify(metaMetrics, null, 2)}\n\n`;
    prompt += `Instagram Metrics:\n${
        JSON.stringify(instagramMetrics, null, 2)
    }\n\n`;

    if (businessContext && businessContext.length > 0) {
        prompt += `Business Context:\n${businessContext.join("\n\n")}\n\n`;
    }

    prompt += `Analyze:
1. How each platform contributes to overall goals
2. Cross-platform synergies or conflicts
3. Attribution patterns (which platform drives what)
4. Budget allocation recommendations
5. Platform-specific optimization opportunities

Respond in JSON format:
{
  "attribution": {
    "ga4": "contribution analysis",
    "meta": "contribution analysis",
    "instagram": "contribution analysis"
  },
  "synergies": ["synergy 1", "synergy 2"],
  "insights": "cross-platform analysis",
  "recommendations": ["action 1", "action 2"],
  "priority": "high|medium|low",
  "category": "attribution"
}`;

    return prompt;
}

/**
 * Get prompt configuration for specific model
 */
export function getModelConfig(model: "gpt-4o-mini" | "gpt-4o" | "o1-mini"): {
    temperature: number;
    maxTokens: number;
} {
    const configs = {
        "gpt-4o-mini": {
            temperature: 0.7,
            maxTokens: 1500,
        },
        "gpt-4o": {
            temperature: 0.5,
            maxTokens: 3000,
        },
        "o1-mini": {
            temperature: 0.3,
            maxTokens: 4000,
        },
    };

    return configs[model];
}
