import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Sun, Cloud, CloudRain, MapPin, Sparkles, RefreshCw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface WeatherData {
  temperature: number;
  condition: string;
  isRaining: boolean;
  icon: 'sun' | 'cloud' | 'rain';
}

interface SamuelSauntrWidgetProps {
  location?: string;
  onLocationPress?: () => void;
  context?: 'welcome' | 'discovery' | 'map' | 'likes';
  className?: string;
}

export default function SamuelSauntrWidget({ 
  location, 
  onLocationPress, 
  context = 'welcome',
  className 
}: SamuelSauntrWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Weather icon component
  const getWeatherIcon = (iconType: string, size: number = 20) => {
    switch (iconType) {
      case 'sun':
        return <Sun color="#F59E0B" size={size} />;
      case 'rain':
        return <CloudRain color="#3B82F6" size={size} />;
      default:
        return <Cloud color="#6B7280" size={size} />;
    }
  };

  // Get current time context
  const getTimeContext = () => {
    const hour = new Date().getHours();
    if (hour < 6) return 'late-night';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  };

  // Generate Samuel's contextual messages
  const generateSamuelMessage = (weather: WeatherData, timeContext: string, screenContext: string) => {
    const messages = {
      welcome: {
        morning: {
          sunny: [
            "Perfect morning for a coffee walk!",
            "Beautiful start to the day - outdoor cafes are calling!",
            "Great morning energy - time to explore!"
          ],
          cloudy: [
            "Cozy morning vibes - perfect for indoor discoveries!",
            "Great morning for exploring covered markets and cafes!",
            "Comfortable weather for a leisurely morning adventure!"
          ],
          rainy: [
            "Rainy day calls for cozy indoor adventures!",
            "Perfect weather for museums and warm cafes!",
            "Indoor gems are waiting to be discovered!"
          ]
        },
        afternoon: {
          sunny: [
            "Gorgeous afternoon - patios and outdoor spots await!",
            "Perfect weather for exploring the city!",
            "Sunshine calls for outdoor dining and activities!"
          ],
          cloudy: [
            "Great afternoon for discovering new places!",
            "Comfortable weather for a perfect adventure!",
            "Ideal conditions for exploring both indoor and outdoor spots!"
          ],
          rainy: [
            "Rainy afternoon - time for cozy indoor experiences!",
            "Perfect for galleries, shops, and warm drinks!",
            "Indoor adventures are the best on days like this!"
          ]
        },
        evening: {
          sunny: [
            "Beautiful evening for outdoor dining!",
            "Perfect sunset weather - rooftops and patios calling!",
            "Golden hour magic - time for an amazing evening!"
          ],
          cloudy: [
            "Great evening for discovering new spots!",
            "Perfect weather for dinner and drinks!",
            "Comfortable evening for exploring the nightlife!"
          ],
          rainy: [
            "Cozy evening vibes - perfect for intimate indoor spots!",
            "Rainy nights are made for warm restaurants and bars!",
            "Indoor evening adventures await!"
          ]
        },
        night: {
          any: [
            "Night owl energy - late-night spots are calling!",
            "Perfect time for discovering nightlife gems!",
            "The city's best kept secrets come alive at night!"
          ]
        }
      },
      discovery: {
        any: [
          "I'm seeing great energy at these places right now!",
          "These venues are perfect for current conditions!",
          "Trust me on these picks - they're spot on for today!",
          "Current vibes are matching perfectly with these spots!"
        ]
      },
      map: {
        any: [
          "Perfect walking weather between these spots!",
          "Great conditions for exploring your route!",
          "These venues flow beautifully together!",
          "Your adventure route looks amazing today!"
        ]
      },
      likes: {
        any: [
          "You've got great taste! I can see patterns in what you love.",
          "Your venue choices show excellent local instincts!",
          "I'm noticing some fantastic themes in your favorites!",
          "Your liked venues tell a great story about your style!"
        ]
      }
    };

    let contextMessages;
    if (screenContext === 'discovery' || screenContext === 'map' || screenContext === 'likes') {
      contextMessages = messages[screenContext].any;
    } else {
      const weatherCondition = weather.isRaining ? 'rainy' : 
                              weather.condition.toLowerCase().includes('cloud') ? 'cloudy' : 'sunny';
      
      if (timeContext === 'late-night' || timeContext === 'night') {
        contextMessages = messages.welcome.night.any;
      } else {
        contextMessages = messages.welcome[timeContext]?.[weatherCondition] || 
                         messages.welcome[timeContext]?.sunny || 
                         messages.welcome.afternoon.sunny;
      }
    }

    return contextMessages[Math.floor(Math.random() * contextMessages.length)];
  };

  // Load weather data
  const loadWeatherData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock weather data - in production, use OpenWeather API
      const mockWeather: WeatherData = {
        temperature: Math.floor(Math.random() * 20) + 65, // 65-85°F
        condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
        isRaining: Math.random() > 0.7,
        icon: Math.random() > 0.7 ? 'rain' : Math.random() > 0.5 ? 'cloud' : 'sun'
      };
      
      setWeather(mockWeather);
      
      // Generate Samuel's message
      const timeContext = getTimeContext();
      const message = generateSamuelMessage(mockWeather, timeContext, context);
      setCurrentMessage(message);
      
    } catch (error) {
      console.error('Weather loading error:', error);
      setCurrentMessage("Ready to discover something amazing!");
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh Samuel's advice
  const refreshAdvice = () => {
    if (weather) {
      const timeContext = getTimeContext();
      const message = generateSamuelMessage(weather, timeContext, context);
      setCurrentMessage(message);
    }
  };

  useEffect(() => {
    loadWeatherData();
  }, [context]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDot} />
          <View style={[styles.loadingDot, styles.loadingDotDelay]} />
          <View style={[styles.loadingDot, styles.loadingDotDelay2]} />
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onLocationPress}
      activeOpacity={0.95}
    >
      <View style={styles.content}>
        {/* Weather Section */}
        <View style={styles.weatherSection}>
          {weather && (
            <>
              {getWeatherIcon(weather.icon, 24)}
              <View style={styles.weatherInfo}>
                <Text style={styles.temperature}>{weather.temperature}°F</Text>
                <Text style={styles.condition}>{weather.condition}</Text>
              </View>
            </>
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Samuel Section */}
        <View style={styles.samuelSection}>
          <View style={styles.samuelHeader}>
            <View style={styles.samuelLogoContainer}>
              <Image 
                source={require('@/assets/images/sauntr_logo_12x12in_no_text.png')} 
                style={styles.samuelLogo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.samuelBranding}>
              <Text style={styles.samuelName}>Samuel Sauntr Says:</Text>
            </View>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={refreshAdvice}
            >
              <RefreshCw color="#8B5CF6" size={14} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.samuelMessage}>{currentMessage}</Text>
        </View>
      </View>

      {/* Location Info */}
      {location ? (
        <View style={styles.locationInfo}>
          <MapPin color="#6B7280" size={12} />
          <Text style={styles.locationText} numberOfLines={1}>
            {location}
          </Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.setLocationButton} onPress={onLocationPress}>
          <MapPin color="#3B82F6" size={12} />
          <Text style={styles.setLocationText}>Set Location</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
    padding: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 4,
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B5CF6',
    opacity: 0.4,
  },
  loadingDotDelay: {
    opacity: 0.7,
  },
  loadingDotDelay2: {
    opacity: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  weatherSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
  },
  weatherInfo: {
    marginLeft: 10,
  },
  temperature: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222222',
    lineHeight: 18,
  },
  condition: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 1,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  samuelSection: {
    flex: 1,
  },
  samuelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  samuelLogoContainer: {
    width: 20,
    height: 20,
    backgroundColor: 'transparent',
    marginRight: 8,
  },
  samuelLogo: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  samuelBranding: {
    flex: 1,
  },
  samuelName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B5CF6',
    lineHeight: 14,
  },
  refreshButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  samuelMessage: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
    lineHeight: 16,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  locationText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    flex: 1,
  },
  setLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  setLocationText: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '600',
  },
});