import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { API_URLS } from '../../config';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const theme = {
  primary: '#00A878',
  background: '#FFFFFF',
  text: '#333',
  lightText: '#777',
  grey: '#F1F1F1',
};

// Default set of serving units
const SERVING_UNITS = ['g', 'oz', 'ml', 'cup', 'slice', 'piece', 'serving'];

export default function CustomFoodEntryScreen() {
    const router = useRouter();
    const { token } = useAuth();
    const { fetchDiary } = useApp(); // We need this to refresh the dashboard after saving

    const [name, setName] = useState('');
    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fat, setFat] = useState('');
    const [servingSize, setServingSize] = useState('100');
    const [servingUnit, setServingUnit] = useState('g');
    const [isLoading, setIsLoading] = useState(false);

    const handleSaveAndLog = async () => {
        // 1. Basic Client-Side Validation
        if (!name || !calories || !servingUnit) {
            Alert.alert('Missing Data', 'Please provide a Name, Calorie count, and Serving Unit.');
            return;
        }

        setIsLoading(true);

        const payload = {
            name,
            calories: parseFloat(calories || '0'),
            protein: parseFloat(protein || '0'),
            carbs: parseFloat(carbs || '0'),
            fat: parseFloat(fat || '0'),
            serving_size: parseFloat(servingSize || '1'),
            serving_unit: servingUnit,
        };
        
        try {
            // 2. Post the custom food to the dedicated API endpoint
            const response = await fetch(API_URLS.FOOD_CUSTOM, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok || !result.foodId) {
                throw new Error(result.message || 'Failed to save food item.');
            }

            // 3. Optional: Automatically log the newly created food item
            // Since this is a new feature, we skip the automatic logging for now,
            // but the food is now searchable!
            
            // 4. Success and Navigation
            Alert.alert('Success', `${name} has been saved to your custom food list and is now searchable!`);
            fetchDiary(token); // Refresh the main app data
            router.back(); // Go back to the Log Food search screen

        } catch (error: any) {
            console.error('Manual Save Error:', error);
            Alert.alert('Error', error.message || 'Could not connect to server.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close-outline" size={30} color={theme.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Custom Food</Text>
                <View style={{ width: 30 }} /> 
            </View>
            
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>

                    <TextInput 
                        style={styles.input} 
                        placeholder="Food Name (e.g., Homemade Smoothie)"
                        value={name} 
                        onChangeText={setName} 
                    />
                    <TextInput 
                        style={styles.input} 
                        placeholder="Total Calories (Kcal)"
                        value={calories} 
                        onChangeText={setCalories} 
                        keyboardType="numeric"
                    />

                    <Text style={styles.sectionTitle}>Serving Size</Text>
                    <View style={styles.servingRow}>
                        <TextInput 
                            style={[styles.input, styles.servingInput]} 
                            placeholder="Amount (e.g., 250)"
                            value={servingSize} 
                            onChangeText={setServingSize} 
                            keyboardType="numeric"
                        />
                        <View style={styles.unitPicker}>
                            {/* Simple Unit Selector */}
                            {SERVING_UNITS.map(unit => (
                                <TouchableOpacity 
                                    key={unit}
                                    style={[styles.unitButton, servingUnit === unit && styles.unitButtonActive]}
                                    onPress={() => setServingUnit(unit)}
                                >
                                    <Text style={[styles.unitText, servingUnit === unit && {color: theme.background}]}>
                                        {unit}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Macronutrients (Optional)</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="Protein (g)"
                        value={protein} 
                        onChangeText={setProtein} 
                        keyboardType="numeric"
                    />
                    <TextInput 
                        style={styles.input} 
                        placeholder="Carbohydrates (g)"
                        value={carbs} 
                        onChangeText={setCarbs} 
                        keyboardType="numeric"
                    />
                    <TextInput 
                        style={styles.input} 
                        placeholder="Fat (g)"
                        value={fat} 
                        onChangeText={setFat} 
                        keyboardType="numeric"
                    />

                </ScrollView>
                
                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={styles.saveButton} 
                        onPress={handleSaveAndLog} 
                        disabled={isLoading || !name || !calories}
                    >
                        {isLoading 
                            ? <ActivityIndicator color="#FFFFFF" />
                            : <Text style={styles.saveButtonText}>Save Food & Make Searchable</Text>
                        }
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: { 
        flexDirection: 'row', alignItems: 'center', 
        justifyContent: 'space-between', padding: 15,
        borderBottomWidth: 1, borderBottomColor: theme.grey,
        paddingTop: Platform.OS === 'android' ? 40 : 15,
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.text },
    
    scrollContent: { padding: 20, paddingBottom: 100 },
    
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.primary, marginTop: 25, marginBottom: 15 },
    
    input: {
        width: '100%', 
        height: 50, 
        backgroundColor: theme.grey, 
        borderRadius: 10, 
        paddingHorizontal: 15, 
        marginBottom: 10, 
        fontSize: 16,
        color: theme.text
    },
    
    servingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    servingInput: {
        flex: 0.5,
        marginRight: 10,
        marginBottom: 0
    },
    unitPicker: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'flex-start'
    },
    unitButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: theme.grey,
    },
    unitButtonActive: {
        backgroundColor: theme.primary,
    },
    unitText: {
        color: theme.lightText,
        fontWeight: '600'
    },

    footer: {
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: theme.grey,
        backgroundColor: theme.background,
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
    saveButton: {
        width: '100%',
        height: 55,
        backgroundColor: theme.primary,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});