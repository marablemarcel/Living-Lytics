/**
 * Business Context Management API
 *
 * Endpoints for managing business context (goals, KPIs, brand, etc.) for RAG
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
    type ContextType,
    deleteContext,
    getAllContext,
    storeContext,
    updateContext,
} from "@/lib/services/context-store-service";

/**
 * GET /api/context - Retrieve user's business context
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
        const contextType = searchParams.get("type") as ContextType | null;

        const contexts = await getAllContext(user.id, contextType || undefined);

        return NextResponse.json({ contexts });
    } catch (error) {
        console.error("[API] Error fetching context:", error);
        return NextResponse.json(
            { error: "Failed to fetch context" },
            { status: 500 },
        );
    }
}

/**
 * POST /api/context - Add new business context
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

        const body = await request.json();
        const { context_type, content, metadata } = body;

        if (!context_type || !content) {
            return NextResponse.json(
                { error: "context_type and content are required" },
                { status: 400 },
            );
        }

        const validTypes: ContextType[] = [
            "goal",
            "kpi",
            "brand",
            "budget",
            "campaign",
            "industry",
        ];
        if (!validTypes.includes(context_type)) {
            return NextResponse.json(
                {
                    error: `Invalid context_type. Must be one of: ${
                        validTypes.join(", ")
                    }`,
                },
                { status: 400 },
            );
        }

        const context = await storeContext(
            user.id,
            context_type,
            content,
            metadata,
        );

        return NextResponse.json({ context }, { status: 201 });
    } catch (error) {
        console.error("[API] Error creating context:", error);
        return NextResponse.json(
            { error: "Failed to create context" },
            { status: 500 },
        );
    }
}

/**
 * PUT /api/context - Update existing context
 */
export async function PUT(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth
            .getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, {
                status: 401,
            });
        }

        const body = await request.json();
        const { id, content, metadata } = body;

        if (!id || !content) {
            return NextResponse.json(
                { error: "id and content are required" },
                { status: 400 },
            );
        }

        const context = await updateContext(id, content, metadata);

        return NextResponse.json({ context });
    } catch (error) {
        console.error("[API] Error updating context:", error);
        return NextResponse.json(
            { error: "Failed to update context" },
            { status: 500 },
        );
    }
}

/**
 * DELETE /api/context - Delete context
 */
export async function DELETE(request: NextRequest) {
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
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "id is required" },
                { status: 400 },
            );
        }

        await deleteContext(id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[API] Error deleting context:", error);
        return NextResponse.json(
            { error: "Failed to delete context" },
            { status: 500 },
        );
    }
}
