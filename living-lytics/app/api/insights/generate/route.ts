/**
 * AI Insights Generation API
 *
 * Generates marketing insights using OpenAI GPT with RAG and tiered model routing
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeComplex, generateInsight } from "@/lib/api/openai-client";
import {
    formatContextForPrompt,
    retrieveContext,
} from "@/lib/services/context-store-service";

export interface InsightGenerationRequest {
    metrics: Record<string, any>;
    platform?: string;
    dateRange?: {
        start: string;
        end: string;
    };
    requireDeepAnalysis?: boolean;
    query?: string;
}

/**
 * POST /api/insights/generate - Generate AI insights
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth
            .getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, {
                status: 401,
            });
        }

        const body: InsightGenerationRequest = await request.json();
        const { metrics, platform, dateRange, requireDeepAnalysis, query } =
            body;

        if (!metrics || Object.keys(metrics).length === 0) {
            return NextResponse.json(
                { error: "metrics are required" },
                { status: 400 },
            );
        }

        console.log("[Insights API] Generating insights for user:", user.id);

        // Retrieve relevant business context using RAG
        const queryText = query ||
            `Analyze marketing performance for ${platform || "all platforms"}`;
        const contextResults = await retrieveContext(user.id, queryText);
        const businessContext = formatContextForPrompt(contextResults);

        console.log(
            `[Insights API] Retrieved ${contextResults.length} relevant business contexts`,
        );

        // Calculate confidence score based on data quality
        const {
            calculateConfidenceScore,
            extractConfidenceFactors,
            shouldShowInsight,
        } = await import("@/lib/insights/confidence-scoring");

        const confidenceFactors = extractConfidenceFactors(
            metrics,
            contextResults,
            dateRange,
        );
        const confidenceScore = calculateConfidenceScore(confidenceFactors);

        console.log(
            `[Insights API] Confidence score: ${
                (confidenceScore * 100).toFixed(1)
            }%`,
            confidenceFactors,
        );

        // Only generate insight if confidence is sufficient
        if (!shouldShowInsight(confidenceScore)) {
            return NextResponse.json(
                {
                    error: "Insufficient data for reliable insights",
                    details: `Confidence score ${
                        (confidenceScore * 100).toFixed(1)
                    }% is below threshold. Please connect more data sources or wait for more data to accumulate.`,
                    confidenceScore,
                },
                { status: 400 },
            );
        }

        // Generate insights with appropriate model
        let insightResponse;

        if (requireDeepAnalysis) {
            console.log(
                "[Insights API] Using deep analysis (escalation model)",
            );
            insightResponse = await analyzeComplex(
                metrics,
                businessContext,
                platform,
            );
        } else {
            console.log("[Insights API] Using standard analysis (core model)");
            insightResponse = await generateInsight({
                metrics,
                context: businessContext,
                platform,
            });
        }

        // Save insight to database
        const { data: savedInsight, error: saveError } = await supabase
            .from("insights")
            .insert({
                user_id: user.id,
                content: insightResponse.insights,
                recommendations: insightResponse.recommendations,
                priority: insightResponse.priority,
                category: insightResponse.category,
                platform: platform || "all",
                model_used: insightResponse.modelUsed,
                tokens_used: insightResponse.tokensUsed,
                cost: insightResponse.cost,
                confidence_score: confidenceScore,
                metadata: {
                    dateRange,
                    metrics: Object.keys(metrics),
                    contextUsed: contextResults.length,
                    confidenceFactors,
                },
            })
            .select()
            .single();

        if (saveError) {
            console.error("[Insights API] Error saving insight:", saveError);
            // Don't fail the request, just log the error
        }

        console.log(
            `[Insights API] Generated insight using ${insightResponse.modelUsed} (${insightResponse.tokensUsed} tokens, $${
                insightResponse.cost.toFixed(4)
            })`,
        );

        return NextResponse.json({
            insight: {
                id: savedInsight?.id,
                content: insightResponse.insights,
                recommendations: insightResponse.recommendations,
                priority: insightResponse.priority,
                category: insightResponse.category,
                modelUsed: insightResponse.modelUsed,
                tokensUsed: insightResponse.tokensUsed,
                cost: insightResponse.cost,
                contextUsed: contextResults.length,
            },
        });
    } catch (error) {
        console.error("[Insights API] Error generating insight:", error);
        return NextResponse.json(
            {
                error: "Failed to generate insight",
                details: error instanceof Error
                    ? error.message
                    : "Unknown error",
            },
            { status: 500 },
        );
    }
}

/**
 * GET /api/insights/generate - Get recent insights
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth
            .getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, {
                status: 401,
            });
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "10");
        const platform = searchParams.get("platform");
        const priority = searchParams.get("priority");

        let query = supabase
            .from("insights")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (platform) {
            query = query.eq("platform", platform);
        }

        if (priority) {
            query = query.eq("priority", priority);
        }

        const { data: insights, error } = await query;

        if (error) {
            console.error("[Insights API] Error fetching insights:", error);
            throw error;
        }

        return NextResponse.json({ insights });
    } catch (error) {
        console.error("[Insights API] Error fetching insights:", error);
        return NextResponse.json(
            { error: "Failed to fetch insights" },
            { status: 500 },
        );
    }
}
