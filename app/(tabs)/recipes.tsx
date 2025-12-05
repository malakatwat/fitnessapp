import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator, Alert,
  Button,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URLS } from '../../config';
import { useAuth } from '../../context/AuthContext';

const theme = {
  primary: '#00A878',
  background: '#FFFFFF',
  text: '#333',
  lightText: '#777',
  grey: '#F1F1F1',
  blue: '#3498db'
};

export default function RecipesScreen() {
  const router = useRouter();
  const { token } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [aiRecipe, setAiRecipe] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // State for QR Code Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState<string | null>(null);

  // --- 1. Call the AI API to Generate a Recipe ---
  const handleAiSearch = async () => {
    if (!searchQuery.trim()) {
        Alert.alert("Please enter a food name or craving.");
        return;
    }
    
    setIsLoading(true);
    setAiRecipe(''); // Clear previous result

    try {
      const response = await fetch(API_URLS.AI_RECOMMEND, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
            query: `Suggest a healthy, traditional Middle Eastern recipe for: ${searchQuery}. Include calories.`, 
            type: 'recipe' 
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setAiRecipe(data.reply);
      } else {
        throw new Error(data.message || "Failed to get recipe");
      }
    } catch (error: any) {
      Alert.alert("Error", "Could not generate recipe. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. Generate a QR Code for the Result ---
  const handleSharePress = () => {
    if (!aiRecipe) return;
    
    // Create a special JSON payload for your scanner to recognize
    const qrData = JSON.stringify({ 
        type: 'myfitnessapp-recipe', 
        name: `AI Recipe: ${searchQuery}`, 
        recipeId: 'ai-generated-' + Date.now() 
    });
    
    setQrCodeValue(qrData);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Smart Recipes</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Ask Dietitian for a Recipe</Text>
        
        {/* Search Input */}
        <View style={styles.searchContainer}>
            <TextInput 
                style={styles.input} 
                placeholder="e.g. 'Vegetarian Majboos' or 'Keto Dinner'" 
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={theme.lightText}
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleAiSearch} disabled={isLoading}>
                {isLoading ? (
                    <ActivityIndicator color="#FFF" /> 
                ) : (
                    <Ionicons name="sparkles" size={20} color="#FFF" />
                )}
            </TouchableOpacity>
        </View>

        {/* Results Section */}
        {aiRecipe ? (
            <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                    <Text style={styles.resultTitle}>AI Recommendation</Text>
                    {/* Share Button */}
                    <TouchableOpacity onPress={handleSharePress}>
                        <Ionicons name="qr-code-outline" size={24} color={theme.primary} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.resultText}>{aiRecipe}</Text>
            </View>
        ) : (
            <View style={styles.placeholderContainer}>
                <Ionicons name="restaurant-outline" size={60} color="#DDD" />
                <Text style={styles.placeholderText}>
                    Enter a craving, ingredient, or dish name above to get a healthy, custom recipe!
                </Text>
            </View>
        )}
      </ScrollView>

      {/* QR Code Modal */}
      <Modal 
        animationType="slide" 
        transparent={true} 
        visible={modalVisible} 
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Scan to Log</Text>
            <Text style={styles.modalSubtitle}>Share this recipe with a friend!</Text>
            
            {qrCodeValue && (
                <View style={styles.qrWrapper}>
                    <QRCode value={qrCodeValue} size={200} />
                </View>
            )}
            
            <Button title="Done" onPress={() => setModalVisible(false)} color={theme.primary} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.grey },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: theme.background, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 15, color: theme.text },
  content: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: theme.text },
  
  searchContainer: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  input: { flex: 1, backgroundColor: theme.background, padding: 15, borderRadius: 12, fontSize: 16, color: theme.text, borderWidth: 1, borderColor: '#EEE' },
  searchButton: { backgroundColor: theme.primary, width: 55, justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  
  resultCard: { backgroundColor: theme.background, padding: 20, borderRadius: 15, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: theme.grey, paddingBottom: 10 },
  resultTitle: { fontSize: 18, fontWeight: 'bold', color: theme.primary },
  resultText: { fontSize: 15, lineHeight: 24, color: theme.text },
  
  placeholderContainer: { alignItems: 'center', marginTop: 40, paddingHorizontal: 30 },
  placeholderText: { textAlign: 'center', color: theme.lightText, marginTop: 20, fontSize: 15, lineHeight: 22 },
  
  // Modal Styles
  modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContainer: { width: '85%', backgroundColor: 'white', padding: 25, borderRadius: 20, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: theme.text, marginBottom: 5 },
  modalSubtitle: { fontSize: 14, color: theme.lightText, marginBottom: 20 },
  qrWrapper: { padding: 20, backgroundColor: 'white', borderRadius: 10, marginBottom: 20 }
});