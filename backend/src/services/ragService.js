import { GoogleGenerativeAI } from "@google/generative-ai";
import { searchStore } from './vectorStore.js';
import {
  generateItineraryPrompt,
  topRecommendationsPrompt
} from './promptService.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

class RAGService {

  async generateItinerary(preferences) {
    const query = `Activities for ${Array.isArray(preferences?.activityTypes) ? preferences.activityTypes.join(', ') : (preferences?.activityTypes || 'tourists')} in ${preferences?.location || 'Mauritius'}`;
    const attractionsContext = await searchStore(query, 10, {
      location: preferences?.location,
      activityTypes: preferences?.activityTypes,
      accessible: Boolean(preferences?.accessible)
    });

    // Search for hotels separately
    const hotelsContext = await searchStore('Recommended hotels', 5, {
      location: preferences?.location,
      category: 'hotel',
      accessible: Boolean(preferences?.accessible)
    });

    const combinedContext = [...(attractionsContext || []), ...(hotelsContext || [])];

    const prompt = generateItineraryPrompt(preferences || {}, combinedContext || []);

    let text;
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('Missing API key');
      }
      const result = await model.generateContent(prompt);
      const response = await result.response;
      text = response.text();
    } catch (error) {
      console.warn('Falling back to simple itinerary because LLM request failed or GEMINI_API_KEY missing. Reason:', error?.message || error);
      // Fallback simple itinerary assembled from vector context
      const top = (attractionsContext || []).slice(0, 3);
      return {
        destination: preferences?.location || 'Mauritius',
        summary: 'Personalized one-day plan based on available context.',
        itinerary: top.map((item, idx) => ({
          time: idx === 0 ? 'Morning (8:00 AM - 12:00 PM)' : idx === 1 ? 'Afternoon (1:00 PM - 5:00 PM)' : 'Evening (6:00 PM onwards)',
          activity: item?.metadata?.activity || 'Explore local attraction',
          location: item?.metadata?.location || (preferences?.location || 'Mauritius'),
          description: item?.content?.slice(0, 200) || 'Enjoy a local highlight based on your preferences.',
          duration: idx === 2 ? '2-3 hours' : '3-4 hours',
          accessible_features: item?.metadata?.features || []
        })),
        hotel_recommendation: {
          name: hotelsContext?.[0]?.metadata?.name || 'Local Hotel',
          location: hotelsContext?.[0]?.metadata?.location || (preferences?.location || 'Mauritius'),
          description: hotelsContext?.[0]?.content?.slice(0, 160) || 'A comfortable stay close to your activities.',
          price_range: hotelsContext?.[0]?.metadata?.price_range || (preferences?.budget === 'high' ? '$$$' : preferences?.budget === 'medium' ? '$$' : '$'),
          accessible_features: hotelsContext?.[0]?.metadata?.features || []
        },
        additional_tips: 'Consider travel time between activities and stay hydrated.'
      };
    }

    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      return jsonMatch ? JSON.parse(jsonMatch[1]) : JSON.parse(text);
    } catch (e) {
      console.error('Error parsing JSON from generateItinerary:', text);
      throw new Error('Failed to generate itinerary');
    }
  }

  async getTopRecommendations() {
    const context = await searchStore('Top attractions in Mauritius', 10, null);
    const prompt = topRecommendationsPrompt(context || []);

    let text;
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('Missing API key');
      }
      const result = await model.generateContent(prompt);
      const response = await result.response;
      text = response.text();
    } catch (error) {
      console.warn('Falling back to simple recommendations because LLM request failed or GEMINI_API_KEY missing. Reason:', error?.message || error);
      const top = (context || []).slice(0, 3);
      return {
        recommendations: top.map(item => ({
          name: item?.metadata?.name || 'Attraction',
          type: item?.metadata?.type || 'Attraction',
          description: item?.content?.slice(0, 160) || 'A local highlight worth visiting.',
          best_time: item?.metadata?.best_time || 'Morning',
          location: item?.metadata?.location || 'Mauritius'
        }))
      };
    }

    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      return jsonMatch ? JSON.parse(jsonMatch[1]) : JSON.parse(text);
    } catch (e) {
      console.error('Error parsing JSON from getTopRecommendations:', text);
      throw new Error('Failed to get recommendations');
    }
  }
}

export default new RAGService();