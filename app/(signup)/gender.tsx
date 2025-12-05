import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSignUp } from '../../context/SignUpContext';

export default function GenderScreen() {
  const router = useRouter();
  const { updateData } = useSignUp();

  const handleSelect = (gender: 'male' | 'female' | 'other') => {
    updateData({ gender });
    router.push('/(signup)/activity');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.stepText}>Step 3 of 5</Text>
      <Text style={styles.title}>Which one identifies you?</Text>
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.optionButton} onPress={() => handleSelect('male')}>
           <Text style={styles.emoji}>👨</Text>
           <Text style={styles.optionText}>Male</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton} onPress={() => handleSelect('female')}>
           <Text style={styles.emoji}>👩</Text>
           <Text style={styles.optionText}>Female</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF', padding: 20, paddingTop: 40 },
    stepText: { color: '#00A878', fontWeight: 'bold', marginBottom: 10 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 30 },
    optionsContainer: { flexDirection: 'column', gap: 15 },
    optionButton: { alignItems: 'center', justifyContent: 'center', padding: 30, backgroundColor: '#F8F8F8', borderRadius: 15, borderWidth: 1, borderColor: '#EEE' },
    emoji: { fontSize: 40, marginBottom: 10 },
    optionText: { fontSize: 18, fontWeight: '600', color: '#333' },
});