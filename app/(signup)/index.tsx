import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import Logo from '../../assets/images/logos/3.png'; // Assuming logo is in root assets
import { useSignUp } from '../../context/SignUpContext';

export default function SignUpScreen() {
  const router = useRouter();
  const { updateData } = useSignUp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleContinue = () => {
    // --- THIS IS THE FIX ---
    // We must check for all fields *and* save all three fields to the context.
    if (!name || !email || !password) {
      Alert.alert('Missing Information', 'Please fill out all fields.');
      return;
    }

    updateData({ name, email, password });
    router.push('/(signup)/goal'); // Now we can go to the next screen
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image source={Logo} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Create Your Account</Text>
      <TextInput style={styles.input} placeholder="Your Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// Add styles at the bottom
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', padding: 20 },
    logo: { width: 100, height: 100, marginBottom: 30 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20 },
    input: { width: '100%', height: 50, backgroundColor: '#F1F1F1', borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, fontSize: 16 },
    button: { width: '100%', height: 50, backgroundColor: '#00A878', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});
