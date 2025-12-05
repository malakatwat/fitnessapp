import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URLS } from '../../config';
import { useAuth } from '../../context/AuthContext';

const theme = {
  primary: '#00A878',
  background: '#FFFFFF',
  text: '#333',
  lightText: '#777',
  grey: '#F1F1F1',
};

export default function DietPlansScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [plan, setPlan] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generatePlan = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URLS.AI_RECOMMEND, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
            query: "Generate a meal plan for me today", 
            type: 'plan' 
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        setPlan(data.reply);
      } else {
        throw new Error(data.message || "Failed to generate plan");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Diet Planner</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Personalized for You</Text>
            <Text style={styles.cardDesc}>
                Get a daily meal plan tailored to your specific goals, weight, and Middle Eastern food preferences.
            </Text>
            
            <TouchableOpacity style={styles.generateButton} onPress={generatePlan} disabled={isLoading}>
                {isLoading ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <Text style={styles.buttonText}>Generate Today's Plan</Text>
                )}
            </TouchableOpacity>
        </View>

        {plan ? (
            <View style={styles.planContainer}>
                <Text style={styles.planTitle}>Your Recommended Plan</Text>
                <Text style={styles.planText}>{plan}</Text>
            </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.grey },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: theme.background, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 15, color: theme.text },
  content: { padding: 20 },
  card: { backgroundColor: theme.background, borderRadius: 15, padding: 20, marginBottom: 20, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: theme.text },
  cardDesc: { fontSize: 14, color: theme.lightText, textAlign: 'center', marginBottom: 20 },
  generateButton: { backgroundColor: theme.primary, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25, width: '100%', alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  planContainer: { backgroundColor: theme.background, borderRadius: 15, padding: 20 },
  planTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: theme.primary },
  planText: { fontSize: 15, lineHeight: 24, color: theme.text },
});