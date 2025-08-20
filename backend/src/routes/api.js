import express from 'express';
import ItineraryController from '../controllers/itineraryController.js';

const router = express.Router();

// Generate personalized itinerary
router.post('/itinerary', ItineraryController.generate);

// Get top recommendations
router.get('/recommendations', ItineraryController.topRecommendations);

export default router;