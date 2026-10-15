const OpenAI = require('openai');
const config = require('../config/env');

let openaiClient = null;
if (config.OPENAI_API_KEY) {
  openaiClient = new OpenAI({ apiKey: config.OPENAI_API_KEY });
}

// Tokenizer & Stopwords helper for local TF-IDF semantic vector representation
const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can\'t', 'cannot', 'could',
  'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have',
  'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is',
  'it', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on',
  'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should',
  'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these',
  'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what',
  'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself'
]);

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w));
}

function computeTF(tokens) {
  const tf = {};
  for (const t of tokens) {
    tf[t] = (tf[t] || 0) + 1;
  }
  const total = tokens.length || 1;
  for (const t in tf) {
    tf[t] = tf[t] / total;
  }
  return tf;
}

function cosineSimilarity(vecA, vecB) {
  if (Array.isArray(vecA) && Array.isArray(vecB)) {
    // Standard numerical embedding vector
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  } else if (typeof vecA === 'object' && typeof vecB === 'object') {
    // Sparse dictionary vector (TF-IDF)
    let dot = 0, normA = 0, normB = 0;
    for (const key in vecA) {
      if (vecB[key]) {
        dot += vecA[key] * vecB[key];
      }
      normA += vecA[key] * vecA[key];
    }
    for (const key in vecB) {
      normB += vecB[key] * vecB[key];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }
  return 0;
}

const vectorService = {
  /**
   * Generate vector embedding for a single text chunk
   */
  async generateEmbedding(text) {
    if (config.OPENAI_API_KEY && openaiClient) {
      try {
        const response = await openaiClient.embeddings.create({
          model: config.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
          input: text.slice(0, 8000),
        });
        return {
          type: 'dense',
          vector: response.data[0].embedding
        };
      } catch (err) {
        console.warn('[VectorService] OpenAI embedding failed, using local semantic representation:', err.message);
      }
    }

    // Local sparse vector
    const tokens = tokenize(text);
    return {
      type: 'sparse',
      vector: computeTF(tokens),
      tokens
    };
  },

  /**
   * Search and rank chunks against a query vector
   */
  async findSimilarChunks(query, chunks, topK = 4, threshold = 0.08) {
    if (!chunks || chunks.length === 0) return [];

    const queryTokens = tokenize(query);
    const querySparseTF = computeTF(queryTokens);

    let queryDense = null;
    if (config.OPENAI_API_KEY && openaiClient) {
      try {
        const resp = await openaiClient.embeddings.create({
          model: config.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
          input: query,
        });
        queryDense = resp.data[0].embedding;
      } catch (e) {
        // fallback
      }
    }

    const scored = chunks.map(chunk => {
      let score = 0;
      if (chunk.embedding) {
        if (chunk.embedding.type === 'dense' && queryDense) {
          score = cosineSimilarity(queryDense, chunk.embedding.vector);
        } else if (chunk.embedding.type === 'sparse') {
          score = cosineSimilarity(querySparseTF, chunk.embedding.vector);
        }
      }

      // Hybrid keyword boost for exact technical/academic terms
      const chunkLower = (chunk.content || '').toLowerCase();
      let matchCount = 0;
      for (const t of queryTokens) {
        if (chunkLower.includes(t)) {
          matchCount++;
        }
      }
      const keywordBoost = queryTokens.length > 0 ? (matchCount / queryTokens.length) * 0.4 : 0;
      const finalScore = (score * 0.6) + keywordBoost;

      return {
        ...chunk,
        score: parseFloat(finalScore.toFixed(4)),
        relevancePercentage: Math.min(100, Math.round(finalScore * 100))
      };
    });

    return scored
      .filter(item => item.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
};

module.exports = vectorService;
