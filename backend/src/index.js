import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import itineraryRoutes from './routes/itineraryRoutes.js';
import { addToStore } from './services/vectorStore.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS (dev: allow all)
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Use routes
app.use('/api', itineraryRoutes);

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: "Backend is working!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Dev-only: seed vector store with a few Mauritius attractions for demos/fallbacks
if (process.env.NODE_ENV !== 'production') {
  const seedDocuments = [
    {
      content: 'Chamarel Seven Colored Earth is a unique geological formation with sand dunes of seven distinct colors. Best visited in the morning to avoid crowds. Located in Chamarel, Mauritius.',
      metadata: {
        name: 'Chamarel Seven Colored Earth',
        category: 'attraction',
        type: 'Geological Formation',
        best_time: 'Morning',
        location: 'South',
        activity: 'sightseeing',
        description: 'Seven colored sand dunes in Chamarel',
        features: ['step-free viewpoint', 'ramp'],
        accessible: true,
        tips: [
          'Arrive early to avoid tour buses and harsh midday light.',
          'Combine with Chamarel Waterfall and the Ebony Forest for a compact South tour.',
          'Wear comfortable shoes; paths can be sandy and uneven.'
        ],
        guide: 'Start at the viewpoint to take in the dunes, then follow the marked paths around the fenced areas. Visit the nearby tortoise park and the coffee shop for local snacks. The on-site information boards explain the volcanic origins of the colors.'
      }
    },
    {
      content: 'Pamplemousses Botanical Garden, also known as Sir Seewoosagur Ramgoolam Botanical Garden, features giant water lilies and diverse tropical plants. Great for nature lovers.',
      metadata: {
        name: 'Pamplemousses Botanical Garden',
        category: 'attraction',
        type: 'Nature',
        best_time: 'Morning',
        location: 'North',
        activity: 'walking',
        description: 'Botanical garden with giant water lilies',
        features: ['wheelchair-accessible paths', 'accessible restrooms'],
        accessible: true,
        tips: [
          'Plan 1–2 hours to stroll the main avenues and lily ponds.',
          'Bring insect repellent and water; shade is plentiful but it gets humid.',
          'Consider hiring a local guide at the entrance for deeper context.'
        ],
        guide: 'Enter via the main gate and follow the central avenue to the giant Victoria amazonica lily pond. Continue to the spice garden and palm avenues. The on-site museum offers historical context about the island’s flora.'
      }
    },
    {
      content: 'Flic en Flac Beach on the West Coast offers white sand and clear waters ideal for swimming and snorkeling. Beautiful sunsets in the evening.',
      metadata: {
        name: 'Flic en Flac Beach',
        category: 'attraction',
        type: 'Beach',
        best_time: 'Evening',
        location: 'West',
        activity: 'beach',
        description: 'Popular beach with great sunsets',
        features: ['beach wheelchair access near main entrance'],
        tips: [
          'Arrive by late afternoon to find parking and enjoy golden hour.',
          'Reef shoes recommended if you plan to wade near coral areas.',
          'Local food trucks set up near the public beach on weekends.'
        ],
        guide: 'Set up near the public beach area where amenities are available. Swim inside the lagoon, then walk north towards Tamarin for quieter stretches. Stay for sunset—arguably one of the island’s best.'
      }
    },
    {
      content: 'Grand Baie in the North is a popular coastal village known for beaches like La Cuvette and Pereybere, with lively restaurants and shopping.',
      metadata: {
        name: 'Grand Baie',
        category: 'attraction',
        type: 'Beach',
        best_time: 'Morning',
        location: 'North',
        activity: 'beach',
        description: 'Lively coastal village in the North',
        features: ['ramp access at promenade'],
        tips: [
          'Visit La Cuvette for calmer water and fewer crowds.',
          'Pereybere is great for families; shallow entry and lifeguards.',
          'Parking fills up quickly on weekends—arrive before 9:30 AM.'
        ],
        guide: 'Begin at La Cuvette for a morning swim, then head to Sunset Boulevard for cafés and shopping. Continue to Pereybere Beach for lunch and an afternoon swim.'
      }
    },
    {
      content: 'Belle Mare on the East coast offers long stretches of white sand and a calm lagoon ideal for swimming and water sports.',
      metadata: {
        name: 'Belle Mare Beach',
        category: 'attraction',
        type: 'Beach',
        best_time: 'Morning',
        location: 'East',
        activity: 'beach',
        description: 'Long white sand beach with calm lagoon',
        features: ['parking close to beach entrance'],
        tips: [
          'Arrive early for calm water and fewer crowds.',
          'Great spot for sunrise photography.',
          'Vendors rent kayaks and paddleboards along the public stretch.'
        ],
        guide: 'Park near the public beach, then walk south along the lagoon. Water sports centers offer rentals; keep within the marked lagoon for safety.'
      }
    },
    {
      content: 'Ile aux Cerfs is a small island on the East known for its turquoise waters, beach clubs, and water activities; accessible by boat from Trou d’Eau Douce.',
      metadata: {
        name: 'Ile aux Cerfs',
        category: 'attraction',
        type: 'Island',
        best_time: 'Morning',
        location: 'East',
        activity: 'beach',
        description: 'East coast island with water activities',
        features: ['assistance available for boarding boats'],
        tips: [
          'Book a return boat in advance and confirm last departure time.',
          'Bring cash for beach club food and optional activities.',
          'Shade is limited—bring a hat and sunscreen.'
        ],
        guide: 'Depart from Trou d’Eau Douce jetty; boats run frequently. Upon arrival, pick a beach area near facilities or walk further for quiet coves. Consider parasailing or a lagoon tour.'
      }
    },
    // Hotels
    {
      content: 'LUX Grand Gaube is a luxury beachfront resort in the North with multiple pools, dining options, and spa facilities.',
      metadata: { name: 'LUX Grand Gaube', category: 'hotel', type: 'Hotel', location: 'North', price_range: '$$$', description: 'Luxury beachfront resort', features: ['elevator', 'step-free access', 'accessible rooms'], accessible: true }
    },
    {
      content: 'The St. Regis Mauritius Resort is a luxury property near Le Morne in the South, offering ocean-view rooms and fine dining.',
      metadata: { name: 'The St. Regis Mauritius Resort', category: 'hotel', type: 'Hotel', location: 'South', price_range: '$$$', description: 'Luxury resort near Le Morne', features: ['ramp', 'elevator', 'accessible bathrooms'], accessible: true }
    },
    {
      content: 'SALT of Palmar is a boutique hotel on the East coast focusing on local experiences and cuisine.',
      metadata: { name: 'SALT of Palmar', category: 'hotel', type: 'Hotel', location: 'East', price_range: '$$', description: 'Boutique hotel on the East coast', features: ['step-free lobby'] }
    },
    {
      content: 'La Pirogue is a beachfront resort in Flic en Flac on the West, known for coconut groves and sunset views.',
      metadata: { name: 'La Pirogue', category: 'hotel', type: 'Hotel', location: 'West', price_range: '$$', description: 'Beachfront resort in Flic en Flac', features: ['ground-floor rooms available'] }
    }
  ];
  addToStore(seedDocuments).then(() => {
    console.log('Vector store seeded with demo documents');
  }).catch((err) => {
    console.warn('Vector store seeding failed:', err?.message || err);
  });
}