import RAGService from '../services/ragService.js';

const ItineraryController = {
  async generate(req, res) {
    try {
      const preferences = req.body || {};
      const itinerary = await RAGService.generateItinerary(preferences);
      res.json(itinerary);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async topRecommendations(req, res) {
    try {
      const recommendations = await RAGService.getTopRecommendations();
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export default ItineraryController;