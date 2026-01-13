/**
 * OpenAI Embeddings Client for RAG
 *
 * Handles text embedding generation for business context storage and retrieval
 */

import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL ||
    "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = parseInt(
    process.env.OPENAI_EMBEDDING_DIMENSIONS || "1536",
);

// Simple in-memory cache for embeddings
const embeddingCache = new Map<string, number[]>();

export interface EmbeddingResult {
    embedding: number[];
    tokens: number;
    cached: boolean;
}

/**
 * Generate embedding for a single text
 */
export async function generateEmbedding(
    text: string,
): Promise<EmbeddingResult> {
    // Check cache first
    const cacheKey = `${text.substring(0, 100)}`;
    if (embeddingCache.has(cacheKey)) {
        return {
            embedding: embeddingCache.get(cacheKey)!,
            tokens: 0,
            cached: true,
        };
    }

    try {
        const response = await openai.embeddings.create({
            model: EMBEDDING_MODEL,
            input: text,
            dimensions: EMBEDDING_DIMENSIONS,
        });

        const embedding = response.data[0].embedding;
        const tokens = response.usage?.total_tokens || 0;

        // Cache the result
        embeddingCache.set(cacheKey, embedding);

        return {
            embedding,
            tokens,
            cached: false,
        };
    } catch (error) {
        console.error("[Embeddings] Error generating embedding:", error);
        throw new Error(
            `Failed to generate embedding: ${
                error instanceof Error ? error.message : "Unknown error"
            }`,
        );
    }
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function batchEmbed(texts: string[]): Promise<EmbeddingResult[]> {
    // Process in batches of 100 (OpenAI limit)
    const batchSize = 100;
    const results: EmbeddingResult[] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);

        // Check which are cached
        const uncachedIndices: number[] = [];
        const uncachedTexts: string[] = [];

        batch.forEach((text, idx) => {
            const cacheKey = `${text.substring(0, 100)}`;
            if (!embeddingCache.has(cacheKey)) {
                uncachedIndices.push(idx);
                uncachedTexts.push(text);
            }
        });

        // Fetch uncached embeddings
        if (uncachedTexts.length > 0) {
            try {
                const response = await openai.embeddings.create({
                    model: EMBEDDING_MODEL,
                    input: uncachedTexts,
                    dimensions: EMBEDDING_DIMENSIONS,
                });

                // Cache new embeddings
                uncachedTexts.forEach((text, idx) => {
                    const cacheKey = `${text.substring(0, 100)}`;
                    embeddingCache.set(cacheKey, response.data[idx].embedding);
                });
            } catch (error) {
                console.error("[Embeddings] Error in batch embedding:", error);
                throw error;
            }
        }

        // Collect all results for this batch
        batch.forEach((text) => {
            const cacheKey = `${text.substring(0, 100)}`;
            const embedding = embeddingCache.get(cacheKey)!;
            results.push({
                embedding,
                tokens: 0, // Tokens already counted during generation
                cached: !uncachedIndices.includes(results.length),
            });
        });
    }

    return results;
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
        throw new Error("Embeddings must have the same dimensions");
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Clear embedding cache
 */
export function clearCache(): void {
    embeddingCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; keys: string[] } {
    return {
        size: embeddingCache.size,
        keys: Array.from(embeddingCache.keys()),
    };
}
