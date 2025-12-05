import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity
} from 'react-native';
import { API_URLS } from '../../config';
import { useSignUp } from '../../context/SignUpContext';

export default function DetailsScreen() {
  const router = useRouter();
  const { data } = useSignUp();
  const [age, setAge] = useState('');
  const [height, setHeight] = useState(''); 
  const [currentWeight, setCurrentWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFinish = async () => {
    // 1. Validate current screen fields
    if (!age || !height || !currentWeight || !targetWeight) {
        Alert.alert('Missing Information', 'Please fill out all fields on this screen.');
        return;
    }

    // 2. Create the final payload
    const finalData = { ...data, age, height, currentWeight, targetWeight };
    
    // 3. Validate COMPLETE payload (check previous steps)
    // This prevents sending incomplete data to the server
    if (!finalData.name || !finalData.email || !finalData.password || !finalData.goal) {
        Alert.alert(
            'Error', 
            'Missing data from a previous step. Please restart the signup process.',
            [{ text: 'Restart', onPress: () => router.replace('/(signup)') }]
        );
        return;
    }

    console.log('Sending Data:', finalData);
    setIsLoading(true);

    try {
      const response = await fetch(API_URLS.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData), 
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed.');
      }

      Alert.alert('Success!', 'Account created. Please log in.');
      router.replace('/(login)'); 

    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <Text style={styles.stepText}>Step 5 of 5</Text>
        <Text style={styles.title}>Just a few more details</Text>
        <Text style={styles.subtitle}>This helps us calculate your daily calorie needs.</Text>
        
        <TextInput style={styles.input} placeholder="Age" value={age} onChangeText={setAge} keyboardType="number-pad" />
        <TextInput style={styles.input} placeholder="Height (cm)" value={height} onChangeText={setHeight} keyboardType="number-pad" />
        <TextInput style={styles.input} placeholder="Current Weight (kg)" value={currentWeight} onChangeText={setCurrentWeight} keyboardType="decimal-pad" />
        <TextInput style={styles.input} placeholder="Target Weight (kg)" value={targetWeight} onChangeText={setTargetWeight} keyboardType="decimal-pad" />
        
        <TouchableOpacity style={styles.button} onPress={handleFinish} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Create Account</Text>}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF', padding: 20, paddingTop: 40 },
    stepText: { color: '#00A878', fontWeight: 'bold', marginBottom: 10 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 10 },
    subtitle: { fontSize: 16, color: '#777', marginBottom: 30 },
    input: { width: '100%', height: 55, backgroundColor: '#F8F8F8', borderRadius: 12, paddingHorizontal: 20, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#EEE' },
    button: { width: '100%', height: 55, backgroundColor: '#00A878', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
    buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});