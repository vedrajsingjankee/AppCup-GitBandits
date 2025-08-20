import { addToStore, searchStore } from "../services/vectorStore.js";

class VectorDB {
  async initialize() {
    try {
      await addToStore([
        {
          content: "Le Morne Brabant: UNESCO heritage site with hiking trails and historical significance",
          metadata: { type: "hiking", location: "south" }
        },
        {
          content: "Chamarel Seven Colored Earth: Unique geological formation with colored sands",
          metadata: { type: "sightseeing", location: "south" }
        },
        {
          content: "Port Louis Market: Vibrant local market with crafts and street food",
          metadata: { type: "shopping", location: "north" }
        },
        {
          content: "Ile aux Cerfs: Beautiful island with beaches and water sports",
          metadata: { type: "beach", location: "east" }
        }
      ]);
      console.log("VectorDB initialized successfully");
    } catch (error) {
      console.error("VectorDB initialization failed:", error);
    }
  }

  async search(query, filters = {}) {
    try {
      const results = await searchStore(query, 5);
      
      // Apply filters
      return Object.keys(filters).length > 0
        ? results.filter(item => {
            return Object.entries(filters).every(([key, value]) => 
              item.metadata[key] === value
            );
          })
        : results;
    } catch (error) {
      console.error("Vector search failed:", error);
      return [];
    }
  }
}

export default new VectorDB();