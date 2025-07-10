import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function LocationScreen() {
  const [searchText, setSearchText] = useState('');
  const [distanceRadius, setDistanceRadius] = useState(5);

  const handleContinue = () => {
    if (searchText.trim()) {
      const locationData = {
        address: searchText,
        coordinates: '0,0', // Placeholder
        lat: 0,
        lng: 0,
        radius: distanceRadius,
      };
      
      // Store location data and navigate
      router.push('/onboarding/quickvibe');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Where are you located?</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter your location"
        value={searchText}
        onChangeText={setSearchText}
      />
      
      <View style={styles.radiusContainer}>
        <Text style={styles.radiusLabel}>Search radius: {distanceRadius} km</Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.button, !searchText.trim() && styles.buttonDisabled]}
        onPress={handleContinue}
        disabled={!searchText.trim()}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  radiusContainer: {
    marginBottom: 30,
  },
  radiusLabel: {
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});