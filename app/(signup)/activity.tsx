import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSignUp } from '../../context/SignUpContext';

const LEVELS = [
    { key: 'sedentary', text: 'Not Very Active', desc: 'Spend most of the day sitting' },
    { key: 'light', text: 'Lightly Active', desc: 'Some movement during the day' },
    { key: 'moderate', text: 'Active', desc: 'Active throughout the day' },
    { key: 'active', text: 'Very Active', desc: 'Intense activity daily' },
];

export default function ActivityScreen() {
  const router = useRouter();
  const { updateData } = useSignUp();

  const handleSelect = (activityLevel: any) => {
    updateData({ activityLevel });
    router.push('/(signup)/details');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.stepText}>Step 4 of 5</Text>
      <Text style={styles.title}>Your Activity Level?</Text>
      <View style={styles.optionsContainer}>
        {LEVELS.map((level) => (
          <TouchableOpacity key={level.key} style={styles.optionButton} onPress={() => handleSelect(level.key)}>
            <Text style={styles.optionText}>{level.text}</Text>
            <Text style={styles.optionDesc}>{level.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF', padding: 20, paddingTop: 40 },
    stepText: { color: '#00A878', fontWeight: 'bold', marginBottom: 10 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 30 },
    optionsContainer: { gap: 15 },
    optionButton: { padding: 20, backgroundColor: '#F8F8F8', borderRadius: 15, borderWidth: 1, borderColor: '#EEE' },
    optionText: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 5 },
    optionDesc: { fontSize: 14, color: '#666' },
}); 