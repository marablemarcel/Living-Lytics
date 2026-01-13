import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
    getAggregatedMetrics,
    getAggregatedTotals,
} from "@/lib/services/metrics-aggregation-service";

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

        // Get query parameters
        const searchParams = request.nextUrl.searchParams;
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        if (!startDate || !endDate) {
            return NextResponse.json(
                { error: "Missing required parameters: startDate, endDate" },
                { status: 400 },
            );
        }

        // Fetch aggregated daily metrics
        const dailyMetrics = await getAggregatedMetrics(
            user.id,
            startDate,
            endDate,
        );

        // Fetch aggregated totals
        const totals = await getAggregatedTotals(user.id, startDate, endDate);

        return NextResponse.json({
            daily: dailyMetrics,
            totals: totals,
        });
    } catch (error) {
        console.error("Error in aggregated metrics API:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
