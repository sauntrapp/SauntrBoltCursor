// Mock data for development
const MOCK_REVIEWS = [
  {
    id: 'review_1',
    author: 'Sarah M.',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
    rating: 5,
    text: 'Absolutely stunning views and incredible cocktails! The atmosphere is perfect for a romantic evening.',
    date: '2024-01-15',
    helpful: 12
  },
  {
    id: 'review_2',
    author: 'Mike R.',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
    rating: 4,
    text: 'Great food and service. The rooftop setting is amazing, though it can get a bit crowded on weekends.',
    date: '2024-01-10',
    helpful: 8
  },
  {
    id: 'review_3',
    author: 'Emma L.',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
    rating: 5,
    text: 'Perfect spot for special occasions. The staff went above and beyond to make our anniversary memorable.',
    date: '2024-01-08',
    helpful: 15
  }
];

const generateRandomReviews = () => {
  const authors = ['Alex K.', 'Jordan P.', 'Taylor S.', 'Casey M.', 'Riley D.', 'Morgan B.', 'Avery C.'];
  const avatars = [
    'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
    'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
    'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
    'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100'
  ];
  
  const reviewTexts = [
    'Amazing experience! Highly recommend this place.',
    'Great atmosphere and excellent service.',
    'Perfect spot for a night out with friends.',
    'The food was incredible and the staff was so friendly.',
    'Beautiful venue with a great vibe.',
    'Exceeded all expectations. Will definitely be back!',
    'Lovely place, though a bit pricey.',
    'Good food but service could be improved.',
    'Fantastic location and ambiance.'
  ];
  
  const numReviews = Math.floor(Math.random() * 3) + 2; // 2-4 reviews
  const reviews = [];
  const baseTimestamp = Date.now();
  
  for (let i = 0; i < numReviews; i++) {
    reviews.push({
      id: `review_${baseTimestamp}_${i}_${Math.random().toString(36).substr(2, 9)}`,
      author: authors[Math.floor(Math.random() * authors.length)],
      avatar: avatars[Math.floor(Math.random() * avatars.length)],
      rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
      text: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      helpful: Math.floor(Math.random() * 20)
    });
  }
  
  return reviews;
};

export const MOCK_VENUES = [
  {
    id: '1',
    place_id: 'mock_1',
    name: 'The Rooftop Garden',
    address: '123 Sky Street, Downtown',
    latitude: 40.7589,
    longitude: -73.9851,
    rating: 4.6,
    priceLevel: 3,
    image: 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=800',
    photos: [
      'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2253643/pexels-photo-2253643.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    categories: ['Restaurant', 'Bar', 'Rooftop'],
    venueType: 'food' as const,
    openNow: true,
    distance: '0.3 mi',
    phone: '+1 (555) 123-4567',
    website: 'https://rooftopgarden.com',
    description: 'Elevated dining experience with panoramic city views and craft cocktails.',
    matchScore: 92,
    weatherSuitability: 'outdoor' as const,
    reviews: MOCK_REVIEWS,
    reviewCount: 127
  },
  {
    id: '2',
    place_id: 'mock_2',
    name: 'Neon Nights Arcade',
    address: '456 Electric Ave, Arts District',
    latitude: 40.7505,
    longitude: -73.9934,
    rating: 4.8,
    priceLevel: 2,
    image: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=800',
    photos: [
      'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    categories: ['Arcade', 'Bar', 'Entertainment'],
    venueType: 'activity' as const,
    openNow: true,
    distance: '0.7 mi',
    phone: '+1 (555) 987-6543',
    website: 'https://neonnights.com',
    description: 'Retro arcade games, craft beer, and late-night fun in a neon-lit atmosphere.',
    matchScore: 88,
    weatherSuitability: 'indoor' as const,
    reviews: generateRandomReviews(),
    reviewCount: 89
  },
  {
    id: '3',
    place_id: 'mock_3',
    name: 'Moonlight Jazz Lounge',
    address: '789 Melody Lane, Music Quarter',
    latitude: 40.7614,
    longitude: -73.9776,
    rating: 4.4,
    priceLevel: 3,
    image: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=800',
    photos: [
      'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    categories: ['Jazz Club', 'Cocktails', 'Live Music'],
    venueType: 'social' as const,
    openNow: false,
    distance: '1.2 mi',
    phone: '+1 (555) 456-7890',
    website: 'https://moonlightjazz.com',
    description: 'Intimate jazz performances with handcrafted cocktails and dim lighting.',
    matchScore: 85,
    weatherSuitability: 'indoor' as const,
    reviews: generateRandomReviews(),
    reviewCount: 156
  },
  {
    id: '4',
    place_id: 'mock_4',
    name: 'Sunrise Coffee Co.',
    address: '321 Morning Street, Café District',
    latitude: 40.7549,
    longitude: -73.9840,
    rating: 4.7,
    priceLevel: 1,
    image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800',
    photos: [
      'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1833586/pexels-photo-1833586.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    categories: ['Coffee', 'Breakfast', 'Pastries'],
    venueType: 'food' as const,
    openNow: true,
    distance: '0.5 mi',
    phone: '+1 (555) 234-5678',
    website: 'https://sunrisecoffee.com',
    description: 'Artisanal coffee and fresh pastries in a cozy, sunlit atmosphere.',
    matchScore: 90,
    weatherSuitability: 'both' as const,
    reviews: generateRandomReviews(),
    reviewCount: 203
  },
  {
    id: '5',
    place_id: 'mock_5',
    name: 'Urban Art Gallery',
    address: '654 Canvas Street, Gallery Row',
    latitude: 40.7580,
    longitude: -73.9855,
    rating: 4.5,
    priceLevel: 2,
    image: 'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&w=800',
    photos: [
      'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    categories: ['Art Gallery', 'Culture', 'Exhibitions'],
    venueType: 'activity' as const,
    openNow: true,
    distance: '0.8 mi',
    phone: '+1 (555) 345-6789',
    website: 'https://urbanartgallery.com',
    description: 'Contemporary art exhibitions featuring local and international artists.',
    matchScore: 82,
    weatherSuitability: 'indoor' as const,
    reviews: generateRandomReviews(),
    reviewCount: 74
  },
  {
    id: '6',
    place_id: 'mock_6',
    name: 'Coastal Breeze Seafood',
    address: '987 Harbor View, Waterfront',
    latitude: 40.7620,
    longitude: -73.9800,
    rating: 4.3,
    priceLevel: 3,
    image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800',
    photos: [
      'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    categories: ['Seafood', 'Fine Dining', 'Waterfront'],
    venueType: 'food' as const,
    openNow: true,
    distance: '1.1 mi',
    phone: '+1 (555) 567-8901',
    website: 'https://coastalbreeze.com',
    description: 'Fresh seafood with stunning harbor views and an extensive wine selection.',
    matchScore: 87,
    weatherSuitability: 'both' as const,
    reviews: generateRandomReviews(),
    reviewCount: 142
  },
  {
    id: '7',
    place_id: 'mock_7',
    name: 'Vintage Vinyl Records',
    address: '234 Music Row, Retro District',
    latitude: 40.7560,
    longitude: -73.9820,
    rating: 4.9,
    priceLevel: 2,
    image: 'https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg?auto=compress&cs=tinysrgb&w=800',
    photos: [
      'https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1389429/pexels-photo-1389429.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    categories: ['Music Store', 'Vintage', 'Culture'],
    venueType: 'activity' as const,
    openNow: true,
    distance: '0.6 mi',
    phone: '+1 (555) 678-9012',
    website: 'https://vintagevinyl.com',
    description: 'Rare vinyl records, vintage audio equipment, and live acoustic sessions.',
    matchScore: 91,
    weatherSuitability: 'indoor' as const,
    reviews: generateRandomReviews(),
    reviewCount: 67
  },
  {
    id: '8',
    place_id: 'mock_8',
    name: 'Skyline Cocktail Bar',
    address: '567 High Street, Financial District',
    latitude: 40.7595,
    longitude: -73.9870,
    rating: 4.6,
    priceLevel: 4,
    image: 'https://images.pexels.com/photos/1267696/pexels-photo-1267696.jpeg?auto=compress&cs=tinysrgb&w=800',
    photos: [
      'https://images.pexels.com/photos/1267696/pexels-photo-1267696.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1089930/pexels-photo-1089930.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    categories: ['Cocktail Bar', 'Upscale', 'City Views'],
    venueType: 'social' as const,
    openNow: true,
    distance: '0.4 mi',
    phone: '+1 (555) 789-0123',
    website: 'https://skylinecocktails.com',
    description: 'Premium cocktails with breathtaking city skyline views from the 40th floor.',
    matchScore: 89,
    weatherSuitability: 'indoor' as const,
    reviews: generateRandomReviews(),
    reviewCount: 198
  },
  {
    id: '9',
    place_id: 'mock_9',
    name: 'Green Garden Yoga Studio',
    address: '890 Zen Avenue, Wellness District',
    latitude: 40.7530,
    longitude: -73.9810,
    rating: 4.8,
    priceLevel: 2,
    image: 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=800',
    photos: [
      'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3823207/pexels-photo-3823207.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    categories: ['Yoga', 'Wellness', 'Meditation'],
    venueType: 'activity' as const,
    openNow: true,
    distance: '0.9 mi',
    phone: '+1 (555) 890-1234',
    website: 'https://greengardenyoga.com',
    description: 'Peaceful yoga classes in a serene garden setting with natural lighting.',
    matchScore: 84,
    weatherSuitability: 'both' as const,
    reviews: generateRandomReviews(),
    reviewCount: 91
  },
  {
    id: '10',
    place_id: 'mock_10',
    name: 'Midnight Diner',
    address: '123 Late Night Lane, 24/7 District',
    latitude: 40.7570,
    longitude: -73.9890,
    rating: 4.2,
    priceLevel: 2,
    image: 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=800',
    photos: [
      'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    categories: ['Diner', 'Late Night', 'Comfort Food'],
    venueType: 'food' as const,
    openNow: true,
    distance: '0.7 mi',
    phone: '+1 (555) 901-2345',
    website: 'https://midnightdiner.com',
    description: 'Classic American diner open 24/7 with comfort food and friendly service.',
    matchScore: 86,
    weatherSuitability: 'indoor' as const,
    reviews: generateRandomReviews(),
    reviewCount: 134
  },
  {
    id: '11',
    place_id: 'mock_11',
    name: 'Artisan Pottery Workshop',
    address: '456 Creative Circle, Arts Quarter',
    latitude: 40.7540,
    longitude: -73.9830,
    rating: 4.7,
    priceLevel: 2,
    image: 'https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=800',
    photos: [
      'https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    categories: ['Workshop', 'Art', 'Hands-on'],
    venueType: 'activity' as const,
    openNow: true,
    distance: '1.3 mi',
    phone: '+1 (555) 012-3456',
    website: 'https://artisanpottery.com',
    description: 'Learn pottery making in a hands-on workshop with expert artisans.',
    matchScore: 83,
    weatherSuitability: 'indoor' as const,
    reviews: generateRandomReviews(),
    reviewCount: 45
  },
  {
    id: '12',
    place_id: 'mock_12',
    name: 'Sunset Beach Bar',
    address: '789 Oceanfront Blvd, Beach District',
    latitude: 40.7600,
    longitude: -73.9750,
    rating: 4.5,
    priceLevel: 3,
    image: 'https://images.pexels.com/photos/1089930/pexels-photo-1089930.jpeg?auto=compress&cs=tinysrgb&w=800',
    photos: [
      'https://images.pexels.com/photos/1089930/pexels-photo-1089930.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1267696/pexels-photo-1267696.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    categories: ['Beach Bar', 'Tropical', 'Sunset Views'],
    venueType: 'social' as const,
    openNow: true,
    distance: '1.5 mi',
    phone: '+1 (555) 123-4567',
    website: 'https://sunsetbeachbar.com',
    description: 'Tropical cocktails and stunning sunset views right on the beach.',
    matchScore: 88,
    weatherSuitability: 'outdoor' as const,
    reviews: generateRandomReviews(),
    reviewCount: 167
  },
  {
    id: '13',
    place_id: 'mock_13',
    name: 'Underground Comedy Club',
    address: '321 Laugh Lane, Entertainment District',
    latitude: 40.7580,
    longitude: -73.9860,
    rating: 4.4,
    priceLevel: 2,
    image: 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=800',
    photos: [
      'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    categories: ['Comedy', 'Live Shows', 'Entertainment'],
    venueType: 'social' as const,
    openNow: false,
    distance: '0.8 mi',
    phone: '+1 (555) 234-5678',
    website: 'https://undergroundcomedy.com',
    description: 'Intimate comedy shows featuring both rising stars and established comedians.',
    matchScore: 85,
    weatherSuitability: 'indoor' as const,
    reviews: generateRandomReviews(),
    reviewCount: 112
  },
  {
    id: '14',
    place_id: 'mock_14',
    name: 'Farm-to-Table Bistro',
    address: '654 Organic Street, Green District',
    latitude: 40.7550,
    longitude: -73.9880,
    rating: 4.6,
    priceLevel: 3,
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
    photos: [
      'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    categories: ['Farm-to-Table', 'Organic', 'Sustainable'],
    venueType: 'food' as const,
    openNow: true,
    distance: '1.0 mi',
    phone: '+1 (555) 345-6789',
    website: 'https://farmtotablebistro.com',
    description: 'Fresh, locally-sourced ingredients prepared with seasonal creativity.',
    matchScore: 90,
    weatherSuitability: 'both' as const,
    reviews: generateRandomReviews(),
    reviewCount: 178
  },
  {
    id: '15',
    place_id: 'mock_15',
    name: 'Retro Gaming Lounge',
    address: '987 Pixel Plaza, Gaming District',
    latitude: 40.7590,
    longitude: -73.9840,
    rating: 4.8,
    priceLevel: 2,
    image: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=800',
    photos: [
      'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    categories: ['Gaming', 'Retro', 'Social'],
    venueType: 'activity' as const,
    openNow: true,
    distance: '0.5 mi',
    phone: '+1 (555) 456-7890',
    website: 'https://retrogaminglounge.com',
    description: 'Classic arcade games, console tournaments, and craft beer in a nostalgic setting.',
    matchScore: 87,
    weatherSuitability: 'indoor' as const,
    reviews: generateRandomReviews(),
    reviewCount: 95
  }
];

export const MOCK_WEATHER = {
  temperature: 72,
  condition: 'Partly Cloudy',
  isRaining: false,
  humidity: 65,
  windSpeed: 8
};

export const MOCK_USER = {
  id: 'user_1',
  email: 'user@example.com',
  name: 'Alex Johnson',
  avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
  createdAt: '2024-01-15T10:00:00Z',
  lastActive: new Date().toISOString(),
  savedSauntrs: [],
  totalVisits: 23,
  totalAdventures: 8,
  preferences: {
    vibes: ['chill', 'foodie', 'cultural'],
    venueTypes: ['food', 'activity'],
    cuisinePreferences: ['Italian', 'Asian', 'Mediterranean'],
    activityPreferences: ['Museum', 'Art', 'Music'],
    budgetRange: [2, 4] as [number, number],
    ratingThreshold: 4.0,
    maxDistance: 5,
    specialFeatures: ['Outdoor Seating', 'Quiet Environment', 'Good for Groups']
  }
};

export const MOCK_SAVED_SAUNTRS = [
  {
    id: 'sauntr_1',
    title: 'Perfect Date Night',
    description: 'Romantic evening spots for two',
    venues: [MOCK_VENUES[0], MOCK_VENUES[2], MOCK_VENUES[7]], // Rooftop Garden, Jazz Lounge, Skyline Bar
    createdAt: '2024-01-20T18:00:00Z',
    colorTheme: 'purple' as const,
    venueCount: 3,
    previewVenues: ['The Rooftop Garden', 'Moonlight Jazz Lounge', 'Skyline Cocktail Bar']
  },
  {
    id: 'sauntr_2',
    title: 'Weekend Adventure',
    description: 'Fun activities for the weekend',
    venues: [MOCK_VENUES[1], MOCK_VENUES[4], MOCK_VENUES[6], MOCK_VENUES[14]], // Arcade, Art Gallery, Vinyl Records, Gaming Lounge
    createdAt: '2024-01-18T14:30:00Z',
    colorTheme: 'blue' as const,
    venueCount: 4,
    previewVenues: ['Neon Nights Arcade', 'Urban Art Gallery', 'Vintage Vinyl Records', 'Retro Gaming Lounge']
  },
  {
    id: 'sauntr_3',
    title: 'Foodie Paradise',
    description: 'Best dining spots in the city',
    venues: [MOCK_VENUES[0], MOCK_VENUES[3], MOCK_VENUES[5], MOCK_VENUES[9], MOCK_VENUES[13]], // Rooftop Garden, Coffee Co, Seafood, Diner, Bistro
    createdAt: '2024-01-15T12:00:00Z',
    colorTheme: 'green' as const,
    venueCount: 5,
    previewVenues: ['The Rooftop Garden', 'Sunrise Coffee Co.', 'Coastal Breeze Seafood', 'Midnight Diner', 'Farm-to-Table Bistro']
  },
  {
    id: 'sauntr_4',
    title: 'Chill Vibes Only',
    description: 'Relaxed spots for unwinding',
    venues: [MOCK_VENUES[3], MOCK_VENUES[8], MOCK_VENUES[11]], // Coffee Co, Yoga Studio, Pottery Workshop
    createdAt: '2024-01-12T16:30:00Z',
    colorTheme: 'orange' as const,
    venueCount: 3,
    previewVenues: ['Sunrise Coffee Co.', 'Green Garden Yoga Studio', 'Artisan Pottery Workshop']
  }
];