/**
 * Business Context Store Service
 *
 * Manages storage and retrieval of business context for RAG-enhanced insights
 */

import { createClient } from "@/lib/supabase/server";
import {
    cosineSimilarity,
    generateEmbedding,
} from "@/lib/api/embeddings-client";

export type ContextType =
    | "goal"
    | "kpi"
    | "brand"
    | "budget"
    | "campaign"
    | "industry";

export interface BusinessContext {
    id: string;
    user_id: string;
    context_type: ContextType;
    content: string;
    metadata?: Record<string, any>;
    embedding?: number[];
    created_at: string;
    updated_at: string;
}

export interface ContextSearchResult {
    context: BusinessContext;
    similarity: number;
}

const TOP_K = parseInt(process.env.RAG_TOP_K || "5");
const SIMILARITY_THRESHOLD = parseFloat(
    process.env.RAG_SIMILARITY_THRESHOLD || "0.7",
);

/**
 * Store business context with embedding
 */
export async function storeContext(
    userId: string,
    contextType: ContextType,
    content: string,
    metadata?: Record<string, any>,
): Promise<BusinessContext> {
    const supabase = await createClient();

    try {
        // Generate embedding
        const { embedding } = await generateEmbedding(content);

        // Store in database
        const { data, error } = await supabase
            .from("business_context")
            .insert({
                user_id: userId,
                context_type: contextType,
                content,
                metadata,
                embedding,
            })
            .select()
            .single();

        if (error) {
            console.error("[ContextStore] Error storing context:", error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error("[ContextStore] Failed to store context:", error);
        throw new Error(
            `Failed to store context: ${
                error instanceof Error ? error.message : "Unknown error"
            }`,
        );
    }
}

/**
 * Retrieve relevant context using semantic search
 */
export async function retrieveContext(
    userId: string,
    query: string,
    contextTypes?: ContextType[],
): Promise<ContextSearchResult[]> {
    const supabase = await createClient();

    try {
        // Generate query embedding
        const { embedding: queryEmbedding } = await generateEmbedding(query);

        // Build query
        let dbQuery = supabase
            .from("business_context")
            .select("*")
            .eq("user_id", userId);

        if (contextTypes && contextTypes.length > 0) {
            dbQuery = dbQuery.in("context_type", contextTypes);
        }

        const { data, error } = await dbQuery;

        if (error) {
            console.error("[ContextStore] Error retrieving context:", error);
            throw error;
        }

        if (!data || data.length === 0) {
            return [];
        }

        // Calculate similarities
        const results: ContextSearchResult[] = data
            .filter((ctx) => ctx.embedding && ctx.embedding.length > 0)
            .map((ctx) => ({
                context: ctx as BusinessContext,
                similarity: cosineSimilarity(queryEmbedding, ctx.embedding),
            }))
            .filter((result) => result.similarity >= SIMILARITY_THRESHOLD)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, TOP_K);

        console.log(
            `[ContextStore] Found ${results.length} relevant contexts for query`,
        );

        return results;
    } catch (error) {
        console.error("[ContextStore] Failed to retrieve context:", error);
        throw new Error(
            `Failed to retrieve context: ${
                error instanceof Error ? error.message : "Unknown error"
            }`,
        );
    }
}

/**
 * Update existing context
 */
export async function updateContext(
    contextId: string,
    content: string,
    metadata?: Record<string, any>,
): Promise<BusinessContext> {
    const supabase = await createClient();

    try {
        // Generate new embedding
        const { embedding } = await generateEmbedding(content);

        const { data, error } = await supabase
            .from("business_context")
            .update({
                content,
                metadata,
                embedding,
                updated_at: new Date().toISOString(),
            })
            .eq("id", contextId)
            .select()
            .single();

        if (error) {
            console.error("[ContextStore] Error updating context:", error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error("[ContextStore] Failed to update context:", error);
        throw new Error(
            `Failed to update context: ${
                error instanceof Error ? error.message : "Unknown error"
            }`,
        );
    }
}

/**
 * Delete context
 */
export async function deleteContext(contextId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from("business_context")
        .delete()
        .eq("id", contextId);

    if (error) {
        console.error("[ContextStore] Error deleting context:", error);
        throw error;
    }
}

/**
 * Get all context for a user
 */
export async function getAllContext(
    userId: string,
    contextType?: ContextType,
): Promise<BusinessContext[]> {
    const supabase = await createClient();

    let query = supabase
        .from("business_context")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (contextType) {
        query = query.eq("context_type", contextType);
    }

    const { data, error } = await query;

    if (error) {
        console.error("[ContextStore] Error getting all context:", error);
        throw error;
    }

    return (data || []) as BusinessContext[];
}

/**
 * Format context for prompt injection
 */
export function formatContextForPrompt(
    results: ContextSearchResult[],
): string[] {
    return results.map(({ context, similarity }) => {
        const typeLabel = context.context_type.toUpperCase();
        return `[${typeLabel}] (relevance: ${
            (similarity * 100).toFixed(0)
        }%)\n${context.content}`;
    });
}

/**
 * Batch store multiple contexts
 */
export async function batchStoreContext(
    userId: string,
    contexts: Array<{
        type: ContextType;
        content: string;
        metadata?: Record<string, any>;
    }>,
): Promise<BusinessContext[]> {
    const results: BusinessContext[] = [];

    for (const ctx of contexts) {
        try {
            const stored = await storeContext(
                userId,
                ctx.type,
                ctx.content,
                ctx.metadata,
            );
            results.push(stored);
        } catch (error) {
            console.error(
                `[ContextStore] Failed to store context: ${ctx.type}`,
                error,
            );
            // Continue with other contexts
        }
    }

    return results;
}
