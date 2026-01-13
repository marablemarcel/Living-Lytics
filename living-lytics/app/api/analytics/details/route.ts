import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGAClientForUser } from "@/lib/api/google-analytics";

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

        // Get GA client
        const gaData = await getGAClientForUser();

        if (!gaData || !gaData.propertyId) {
            return NextResponse.json({
                topPages: [],
                trafficSources: [],
                message: "No Google Analytics property configured",
            });
        }

        const { client, propertyId } = gaData;

        // Fetch data with individual error handling
        let topPages: any[] = [];
        let trafficSources: any[] = [];

        try {
            topPages = await client.getTopPages(
                propertyId,
                startDate,
                endDate,
                10,
            );
        } catch (error) {
            console.error("Error fetching top pages:", error);
        }

        try {
            trafficSources = await client.getTrafficSources(
                propertyId,
                startDate,
                endDate,
            );
        } catch (error) {
            console.error("Error fetching traffic sources:", error);
        }

        return NextResponse.json({
            topPages,
            trafficSources,
        });
    } catch (error) {
        console.error("Error in analytics details API:", error);
        console.error(
            "Error message:",
            error instanceof Error ? error.message : "Unknown",
        );

        return NextResponse.json(
            {
                error: "Internal server error",
                message: error instanceof Error
                    ? error.message
                    : "Unknown error",
            },
            { status: 500 },
        );
    }
}
