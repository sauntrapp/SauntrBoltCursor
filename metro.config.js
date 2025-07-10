const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for web
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Ensure proper handling of React Native modules on web
config.resolver.alias = {
  'react-native-maps': 'react-native-web',
};

module.exports = config;