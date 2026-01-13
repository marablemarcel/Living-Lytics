/**
 * Insight Detail API
 *
 * Handles individual insight operations: get, update, delete
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/insights/[id] - Get single insight
 */
export async function GET(
    request: NextRequest,
    context: RouteContext,
) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth
            .getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, {
                status: 401,
            });
        }

        const { id } = await context.params;

        const { data: insight, error } = await supabase
            .from("insights")
            .select("*")
            .eq("id", id)
            .eq("user_id", user.id)
            .single();

        if (error) {
            console.error("[Insight API] Error fetching insight:", error);
            return NextResponse.json({ error: "Insight not found" }, {
                status: 404,
            });
        }

        return NextResponse.json({ insight });
    } catch (error) {
        console.error("[Insight API] Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch insight" },
            { status: 500 },
        );
    }
}

/**
 * PATCH /api/insights/[id] - Update insight status or feedback
 */
export async function PATCH(
    request: NextRequest,
    context: RouteContext,
) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth
            .getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, {
                status: 401,
            });
        }

        const { id } = await context.params;
        const body = await request.json();

        const updates: Record<string, any> = {};

        // Handle view action
        if (body.action === "view" && !body.viewed_at) {
            updates.viewed_at = new Date().toISOString();
        }

        // Handle action completion
        if (body.action === "complete" && !body.actioned_at) {
            updates.actioned_at = new Date().toISOString();
        }

        // Handle dismiss
        if (body.action === "dismiss") {
            updates.dismissed = true;
        }

        // Handle feedback
        if (
            body.feedback && ["helpful", "not_helpful"].includes(body.feedback)
        ) {
            updates.feedback = body.feedback;
            updates.feedback_at = new Date().toISOString();
        }

        // Direct field updates (for backward compatibility)
        if (body.viewed_at !== undefined) updates.viewed_at = body.viewed_at;
        if (body.actioned_at !== undefined) {
            updates.actioned_at = body.actioned_at;
        }
        if (body.dismissed !== undefined) updates.dismissed = body.dismissed;

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: "No valid updates provided" },
                { status: 400 },
            );
        }

        const { data: insight, error } = await supabase
            .from("insights")
            .update(updates)
            .eq("id", id)
            .eq("user_id", user.id)
            .select()
            .single();

        if (error) {
            console.error("[Insight API] Error updating insight:", error);
            return NextResponse.json(
                { error: "Failed to update insight" },
                { status: 500 },
            );
        }

        return NextResponse.json({ insight });
    } catch (error) {
        console.error("[Insight API] Error:", error);
        return NextResponse.json(
            { error: "Failed to update insight" },
            { status: 500 },
        );
    }
}

/**
 * DELETE /api/insights/[id] - Delete insight
 */
export async function DELETE(
    request: NextRequest,
    context: RouteContext,
) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth
            .getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, {
                status: 401,
            });
        }

        const { id } = await context.params;

        const { error } = await supabase
            .from("insights")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);

        if (error) {
            console.error("[Insight API] Error deleting insight:", error);
            return NextResponse.json(
                { error: "Failed to delete insight" },
                { status: 500 },
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Insight API] Error:", error);
        return NextResponse.json(
            { error: "Failed to delete insight" },
            { status: 500 },
        );
    }
}
