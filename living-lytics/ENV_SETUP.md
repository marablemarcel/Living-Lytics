# Environment Configuration for OpenAI GPT Integration

# Copy this file to .env.local and fill in your values

# ============================================
# OpenAI API Configuration
# ============================================

# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-your-key-here

# ============================================
# Model Configuration
# ============================================

# Core Model (handles 90% of queries)
OPENAI_CORE_MODEL=gpt-4o-mini
OPENAI_CORE_MAX_TOKENS=1500
OPENAI_CORE_TEMPERATURE=0.7

# Escalation Model (handles complex queries)
OPENAI_ESCALATION_MODEL=gpt-4o
OPENAI_REASONING_MODEL=o1-mini
OPENAI_ESCALATION_MAX_TOKENS=3000
OPENAI_ESCALATION_TEMPERATURE=0.3

# Embeddings Model (for RAG)
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_EMBEDDING_DIMENSIONS=1536

# ============================================
# RAG Configuration
# ============================================

# Number of context items to retrieve
RAG_TOP_K=5

# Minimum similarity threshold (0-1)
RAG_SIMILARITY_THRESHOLD=0.7

# ============================================
# Cost Controls
# ============================================

# Maximum percentage of queries that can use escalation model
MAX_ESCALATION_PERCENTAGE=10

# Enable detailed cost tracking
ENABLE_COST_TRACKING=true

# ============================================
# Existing Configuration
# ============================================
# Keep all your existing environment variables below
# (Supabase, Google Analytics, Facebook, etc.)
