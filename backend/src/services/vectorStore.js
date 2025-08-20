import { GoogleGenerativeAI } from "@google/generative-ai";

let model = null;
try {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  model = genAI.getGenerativeModel({ model: "embedding-001" });
} catch (err) {
  // Non-fatal: will fallback to simple search when embedding is unavailable
  model = null;
}

// Simple in-memory store
const memoryStore = [];

// Cosine similarity implementation
function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }
  
  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);
  
  return magnitudeA && magnitudeB 
    ? dotProduct / (magnitudeA * magnitudeB) 
    : 0;
}

function matchesFilters(metadata = {}, filters = null) {
  if (!filters) return true;

  const normalize = (v) => String(v || '').toLowerCase();

  const toRegion = (raw) => {
    const s = normalize(raw);
    if (!s) return '';
    if (s.includes('north') || s.includes('grand baie') || s.includes('pamplemousses') || s.includes('trou aux biches') || s.includes('pereybere')) {
      return 'north';
    }
    if (s.includes('south') || s.includes('le morne') || s.includes('bel ombre') || s.includes('souillac') || s.includes('mahebourg') || s.includes('blue bay') || s.includes('chamarel')) {
      return 'south';
    }
    if (s.includes('east') || s.includes('belle mare') || s.includes('ile aux cerfs') || s.includes('trou d eau douce') || s.includes('flacq')) {
      return 'east';
    }
    if (s.includes('west') || s.includes('tamarin') || s.includes('flic en flac') || s.includes('black river') || s.includes('rivière noire')) {
      return 'west';
    }
    return s;
  };

  if (filters.location) {
    const wantedRegion = toRegion(filters.location);
    const itemRegion = toRegion(metadata.location);
    if (!wantedRegion || !itemRegion || wantedRegion !== itemRegion) return false;
  }

  if (Array.isArray(filters.activityTypes) && filters.activityTypes.length) {
    const activityKeywordsMap = {
      beach: ['beach', 'snorkel', 'snorkeling', 'coast', 'sea', 'sunset', 'lagoon'],
      hiking: ['hike', 'hiking', 'trail', 'mountain', 'brabant', 'le morne', 'walk', 'trek'],
      culture: ['culture', 'cultural', 'museum', 'temple', 'historic', 'heritage', 'church', 'local village'],
      food: ['food', 'restaurant', 'cuisine', 'dining', 'street food', 'seafood'],
      shopping: ['shopping', 'market', 'bazaar', 'mall', 'craft', 'souvenir'],
      wildlife: ['wildlife', 'park', 'reserve', 'turtle', 'dolphin', 'bird', 'botanical', 'garden', 'nature']
    };

    const textFields = [
      normalize(metadata.type),
      normalize(metadata.activity),
      normalize(metadata.name),
      normalize(metadata.location),
      normalize(metadata.description)
    ].filter(Boolean);

    const matchesAnySelected = filters.activityTypes.some((selected) => {
      const key = normalize(selected);
      const keywords = activityKeywordsMap[key] || [key];
      return textFields.some(tf => keywords.some(kw => tf.includes(kw)));
    });

    if (!matchesAnySelected) return false;
  }

  // Category/type filtering (e.g., hotels vs attractions)
  if (filters.category) {
    const wantedCategory = normalize(filters.category);
    const itemCategory = normalize(metadata.category);
    const itemType = normalize(metadata.type);
    if (!(itemCategory === wantedCategory || itemType === wantedCategory)) return false;
  }

  if (filters.type) {
    const wantedType = normalize(filters.type);
    const itemType = normalize(metadata.type);
    if (wantedType && itemType !== wantedType) return false;
  }

  // Accessibility filter
  if (filters.accessible) {
    const textify = (v) => String(v || '').toLowerCase();
    const isAccessible = () => {
      if (metadata.accessible === true) return true;
      const features = Array.isArray(metadata.features) ? metadata.features.map(textify) : [];
      const fields = [textify(metadata.description), textify(metadata.notes), textify(metadata.name), textify(metadata.type)];
      const keywords = ['accessible', 'wheelchair', 'wheel-chair', 'ramp', 'elevator', 'lift', 'step-free', 'no stairs', 'disabled'];
      if (features.some(f => keywords.some(k => f.includes(k)))) return true;
      if (fields.some(f => keywords.some(k => f.includes(k)))) return true;
      return false;
    };
    if (!isAccessible()) return false;
  }

  return true;
}

export async function addToStore(documents) {
  for (const doc of documents) {
    let embeddingValues = null;
    if (model) {
      try {
        const { embedding } = await model.embedContent(doc.content);
        embeddingValues = embedding.values;
      } catch (err) {
        embeddingValues = null;
      }
    }
    memoryStore.push({
      content: doc.content,
      embedding: embeddingValues,
      metadata: doc.metadata
    });
  }
  console.log(`Added ${documents.length} documents to vector store`);
}

export async function searchStore(query, k = 3, filters = null) {
  if (!memoryStore.length) return [];

  const filteredItems = memoryStore.filter(item => matchesFilters(item.metadata, filters));
  if (!filteredItems.length) return [];

  if (model) {
    try {
      const { embedding } = await model.embedContent(query);
      const queryVector = embedding.values;
      const results = filteredItems
        .filter(item => Array.isArray(item.embedding))
        .map(item => ({
          ...item,
          similarity: cosineSimilarity(queryVector, item.embedding)
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, k);
      if (results.length) return results;
    } catch (err) {
      // Fall through to keyword search
    }
  }

  // Fallback: simple keyword scoring
  const normalizedQuery = String(query || "").toLowerCase();
  const terms = normalizedQuery.split(/\W+/).filter(Boolean);
  const scored = filteredItems.map(item => {
    const text = String(item.content || "").toLowerCase();
    const score = terms.reduce((acc, term) => acc + (text.includes(term) ? 1 : 0), 0);
    return { ...item, similarity: score };
  });
  return scored
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, k);
}