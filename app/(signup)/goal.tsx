import { Ionicons } from '@expo/vector-icons'; // Added icons for better UX
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSignUp } from '../../context/SignUpContext';

// Defined the goal type for strict typing
type GoalType = 'lose_weight' | 'maintain_weight' | 'gain_weight';

const GOALS: { key: GoalType; text: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'lose_weight', text: 'Lose Weight', icon: 'trending-down-outline' },
  { key: 'maintain_weight', text: 'Maintain Weight', icon: 'fitness-outline' },
  { key: 'gain_weight', text: 'Gain Weight', icon: 'trending-up-outline' },
];

export default function GoalScreen() {
  const router = useRouter();
  const { updateData } = useSignUp();

  const handleSelectGoal = (goal: GoalType) => {
    updateData({ goal });
    // Navigate to the next step in your wizard (e.g., gender or activity)
    // rather than jumping straight to details if you have more steps.
    router.push('/(signup)/gender'); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.stepText}>Step 2 of 5</Text>
      <Text style={styles.title}>What's Your Goal?</Text>
      <Text style={styles.subtitle}>This helps us create a personalized plan for you.</Text>
      
      <View style={styles.optionsContainer}>
        {GOALS.map((goal) => (
          <TouchableOpacity 
            key={goal.key} 
            style={styles.optionButton} 
            onPress={() => handleSelectGoal(goal.key)}
          >
            <Ionicons name={goal.icon} size={24} color="#333" style={styles.icon} />
            <Text style={styles.optionText}>{goal.text}</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCC" style={styles.chevron} />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#FFFFFF', 
        padding: 20, 
        paddingTop: 40 
    },
    stepText: { 
        color: '#00A878', 
        fontWeight: 'bold', 
        marginBottom: 10,
        textAlign: 'center'
    },
    title: { 
        fontSize: 26, 
        fontWeight: 'bold', 
        color: '#333', 
        marginBottom: 10, 
        textAlign: 'center' 
    },
    subtitle: { 
        fontSize: 16, 
        color: '#777', 
        marginBottom: 40, 
        textAlign: 'center' 
    },
    optionsContainer: { 
        width: '100%',
        gap: 15 // Adds space between items
    },
    optionButton: { 
        flexDirection: 'row', // Align icon and text horizontally
        alignItems: 'center',
        width: '100%', 
        padding: 20, 
        backgroundColor: '#F8F8F8', 
        borderRadius: 15, 
        borderWidth: 1, 
        borderColor: '#EEE' 
    },
    icon: {
        marginRight: 15
    },
    optionText: { 
        fontSize: 18, 
        fontWeight: '600', 
        color: '#333',
        flex: 1 // Take up remaining space
    },
    chevron: {
        marginLeft: 'auto'
    }
});