@@ .. @@
 import React, { useState, useEffect, useRef } from 'react';
 import { View, Text, StyleSheet, Platform, Dimensions, TouchableOpacity, Modal, Alert, ScrollView } from 'react-native';
 import { Venue } from '@/lib/types';
 import { MapPin, Heart, Zap, Navigation, ExternalLink, X, Clock, Users, Star, Phone, Globe } from 'lucide-react-native';
 import { LinearGradient } from 'expo-linear-gradient';
 import { calculateDistance, formatDistance } from '@/lib/mapUtils';
-import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
+
+// Conditionally import MapView only for native platforms
+let MapView: any = null;
+let Marker: any = null;
+let PROVIDER_GOOGLE: any = null;
+let Polyline: any = null;
+
+if (Platform.OS !== 'web') {
+  try {
+    const MapViewModule = require('react-native-maps');
+    MapView = MapViewModule.default;
+    Marker = MapViewModule.Marker;
+    PROVIDER_GOOGLE = MapViewModule.PROVIDER_GOOGLE;
+    Polyline = MapViewModule.Polyline;
+  } catch (error) {
+    console.log('react-native-maps not available on web');
+  }
+}