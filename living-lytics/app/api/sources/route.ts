import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/sources
 * Returns all data sources for the authenticated user
 */
export async function GET() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, {
                status: 401,
            });
        }

        const { data: sources, error: sourcesError } = await supabase
            .from("data_sources")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (sourcesError) {
            console.error("Error fetching data sources:", sourcesError);
            return NextResponse.json(
                { error: "Failed to fetch data sources" },
                { status: 500 },
            );
        }

        // Count connected sources
        const connectedCount = sources?.filter(
            (source) => source.connection_status === "connected",
        ).length || 0;

        return NextResponse.json({
            sources: sources || [],
            connectedCount,
            totalCount: sources?.length || 0,
        });
    } catch (error) {
        console.error("Error in GET /api/sources:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
