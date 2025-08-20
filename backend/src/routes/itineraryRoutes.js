import express from 'express';
import ItineraryController from '../controllers/itineraryController.js';

const router = express.Router();

router.post('/itinerary', ItineraryController.generate);
router.get('/recommendations', ItineraryController.topRecommendations);

export default router;