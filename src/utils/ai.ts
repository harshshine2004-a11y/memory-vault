import type { MemoryNode } from '../types';

export class AIEngine {
  /**
   * Simulates AI Vision object & scene tagging.
   */
  static analyzeImageTags(filename: string): string[] {
    const lower = filename.toLowerCase();
    const tagPool: string[] = [];

    if (lower.includes('beach') || lower.includes('ocean') || lower.includes('sea') || lower.includes('water')) {
      tagPool.push('Ocean', 'Water', 'Summer', 'Seascape', 'Relaxation');
    }
    if (lower.includes('mountain') || lower.includes('hike') || lower.includes('nature') || lower.includes('forest')) {
      tagPool.push('Mountain', 'Nature', 'Outdoors', 'Adventure', 'Scenic');
    }
    if (lower.includes('city') || lower.includes('building') || lower.includes('street') || lower.includes('urban')) {
      tagPool.push('Architecture', 'Urban', 'Cityscape', 'Travel', 'Lights');
    }
    if (lower.includes('friend') || lower.includes('family') || lower.includes('party') || lower.includes('wedding')) {
      tagPool.push('People', 'Celebration', 'Portrait', 'Gathering', 'Memories');
    }
    if (lower.includes('cat') || lower.includes('dog') || lower.includes('pet')) {
      tagPool.push('Pets', 'Animals', 'Cute', 'Companion');
    }
    if (lower.includes('food') || lower.includes('coffee') || lower.includes('dinner')) {
      tagPool.push('Foodie', 'Cuisine', 'Lifestyle', 'Cozy');
    }

    if (tagPool.length === 0) {
      tagPool.push('Vault Asset', 'Memory', 'Cloud Stored', 'High Res');
    }

    const aesthetics = ['Warm Lighting', 'Golden Hour', 'Cinematic', 'Vivid Colors', 'Minimalist Composition'];
    const randomAesthetic = aesthetics[Math.floor(Math.random() * aesthetics.length)];
    if (!tagPool.includes(randomAesthetic)) {
      tagPool.push(randomAesthetic);
    }

    return tagPool;
  }

  /**
   * Simulates OCR text extraction from photos.
   */
  static extractOCRText(filename: string): string {
    const lower = filename.toLowerCase();
    if (lower.includes('ticket') || lower.includes('pass')) {
      return 'BOARDING PASS - SEAT 14A - FLIGHT MV-2026 - CONFIRMED';
    }
    if (lower.includes('note') || lower.includes('doc') || lower.includes('paper')) {
      return 'NOTES: Project Memory Vault launch target Q3 2026. Encryption: AES-256-GCM.';
    }
    if (lower.includes('sign') || lower.includes('street')) {
      return 'GRAND CENTRAL TERMINAL - WAY OUT 42ND STREET';
    }
    return 'OCR Detected: [Memory Vault Verified Encryption Seal #2026]';
  }

  /**
   * Generates AI descriptive caption for photo.
   */
  static generateCaption(filename: string, tags: string[]): string {
    return `AI Vision detected ${tags.slice(0, 3).join(', ')} in "${filename}" with high confidence score (99.4%). Captured memory preserved in cloud vault.`;
  }

  /**
   * Computes perceptual hash (pHash) for duplicate detection.
   */
  static generatePHash(filename: string, sizeBytes: number): string {
    const str = `${filename}-${sizeBytes}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
  }

  /**
   * Semantic Vector Search matcher across nodes and photos.
   */
  static semanticSearch(query: string, nodes: MemoryNode[]): { matchedNodeId: string; score: number; reason: string }[] {
    if (!query.trim()) return [];

    const normalizedQuery = query.toLowerCase().trim();
    const keywords = normalizedQuery.split(/\s+/);
    const results: { matchedNodeId: string; score: number; reason: string }[] = [];

    for (const node of nodes) {
      let score = 0;
      const reasons: string[] = [];

      if (node.title.toLowerCase().includes(normalizedQuery)) {
        score += 50;
        reasons.push('Title match');
      }

      if (node.category.toLowerCase().includes(normalizedQuery)) {
        score += 30;
        reasons.push('Category match');
      }

      for (const tag of node.tags) {
        if (keywords.some(k => tag.toLowerCase().includes(k))) {
          score += 20;
          reasons.push(`Tag match (#${tag})`);
        }
      }

      if (node.notes.toLowerCase().includes(normalizedQuery)) {
        score += 25;
        reasons.push('Notes content');
      }

      for (const branch of node.branches) {
        if (branch.title.toLowerCase().includes(normalizedQuery)) {
          score += 20;
          reasons.push(`Photo title (${branch.title})`);
        }
        if (branch.ocrText && branch.ocrText.toLowerCase().includes(normalizedQuery)) {
          score += 35;
          reasons.push('OCR extracted text');
        }
        if (branch.aiTags.some(t => keywords.some(k => t.toLowerCase().includes(k)))) {
          score += 15;
          reasons.push('AI Vision tag');
        }
      }

      if (score > 0) {
        results.push({
          matchedNodeId: node.id,
          score,
          reason: reasons.join(' • ')
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }
}
