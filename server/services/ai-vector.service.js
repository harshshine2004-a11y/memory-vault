class AIVectorService {
  /**
   * Simulates vector embedding generation for semantic search (pgvector / Qdrant compatible 512-dim vector array).
   */
  generateVectorEmbedding(text) {
    const vector = new Array(512).fill(0).map(() => (Math.random() - 0.5) * 2);
    return vector;
  }

  /**
   * Calculates cosine similarity score between query vector and node vector.
   */
  calculateSimilarity(vecA, vecB) {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
  }
}

module.exports = new AIVectorService();
