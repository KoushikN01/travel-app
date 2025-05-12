const express = require('express');
const router = express.Router();

// Sample destinations database
const destinations = [
  {
    destination: 'Paris',
    description: 'The city of lights and love, famous for the Eiffel Tower and world-class cuisine.',
    estimatedCost: '$1500',
    bestTimeToVisit: 'Spring',
    category: 'City'
  },
  {
    destination: 'Bali',
    description: 'Tropical paradise with beautiful beaches, lush rice terraces, and vibrant culture.',
    estimatedCost: '$1200',
    bestTimeToVisit: 'Summer',
    category: 'Beach'
  },
  {
    destination: 'Tokyo',
    description: 'A fascinating blend of traditional culture and cutting-edge technology.',
    estimatedCost: '$2000',
    bestTimeToVisit: 'Spring',
    category: 'City'
  },
  {
    destination: 'Santorini',
    description: 'Stunning Greek island with white-washed buildings and breathtaking sunsets.',
    estimatedCost: '$1800',
    bestTimeToVisit: 'Summer',
    category: 'Island'
  },
  {
    destination: 'Swiss Alps',
    description: 'Majestic mountain ranges perfect for skiing and hiking adventures.',
    estimatedCost: '$2500',
    bestTimeToVisit: 'Winter',
    category: 'Mountain'
  },
  {
    destination: 'Dubai',
    description: 'Ultra-modern city with luxury shopping, futuristic architecture, and desert adventures.',
    estimatedCost: '$2200',
    bestTimeToVisit: 'Winter',
    category: 'City'
  },
  {
    destination: 'Maldives',
    description: 'Pristine beaches, crystal-clear waters, and overwater bungalows.',
    estimatedCost: '$3000',
    bestTimeToVisit: 'Winter',
    category: 'Beach'
  },
  {
    destination: 'New York',
    description: 'The city that never sleeps, offering endless entertainment and cultural experiences.',
    estimatedCost: '$2000',
    bestTimeToVisit: 'Fall',
    category: 'City'
  },
  {
    destination: 'Kyoto',
    description: 'A historic Japanese city known for its ancient temples, traditional tea houses, and stunning autumn foliage.',
    estimatedCost: '$1800',
    bestTimeToVisit: 'Spring',
    category: 'Cultural'
    },
    
    {
    destination: 'Paris',
    description: 'The romantic capital of France, famous for its art, fashion, and the iconic Eiffel Tower.',
    destimatedCost: '$2200',
    bestTimeToVisit: 'Spring',
    category: 'City'
    },
    
    {
    destination: 'Santorini',
    description: 'A picturesque Greek island with whitewashed buildings, crystal-clear waters, and unforgettable sunsets.',
    destimatedCost: '$2500',
    bestTimeToVisit: 'Summer',
    category: 'Beach'
    },
    
    {
    destination: 'Banff',
    description: 'A breathtaking Canadian national park with turquoise lakes, snow-capped peaks, and wildlife adventures.',
    destimatedCost: '$1500',
    bestTimeToVisit: 'Summer',
    category: 'Nature'
    },
    
    {
    destination: 'Cape Town',
    description: 'A vibrant South African city with a mix of beaches, mountains, and rich cultural history.',
    destimatedCost: '$1700',
    bestTimeToVisit: 'Fall',
    category: 'Adventure'
    }
    
];

// POST /api/ai/recommendations
router.post('/recommendations', (req, res) => {
  // Get user preferences from request body
  const { budget, preferredSeason, category } = req.body;
  
  // Filter destinations based on preferences
  let recommendations = destinations;
  
  if (budget) {
    recommendations = recommendations.filter(dest => 
      parseInt(dest.estimatedCost.replace('$', '')) <= parseInt(budget)
    );
  }
  
  if (preferredSeason) {
    recommendations = recommendations.filter(dest => 
      dest.bestTimeToVisit.toLowerCase() === preferredSeason.toLowerCase()
    );
  }
  
  if (category) {
    recommendations = recommendations.filter(dest => 
      dest.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  // If no preferences or no matches, return random 4 destinations
  if (!recommendations.length || (!budget && !preferredSeason && !category)) {
    recommendations = destinations
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);
  }

  res.json({
    recommendations: recommendations
  });
});

module.exports = router; 