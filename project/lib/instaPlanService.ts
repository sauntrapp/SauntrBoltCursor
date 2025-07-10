import { MOCK_VENUES } from './mockData';
import { Venue } from './types';

export interface InstaPlan {
  id: string;
  title: string;
  description: string;
  venues: Venue[];
  venueRoles: string[]; // Role of each venue in the plan (e.g., "Start", "Explore", "Socialize")
  venueNotes?: string[]; // Optional notes for each venue
  estimatedDuration: string;
  totalDistance: string;
  timeOfDay: string;
  weatherNote?: string;
  createdAt: string;
}

interface LocationData {
  address: string;
  coordinates: string;
  lat: number;
  lng: number;
  radius?: number;
}

// Plan templates based on time of day and weather
const PLAN_TEMPLATES = {
  morning: {
    sunny: {
      title: "Perfect Morning Adventure",
      description: "Start your day with coffee, explore something inspiring, then enjoy a relaxing outdoor experience",
      roles: ["Energize", "Explore", "Relax"],
      venueTypes: ["food", "activity", "outdoor"],
    },
    rainy: {
      title: "Cozy Morning Indoors",
      description: "Warm coffee, cultural exploration, and indoor socializing to brighten your day",
      roles: ["Warm Up", "Discover", "Connect"],
      venueTypes: ["food", "activity", "social"],
    }
  },
  afternoon: {
    sunny: {
      title: "Afternoon Discovery",
      description: "Lunch, outdoor activities, and a perfect spot to unwind as the day progresses",
      roles: ["Fuel Up", "Adventure", "Unwind"],
      venueTypes: ["food", "outdoor", "social"],
    },
    rainy: {
      title: "Indoor Afternoon Escape",
      description: "Great food, engaging activities, and cozy socializing away from the weather",
      roles: ["Dine", "Engage", "Socialize"],
      venueTypes: ["food", "activity", "social"],
    }
  },
  evening: {
    sunny: {
      title: "Golden Hour Adventure",
      description: "Dinner with a view, outdoor exploration, and the perfect nightcap",
      roles: ["Dine", "Explore", "Celebrate"],
      venueTypes: ["food", "outdoor", "social"],
    },
    rainy: {
      title: "Cozy Evening Out",
      description: "Intimate dining, cultural experiences, and sophisticated drinks",
      roles: ["Savor", "Experience", "Toast"],
      venueTypes: ["food", "activity", "social"],
    }
  },
  night: {
    any: {
      title: "Night on the Town",
      description: "Late dinner, entertainment, and the perfect nightlife experience",
      roles: ["Dine", "Entertain", "Celebrate"],
      venueTypes: ["food", "activity", "social"],
    }
  }
};

// Weather conditions
const getWeatherCondition = (): 'sunny' | 'rainy' => {
  // Mock weather - in production, use real weather API
  return Math.random() > 0.3 ? 'sunny' : 'rainy';
};

// Time of day detection
const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
  const hour = new Date().getHours();
  if (hour < 11) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
};

// Venue filtering and selection
const filterVenuesByType = (venues: Venue[], type: string): Venue[] => {
  return venues.filter(venue => {
    switch (type) {
      case 'outdoor':
        return venue.weatherSuitability === 'outdoor' || venue.weatherSuitability === 'both';
      case 'indoor':
        return venue.weatherSuitability === 'indoor' || venue.weatherSuitability === 'both';
      default:
        return venue.venueType === type;
    }
  });
};

// Smart venue selection that avoids repetition and ensures variety
const selectVenuesForPlan = (venueTypes: string[], weather: string): Venue[] => {
  const selectedVenues: Venue[] = [];
  const usedVenueIds = new Set<string>();

  for (const type of venueTypes) {
    let candidates = filterVenuesByType(MOCK_VENUES, type);
    
    // Filter out already selected venues
    candidates = candidates.filter(venue => !usedVenueIds.has(venue.id));
    
    // Weather-based filtering
    if (weather === 'rainy') {
      candidates = candidates.filter(venue => 
        venue.weatherSuitability === 'indoor' || venue.weatherSuitability === 'both'
      );
    }
    
    // Prefer open venues
    const openVenues = candidates.filter(venue => venue.openNow);
    const finalCandidates = openVenues.length > 0 ? openVenues : candidates;
    
    if (finalCandidates.length > 0) {
      // Select a random venue from candidates
      const selectedVenue = finalCandidates[Math.floor(Math.random() * finalCandidates.length)];
      selectedVenues.push(selectedVenue);
      usedVenueIds.add(selectedVenue.id);
    }
  }

  return selectedVenues;
};

// Calculate total distance (mock implementation)
const calculateTotalDistance = (venues: Venue[]): string => {
  if (venues.length < 2) return '0.0 mi';
  
  // Mock calculation - in production, use real distance calculation
  const totalMiles = venues.length * 0.5 + Math.random() * 1.5;
  return `${totalMiles.toFixed(1)} mi`;
};

// Generate venue-specific notes
const generateVenueNotes = (venues: Venue[], roles: string[], timeOfDay: string, weather: string): string[] => {
  const notes: string[] = [];
  
  venues.forEach((venue, index) => {
    const role = roles[index];
    let note = '';
    
    switch (role) {
      case 'Energize':
      case 'Warm Up':
        note = 'Perfect spot to start your day with great coffee and atmosphere';
        break;
      case 'Fuel Up':
      case 'Dine':
        note = 'Excellent food and ambiance for a satisfying meal';
        break;
      case 'Explore':
      case 'Discover':
        note = 'Engaging experience that will spark your curiosity';
        break;
      case 'Adventure':
        note = 'Active and exciting - perfect for afternoon energy';
        break;
      case 'Relax':
      case 'Unwind':
        note = 'Peaceful environment to decompress and enjoy the moment';
        break;
      case 'Socialize':
      case 'Connect':
        note = 'Great atmosphere for conversation and connection';
        break;
      case 'Celebrate':
      case 'Toast':
        note = 'Perfect finale to cap off your adventure';
        break;
      default:
        note = 'A wonderful addition to your adventure';
    }
    
    // Add weather-specific notes
    if (weather === 'rainy' && venue.weatherSuitability === 'indoor') {
      note += ' - cozy indoor setting perfect for today\'s weather';
    } else if (weather === 'sunny' && venue.weatherSuitability === 'outdoor') {
      note += ' - take advantage of the beautiful weather';
    }
    
    notes.push(note);
  });
  
  return notes;
};

// Main InstaPlan generation function
export async function generateInstaPlan(location: LocationData): Promise<InstaPlan> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const timeOfDay = getTimeOfDay();
  const weather = getWeatherCondition();
  
  // Get appropriate template
  let template;
  if (timeOfDay === 'night') {
    template = PLAN_TEMPLATES.night.any;
  } else {
    template = PLAN_TEMPLATES[timeOfDay][weather] || PLAN_TEMPLATES[timeOfDay].sunny;
  }
  
  // Select venues based on template
  const venues = selectVenuesForPlan(template.venueTypes, weather);
  
  if (venues.length < 3) {
    // Fallback: fill with random venues if we don't have enough
    const remainingVenues = MOCK_VENUES.filter(v => !venues.find(selected => selected.id === v.id));
    while (venues.length < 3 && remainingVenues.length > 0) {
      const randomIndex = Math.floor(Math.random() * remainingVenues.length);
      venues.push(remainingVenues.splice(randomIndex, 1)[0]);
    }
  }
  
  // Take only first 3 venues
  const finalVenues = venues.slice(0, 3);
  
  // Generate venue notes
  const venueNotes = generateVenueNotes(finalVenues, template.roles, timeOfDay, weather);
  
  // Calculate duration
  const estimatedDuration = '2-3 hours';
  
  // Calculate total distance
  const totalDistance = calculateTotalDistance(finalVenues);
  
  // Generate weather note if applicable
  let weatherNote;
  if (weather === 'rainy') {
    weatherNote = '🌧️ Indoor venues selected due to current weather conditions';
  } else if (timeOfDay === 'evening' && weather === 'sunny') {
    weatherNote = '🌅 Perfect weather for outdoor dining and activities';
  }
  
  const plan: InstaPlan = {
    id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: template.title,
    description: template.description,
    venues: finalVenues,
    venueRoles: template.roles.slice(0, finalVenues.length),
    venueNotes,
    estimatedDuration,
    totalDistance,
    timeOfDay,
    weatherNote,
    createdAt: new Date().toISOString(),
  };
  
  return plan;
}

// Helper function to regenerate plan with different venues
export async function regenerateInstaPlan(previousPlan: InstaPlan, location: LocationData): Promise<InstaPlan> {
  // Use the same template but select different venues
  const newPlan = await generateInstaPlan(location);
  
  // Ensure we get different venues by filtering out previous ones
  const previousVenueIds = new Set(previousPlan.venues.map(v => v.id));
  let availableVenues = MOCK_VENUES.filter(v => !previousVenueIds.has(v.id));
  
  if (availableVenues.length >= 3) {
    // Shuffle and take 3 different venues
    availableVenues = availableVenues.sort(() => Math.random() - 0.5);
    newPlan.venues = availableVenues.slice(0, 3);
    newPlan.venueNotes = generateVenueNotes(newPlan.venues, newPlan.venueRoles, newPlan.timeOfDay, getWeatherCondition());
  }
  
  return newPlan;
}