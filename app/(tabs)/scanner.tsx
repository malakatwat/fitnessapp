import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Stack, useRouter } from 'expo-router'; // Import Stack
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URLS } from '../../config';
import { FoodItem, useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const theme = {
  primary: '#00A878',
  text: '#333',
  lightText: '#777',
  background: '#FFFFFF',
};

export default function BarcodeScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();
  const { logMeal } = useApp(); 
  const router = useRouter();
  // Removed useNavigation

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
    // Removed navigation.setOptions
  }, [permission]);

  // --- 1. Auto-Log Function ---
  const autoLogItem = async (food: FoodItem) => {
    try {
      const defaultMeal = 'Snacks'; 
      
      await logMeal(food, defaultMeal);
      
      Alert.alert(
        '✅ Auto-Logged!', 
        `${food.name} added to ${defaultMeal}.`,
        [{ text: "OK", onPress: () => router.back() }]
      );
      
    } catch (e: any) {
      Alert.alert("Notice", e.message, [{ text: "Scan Again", onPress: () => setScanned(false) }]);
    }
  };
  
  const handleScan = async ({ data }: { data: string }) => {
    setScanned(true);
    setIsLoading(true);

    try {
      // 1. Check for Recipe QR
      try {
        const qrData = JSON.parse(data);
        if (qrData.type === 'myfitnessapp-recipe') {
           Alert.alert("Recipe Found", `Log ${qrData.name}?`, [
              { text: "Cancel", onPress: () => setScanned(false) },
              { text: "Log", onPress: () => autoLogItem({ id: qrData.recipeId, name: qrData.name, calories: 300, protein: 0, carbs: 0, fat: 0 } as FoodItem) }
           ]);
           setIsLoading(false);
           return;
        }
      } catch (e) {}

      // 2. Standard Barcode Lookup
      const response = await fetch(`${API_URLS.FOOD_SEARCH_BARCODE}/${data}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          Alert.alert(
            "Product Not Found", 
            `Barcode ${data} is not in our database.`,
            [
              { text: "Scan Again", onPress: () => setScanned(false) },
              { 
                text: "Add Custom Food", 
                onPress: () => {
                  router.back();
                  router.push('/(tabs)/addCustomFood');
                }
              }
            ]
          );
        } else {
          throw new Error(result.message);
        }
      } else {
        // 3. Success! AUTO-LOG IT IMMEDIATELY
        const food: FoodItem = result.food;
        await autoLogItem(food); 
      }
    } catch (e: any) {
      Alert.alert("Error", e.message, [{ text: "Retry", onPress: () => setScanned(false) }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!permission) return <View />;
  if (!permission.granted) return (
    <SafeAreaView style={[styles.container, {backgroundColor: 'white'}]}>
      <Text style={{ textAlign: 'center', padding: 20 }}>We need your permission to show the camera</Text>
      <Button onPress={requestPermission} title="Grant Permission" />
    </SafeAreaView>
  );

  return (
    <View style={styles.container}>
      {/* Use Stack.Screen to configure the header */}
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Button onPress={() => router.back()} title="Close" color={theme.primary} />
          ),
          title: "Scan Barcode",
        }}
      />

      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleScan}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "qr"], 
        }}
      />
      <View style={styles.overlay}>
        <Text style={styles.overlayText}>Auto-Scanner Active</Text>
        <View style={styles.scanBox} />
        
        <TouchableOpacity 
          style={styles.galleryButton} 
          onPress={() => { router.back(); router.push('/(tabs)/addCustomFood'); }}
          disabled={isLoading}
        >
          <Ionicons name="create-outline" size={22} color={theme.primary} />
          <Text style={styles.galleryButtonText}>Manual Entry</Text>
        </TouchableOpacity>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  overlayText: {
    fontSize: 18, color: 'white', fontWeight: 'bold', backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 5, position: 'absolute', top: 100,
  },
  scanBox: {
    width: 250, height: 250, borderWidth: 2, borderColor: theme.primary, borderRadius: 10, backgroundColor: 'transparent',
  },
  galleryButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 70 : 50,
    backgroundColor: 'white',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  galleryButtonText: {
    fontSize: 16, color: theme.primary, fontWeight: 'bold', marginLeft: 10,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center',
  },
  loadingText: {
    fontSize: 16, color: 'white', marginTop: 10,
  }
});