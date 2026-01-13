/**
 * Multi-Model OpenAI Client
 *
 * Three-tier architecture:
 * 1. Core: gpt-4o-mini (90% of queries)
 * 2. Escalation: gpt-4o or o1-mini (10% of queries)
 * 3. RAG: Context-aware prompts
 */

import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Model configurations
const MODELS = {
    CORE: process.env.OPENAI_CORE_MODEL || "gpt-4o-mini",
    ESCALATION: process.env.OPENAI_ESCALATION_MODEL || "gpt-4o",
    REASONING: process.env.OPENAI_REASONING_MODEL || "o1-mini",
} as const;

const MODEL_CONFIG = {
    CORE: {
        maxTokens: parseInt(process.env.OPENAI_CORE_MAX_TOKENS || "1500"),
        temperature: parseFloat(process.env.OPENAI_CORE_TEMPERATURE || "0.7"),
    },
    ESCALATION: {
        maxTokens: parseInt(process.env.OPENAI_ESCALATION_MAX_TOKENS || "3000"),
        temperature: parseFloat(
            process.env.OPENAI_ESCALATION_TEMPERATURE || "0.3",
        ),
    },
} as const;

// Uncertainty signals that trigger escalation
const UNCERTAINTY_SIGNALS = [
    "it's unclear",
    "it's not clear",
    "possibly",
    "might be",
    "could be",
    "uncertain",
    "difficult to determine",
    "hard to say",
    "may indicate",
    "potentially",
];

export interface InsightRequest {
    metrics: Record<string, any>;
    context?: string[];
    requireDeepAnalysis?: boolean;
    platform?: string;
}

export interface InsightResponse {
    insights: string;
    recommendations: string[];
    priority: "high" | "medium" | "low";
    category: string;
    modelUsed: string;
    tokensUsed: number;
    cost: number;
}

export interface ComplexityScore {
    score: number;
    shouldEscalate: boolean;
    reasons: string[];
}

/**
 * Detect if query requires escalation to advanced model
 */
function analyzeComplexity(request: InsightRequest): ComplexityScore {
    let score = 0;
    const reasons: string[] = [];

    // Explicit deep analysis request
    if (request.requireDeepAnalysis) {
        score += 50;
        reasons.push("Deep analysis explicitly requested");
    }

    // Multi-platform analysis
    const platformCount = request.platform === "all" ? 3 : 1;
    if (platformCount > 2) {
        score += 20;
        reasons.push("Multi-platform attribution required");
    }

    // Complex metrics (more than 10 data points)
    const metricCount = Object.keys(request.metrics).length;
    if (metricCount > 10) {
        score += 15;
        reasons.push(`High metric count: ${metricCount}`);
    }

    // Anomaly detection keywords in context
    const contextStr = request.context?.join(" ").toLowerCase() || "";
    if (contextStr.includes("anomaly") || contextStr.includes("root cause")) {
        score += 25;
        reasons.push("Root-cause analysis required");
    }

    const shouldEscalate = score >= 30;

    return { score, shouldEscalate, reasons };
}

/**
 * Detect uncertainty in model response
 */
function detectUncertainty(response: string): boolean {
    const lowerResponse = response.toLowerCase();
    return UNCERTAINTY_SIGNALS.some((signal) => lowerResponse.includes(signal));
}

/**
 * Calculate cost based on tokens and model
 */
function calculateCost(tokens: number, model: string): number {
    // Pricing per 1M tokens (as of Jan 2026)
    const pricing: Record<string, { input: number; output: number }> = {
        "gpt-4o-mini": { input: 0.15, output: 0.60 },
        "gpt-4o": { input: 2.50, output: 10.00 },
        "o1-mini": { input: 3.00, output: 12.00 },
    };

    const modelPricing = pricing[model] || pricing["gpt-4o-mini"];
    // Assume 60/40 split between input/output tokens
    const inputTokens = tokens * 0.6;
    const outputTokens = tokens * 0.4;

    return (
        (inputTokens * modelPricing.input / 1_000_000) +
        (outputTokens * modelPricing.output / 1_000_000)
    );
}

/**
 * Generate insights using core model (gpt-4o-mini)
 */
export async function generateInsight(
    request: InsightRequest,
): Promise<InsightResponse> {
    try {
        // Check complexity
        const complexity = analyzeComplexity(request);

        // Log complexity analysis
        console.log("[OpenAI] Complexity analysis:", complexity);

        // Decide on model
        let modelToUse = MODELS.CORE;
        let config = MODEL_CONFIG.CORE;

        if (complexity.shouldEscalate) {
            // Always use gpt-4o for escalation (o1-mini requires special access)
            modelToUse = MODELS.ESCALATION;
            config = MODEL_CONFIG.ESCALATION;
            console.log(
                `[OpenAI] Escalating to ${modelToUse}:`,
                complexity.reasons,
            );
        }

        // Build prompt with context
        const systemPrompt = buildSystemPrompt(request.context);
        const userPrompt = buildUserPrompt(request.metrics, request.platform);

        // Call OpenAI
        const completion = await openai.chat.completions.create({
            model: modelToUse,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            temperature: config.temperature,
            max_tokens: config.maxTokens,
            response_format: { type: "json_object" },
        });

        const response = completion.choices[0].message.content || "{}";
        const tokensUsed = completion.usage?.total_tokens || 0;
        const cost = calculateCost(tokensUsed, modelToUse);

        // Parse response
        const parsed = JSON.parse(response);

        // Check for uncertainty in core model response
        if (modelToUse === MODELS.CORE && detectUncertainty(response)) {
            console.log(
                "[OpenAI] Uncertainty detected, re-running with escalation model",
            );
            return generateInsight({ ...request, requireDeepAnalysis: true });
        }

        return {
            insights: parsed.insights || "",
            recommendations: parsed.recommendations || [],
            priority: parsed.priority || "medium",
            category: parsed.category || "general",
            modelUsed: modelToUse,
            tokensUsed,
            cost,
        };
    } catch (error) {
        console.error("[OpenAI] Error generating insight:", error);
        throw new Error(
            `Failed to generate insight: ${
                error instanceof Error ? error.message : "Unknown error"
            }`,
        );
    }
}

/**
 * Analyze metrics using core model
 */
export async function analyzeMetrics(
    metrics: Record<string, any>,
    context?: string[],
): Promise<InsightResponse> {
    return generateInsight({ metrics, context });
}

/**
 * Generate recommendations
 */
export async function generateRecommendations(
    metrics: Record<string, any>,
    context?: string[],
): Promise<string[]> {
    const result = await generateInsight({ metrics, context });
    return result.recommendations;
}

/**
 * Deep analysis using escalation model
 */
export async function analyzeComplex(
    metrics: Record<string, any>,
    context?: string[],
    platform?: string,
): Promise<InsightResponse> {
    return generateInsight({
        metrics,
        context,
        requireDeepAnalysis: true,
        platform,
    });
}

/**
 * Build system prompt with business context
 */
function buildSystemPrompt(context?: string[]): string {
    let prompt =
        `You are an expert marketing analytics consultant specializing in digital marketing performance analysis.

Your role is to:
- Analyze marketing metrics from multiple platforms (GA4, Meta Ads, Instagram, etc.)
- Identify trends, patterns, and anomalies
- Provide actionable, specific recommendations
- Explain insights in clear, business-friendly language

Always respond in JSON format with this structure:
{
  "insights": "detailed analysis of the metrics",
  "recommendations": ["specific action 1", "specific action 2", "specific action 3"],
  "priority": "high|medium|low",
  "category": "trend|anomaly|opportunity|performance"
}`;

    if (context && context.length > 0) {
        prompt += `\n\nBusiness Context:\n${context.join("\n")}`;
        prompt +=
            "\n\nEnsure all insights and recommendations align with the business context above.";
    }

    return prompt;
}

/**
 * Build user prompt from metrics
 */
function buildUserPrompt(
    metrics: Record<string, any>,
    platform?: string,
): string {
    const platformText = platform ? ` from ${platform}` : "";

    let prompt =
        `Analyze these marketing metrics${platformText} and provide actionable insights:\n\n`;

    // Format metrics
    for (const [key, value] of Object.entries(metrics)) {
        if (typeof value === "object" && value !== null) {
            prompt += `${key}:\n${JSON.stringify(value, null, 2)}\n\n`;
        } else {
            prompt += `${key}: ${value}\n`;
        }
    }

    prompt += `\nProvide:
1. Key insights about performance trends
2. Any anomalies or concerning patterns
3. 3-5 specific, actionable recommendations
4. Priority level based on business impact`;

    return prompt;
}

/**
 * Retry logic with exponential backoff
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000,
): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            // Don't retry on certain errors
            if (error instanceof Error && error.message.includes("API key")) {
                throw error;
            }

            if (attempt < maxRetries - 1) {
                const delay = baseDelay * Math.pow(2, attempt);
                console.log(
                    `[OpenAI] Retry attempt ${attempt + 1} after ${delay}ms`,
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError || new Error("Max retries reached");
}
