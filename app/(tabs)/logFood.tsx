import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal, // Import Modal
  ScrollView // Import ScrollView for content
  ,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URLS } from '../../config';
import { FoodItem, useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const theme = {
  primary: '#00A878',
  background: '#FFFFFF',
  text: '#333',
  lightText: '#777',
  grey: '#F1F1F1',
  blue: '#3498db',
  orange: '#f39c12',
  red: '#e74c3c',
};

type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';

// --- NEW COMPONENT: Macro Details Modal ---
const FoodDetailsModal = ({ food, onClose, onLog }) => {
    if (!food) return null;
    
    // We display the data from the FoodItem interface
    const macros = [
        { label: 'Protein', value: food.protein, unit: 'g', color: theme.blue },
        { label: 'Carbs', value: food.carbs, unit: 'g', color: theme.orange },
        { label: 'Fat', value: food.fat, unit: 'g', color: theme.red },
    ];

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={!!food}
            onRequestClose={onClose}>
            <View style={modalStyles.backdrop}>
                <View style={modalStyles.modalView}>
                    <ScrollView contentContainerStyle={modalStyles.scrollContent}>
                        <Text style={modalStyles.title}>{food.name}</Text>
                        <Text style={modalStyles.servingInfo}>
                            {food.calories} kcal per {food.serving_size} {food.serving_unit}
                        </Text>
                        
                        <View style={modalStyles.macroContainer}>
                            {macros.map((macro, index) => (
                                <View key={index} style={modalStyles.macroBox}>
                                    <View style={[modalStyles.macroColor, { backgroundColor: macro.color }]} />
                                    <Text style={modalStyles.macroValue}>
                                        {Math.round(macro.value)}
                                    </Text>
                                    <Text style={modalStyles.macroLabel}>{macro.label}</Text>
                                </View>
                            ))}
                        </View>
                        
                        <Text style={modalStyles.detailsHeader}>Full Breakdown</Text>
                        <View style={modalStyles.breakdownRow}>
                            <Text style={modalStyles.breakdownLabel}>Protein</Text>
                            <Text style={modalStyles.breakdownValue}>{food.protein.toFixed(1)} g</Text>
                        </View>
                         <View style={modalStyles.breakdownRow}>
                            <Text style={modalStyles.breakdownLabel}>Carbohydrates</Text>
                            <Text style={modalStyles.breakdownValue}>{food.carbs.toFixed(1)} g</Text>
                        </View>
                         <View style={modalStyles.breakdownRow}>
                            <Text style={modalStyles.breakdownLabel}>Fat</Text>
                            <Text style={modalStyles.breakdownValue}>{food.fat.toFixed(1)} g</Text>
                        </View>
                        <View style={modalStyles.breakdownRow}>
                            <Text style={modalStyles.breakdownLabel}>Serving Size</Text>
                            <Text style={modalStyles.breakdownValue}>{food.serving_size} {food.serving_unit}</Text>
                        </View>

                    </ScrollView>

                    <View style={modalStyles.buttonGroup}>
                        <TouchableOpacity style={modalStyles.closeButton} onPress={onClose}>
                            <Text style={modalStyles.closeButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={modalStyles.logButton} onPress={() => onLog(food)}>
                            <Text style={modalStyles.logButtonText}>Log Item</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};


export default function LogFoodScreen() {
  const { logMeal } = useApp();
  const { token } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('Breakfast');
  // --- NEW STATE for the modal ---
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  // Debouncing for the search bar (no change)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Fetch search results when debouncedQuery changes (no change)
  useEffect(() => {
    if (!token) return;

    const fetchFood = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URLS.FOOD_SEARCH}?search=${debouncedQuery}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to search for food');
        }
        const data = await response.json();
        setSearchResults(data.foods);
      } catch (e: any) {
        console.error("Failed to search food", e);
        Alert.alert("Error", e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFood();
  }, [debouncedQuery, token]);

  // --- 6. logMeal function from context is already dynamic! ---
  const handleLogMeal = (food: FoodItem) => {
    // Check if we are logging from the search list or the modal
    const foodToLog = food || selectedFood;

    if (!foodToLog) return;
    
    logMeal(foodToLog, selectedMealType)
      .then(() => {
        Alert.alert('Meal Logged', `${foodToLog.name} added to ${selectedMealType}.`);
        setSelectedFood(null); // Close modal
        router.back(); // Go back to the dashboard
      })
      .catch((e: any) => {
        Alert.alert("Error", `Could not log meal: ${e.message}`);
        setSelectedFood(null); // Close modal
      });
  };

  const MealTypeButton = ({ type }: { type: MealType }) => (
    <TouchableOpacity
      style={[styles.mealTypeButton, selectedMealType === type && styles.mealTypeButtonActive]}
      onPress={() => setSelectedMealType(type)}>
      <Text style={[styles.mealTypeText, selectedMealType === type && styles.mealTypeTextActive]}>
        {type}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FoodDetailsModal 
          food={selectedFood} 
          onClose={() => setSelectedFood(null)} 
          onLog={() => handleLogMeal(selectedFood as FoodItem)}
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Log Food</Text>
      </View>

      <View style={styles.searchBarRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.lightText} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a food..."
            placeholderTextColor={theme.lightText}
            value={searchQuery}
            onChangeText={setSearchQuery} // Updates the search query immediately
          />
        </View>
        
        {/* Button to open the Barcode Scanner */}
        <Link href="/(tabs)/scanner" asChild>
            <TouchableOpacity style={styles.scanButton}>
                <Ionicons name="barcode-outline" size={24} color={theme.primary} />
            </TouchableOpacity>
        </Link>
      </View>

      <View style={styles.mealTypeContainer}>
        <MealTypeButton type="Breakfast" />
        <MealTypeButton type="Lunch" />
        <MealTypeButton type="Dinner" />
        <MealTypeButton type="Snacks" />
      </View>

      {isLoading && <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />}

      <FlatList
        data={searchResults}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={() => (
          !isLoading ? ( 
            <Text style={styles.emptyText}>
              {debouncedQuery ? `No results found for "${debouncedQuery}"` : "Search for custom or common food items."}
            </Text>
          ) : null
        )}
        renderItem={({ item }) => (
          // Make the entire item clickable to open the modal
          <TouchableOpacity style={styles.foodItem} onPress={() => setSelectedFood(item)}>
            <View>
              <Text style={styles.foodName}>{item.name}</Text>
              <Text style={styles.foodDetails}>
                {item.calories} kcal • {item.serving_size} {item.serving_unit}
              </Text>
            </View>
            <Ionicons name="add-circle" size={32} color={theme.primary} />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { padding: 15, paddingTop: 40 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: theme.text },
  
  searchBarRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 10 },
  scanButton: { padding: 10, borderRadius: 10, marginLeft: 10, backgroundColor: theme.grey },
  
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.grey, borderRadius: 10, paddingHorizontal: 10 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 45, fontSize: 16 },
  
  mealTypeContainer: { flexDirection: 'row', justifyContent: 'space-around', margin: 15 },
  mealTypeButton: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, backgroundColor: theme.grey },
  mealTypeButtonActive: { backgroundColor: theme.primary },
  mealTypeText: { fontSize: 14, fontWeight: '600', color: theme.lightText },
  mealTypeTextActive: { color: theme.background },
  
  foodItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: theme.grey 
  },
  foodName: { fontSize: 16, fontWeight: '600', color: theme.text },
  foodDetails: { fontSize: 14, color: theme.lightText, marginTop: 4 },
  addButton: { padding: 5 },
  emptyText: { textAlign: 'center', marginTop: 30, fontSize: 16, color: theme.lightText }
});


// --- MODAL STYLES ---
const modalStyles = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalView: {
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 25,
        maxHeight: '85%',
    },
    scrollContent: {
        paddingBottom: 20
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.text,
        marginBottom: 5,
        textAlign: 'center'
    },
    servingInfo: {
        fontSize: 16,
        color: theme.lightText,
        marginBottom: 20,
        textAlign: 'center'
    },
    macroContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: theme.grey,
        borderRadius: 15,
        padding: 15,
        marginBottom: 25,
    },
    macroBox: {
        alignItems: 'center',
    },
    macroColor: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginBottom: 5,
    },
    macroValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.text,
    },
    macroLabel: {
        fontSize: 14,
        color: theme.lightText,
    },
    detailsHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.text,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.grey,
        paddingBottom: 5
    },
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F8F8F8'
    },
    breakdownLabel: {
        fontSize: 16,
        color: theme.text,
    },
    breakdownValue: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.primary,
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    closeButton: {
        flex: 1,
        backgroundColor: theme.grey,
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        marginRight: 10,
    },
    closeButtonText: {
        color: theme.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    logButton: {
        flex: 1,
        backgroundColor: theme.primary,
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        marginLeft: 10,
    },
    logButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});