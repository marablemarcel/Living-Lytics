/**
 * Batch Insight Generation Edge Function
 *
 * Generates insights for all users with connected data sources
 * Designed to be called by Supabase cron jobs or manually
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

interface GenerationResult {
    userId: string;
    success: boolean;
    error?: string;
    insightId?: string;
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Create Supabase client with service role key
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        console.log("[Batch Generation] Starting batch insight generation");

        // Get all users with connected data sources
        const { data: sources, error: sourcesError } = await supabase
            .from("data_sources")
            .select("user_id, platform, last_synced_at")
            .eq("status", "connected")
            .not("last_synced_at", "is", null);

        if (sourcesError) {
            throw new Error(
                `Failed to fetch data sources: ${sourcesError.message}`,
            );
        }

        // Group by user_id to get unique users
        const uniqueUsers = [...new Set(sources?.map((s) => s.user_id) || [])];
        console.log(
            `[Batch Generation] Found ${uniqueUsers.length} users with connected sources`,
        );

        const results: GenerationResult[] = [];

        // Process each user
        for (const userId of uniqueUsers) {
            try {
                // Check if user already has recent insights (within last 7 days)
                const sevenDaysAgo = new Date(
                    Date.now() - 7 * 24 * 60 * 60 * 1000,
                ).toISOString();
                const { data: recentInsights } = await supabase
                    .from("insights")
                    .select("id")
                    .eq("user_id", userId)
                    .gte("created_at", sevenDaysAgo)
                    .limit(1);

                if (recentInsights && recentInsights.length > 0) {
                    console.log(
                        `[Batch Generation] User ${userId} already has recent insights, skipping`,
                    );
                    results.push({
                        userId,
                        success: true,
                        error: "Recent insights exist",
                    });
                    continue;
                }

                // Fetch aggregated metrics for the user
                const endDate = new Date();
                const startDate = new Date(
                    Date.now() - 30 * 24 * 60 * 60 * 1000,
                );

                // Call the internal insights generation API
                const appUrl = Deno.env.get("APP_URL") ||
                    supabaseUrl.replace(".supabase.co", ".vercel.app");
                const response = await fetch(
                    `${appUrl}/api/insights/generate`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${supabaseServiceKey}`,
                        },
                        body: JSON.stringify({
                            userId, // Pass userId for service role authentication
                            metrics: {}, // Will be fetched by the API
                            platform: "all",
                            dateRange: {
                                start: startDate.toISOString(),
                                end: endDate.toISOString(),
                            },
                        }),
                    },
                );

                if (response.ok) {
                    const data = await response.json();
                    results.push({
                        userId,
                        success: true,
                        insightId: data.insight?.id,
                    });
                    console.log(
                        `[Batch Generation] Generated insight for user ${userId}`,
                    );
                } else {
                    const errorData = await response.json();
                    results.push({
                        userId,
                        success: false,
                        error: errorData.details || errorData.error,
                    });
                    console.error(
                        `[Batch Generation] Failed for user ${userId}:`,
                        errorData,
                    );
                }

                // Rate limiting: wait 2 seconds between users to avoid overwhelming the API
                await new Promise((resolve) => setTimeout(resolve, 2000));
            } catch (error) {
                console.error(
                    `[Batch Generation] Error for user ${userId}:`,
                    error,
                );
                results.push({
                    userId,
                    success: false,
                    error: error instanceof Error
                        ? error.message
                        : "Unknown error",
                });
            }
        }

        const successCount = results.filter((r) => r.success).length;
        const errorCount = results.filter((r) => !r.success).length;

        console.log(
            `[Batch Generation] Completed: ${successCount} success, ${errorCount} errors`,
        );

        return new Response(
            JSON.stringify({
                success: true,
                totalUsers: uniqueUsers.length,
                successCount,
                errorCount,
                results,
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            },
        );
    } catch (error) {
        console.error("[Batch Generation] Fatal error:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 500,
            },
        );
    }
});
