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
  gold: '#FFD700',
  joined: '#4CAF50' // Color for "Joined" state
};

// 1. Updated ChallengeCard to handle "Joined" state and "View Details"
const ChallengeCard = ({ 
  title, 
  members, 
  icon, 
  isAi = false, 
  description = "",
  isJoined = false, // New prop
  onJoin,
  onViewDetails // New prop
}: {
  title: string, 
  members?: string, 
  icon: any, 
  isAi?: boolean, 
  description?: string,
  isJoined?: boolean,
  onJoin: () => void,
  onViewDetails: () => void
}) => (
  <View style={[styles.card, isAi && styles.aiCard]}>
    <View style={styles.cardHeader}>
        <Ionicons name={icon} size={40} color={isAi ? theme.background : theme.primary} style={styles.cardIcon} />
        <View style={styles.cardHeaderText}>
            <Text style={[styles.cardTitle, isAi && styles.aiText]}>{title}</Text>
            {members && (
                <View style={styles.membersContainer}>
                    <Ionicons name="people" size={16} color={isAi ? 'rgba(255,255,255,0.8)' : theme.lightText} />
                    <Text style={[styles.membersText, isAi && styles.aiText]}>{members} joined</Text>
                </View>
            )}
        </View>
    </View>
    
    {/* Always show description if available */}
    {description ? <Text style={[styles.cardDesc, isAi && styles.aiText]}>{description}</Text> : null}

    <View style={styles.buttonRow}>
      {isJoined ? (
        <TouchableOpacity style={[styles.joinButton, styles.joinedButton]} onPress={onViewDetails}>
          <Text style={styles.joinedButtonText}>View Details</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={[styles.joinButton, isAi && styles.aiJoinButton]} onPress={onJoin}>
          <Text style={[styles.joinButtonText, isAi && styles.aiJoinText]}>Join Now</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

export default function ChallengesScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [aiChallenge, setAiChallenge] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // 2. State to track joined challenges
  const [joinedChallenges, setJoinedChallenges] = useState<string[]>([]);

  const generateChallenge = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URLS.AI_RECOMMEND, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
            query: "Create a challenge for me", 
            type: 'challenge' 
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        setAiChallenge(data.reply);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      Alert.alert("Error", "Could not generate challenge.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Handle Joining
  const handleJoinChallenge = (challengeTitle: string) => {
    // Add to joined list
    setJoinedChallenges([...joinedChallenges, challengeTitle]);
    
    Alert.alert(
        "Challenge Joined!", 
        `You are now part of "${challengeTitle}". Check the details to start your progress!`,
        [{ text: "OK" }]
    );
  };

  // 4. Handle Viewing Details (Mock Navigation)
  const handleViewDetails = (challengeTitle: string) => {
     // In a real app, this would navigate: router.push(`/challenges/${id}`)
     Alert.alert(
         challengeTitle,
         "Challenge Dashboard\n\n• Day 1: Complete\n• Day 2: Pending\n\nKeep up the great work!",
         [{ text: "Close" }]
     );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community Challenges</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* --- AI Section --- */}
        <View style={styles.aiSection}>
            <Text style={styles.sectionTitle}>Just For You</Text>
            {!aiChallenge ? (
                <View style={styles.promoContainer}>
                    <Ionicons name="sparkles" size={30} color={theme.gold} />
                    <Text style={styles.promoText}>Need a boost? Get a personalized challenge based on your goals.</Text>
                    <TouchableOpacity style={styles.generateButton} onPress={generateChallenge} disabled={isLoading}>
                        {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Create My Challenge</Text>}
                    </TouchableOpacity>
                </View>
            ) : (
                <ChallengeCard 
                    title="Your AI Challenge" 
                    description={aiChallenge} 
                    icon="ribbon-outline" 
                    isAi={true} 
                    isJoined={joinedChallenges.includes("Your AI Challenge")}
                    onJoin={() => handleJoinChallenge("Your AI Challenge")}
                    onViewDetails={() => handleViewDetails("Your AI Challenge")}
                />
            )}
        </View>

        {/* --- Popular Section --- */}
        <Text style={styles.sectionTitle}>Trending Now</Text>
        
        <ChallengeCard 
            title="30-Day Summer Detox" 
            members="1,450" 
            icon="leaf-outline" 
            description="Cleanse your body with this month-long whole food plan."
            isJoined={joinedChallenges.includes("30-Day Summer Detox")}
            onJoin={() => handleJoinChallenge("30-Day Summer Detox")}
            onViewDetails={() => handleViewDetails("30-Day Summer Detox")}
        />
        
        <ChallengeCard 
            title="Lose 5kg in 6 Weeks" 
            members="2,800" 
            icon="flame-outline" 
            description="High intensity cardio combined with a calorie deficit plan."
            isJoined={joinedChallenges.includes("Lose 5kg in 6 Weeks")}
            onJoin={() => handleJoinChallenge("Lose 5kg in 6 Weeks")}
            onViewDetails={() => handleViewDetails("Lose 5kg in 6 Weeks")}
        />
        
        <ChallengeCard 
            title="Hydration Heroes" 
            members="950" 
            icon="water-outline" 
            description="Track your water intake and hit 3L daily for a month."
            isJoined={joinedChallenges.includes("Hydration Heroes")}
            onJoin={() => handleJoinChallenge("Hydration Heroes")}
            onViewDetails={() => handleViewDetails("Hydration Heroes")}
        />
        
        <ChallengeCard 
            title="Steps Champion" 
            members="5,120" 
            icon="walk-outline" 
            description="Hit 10,000 steps every day. Compete on the leaderboard!"
            isJoined={joinedChallenges.includes("Steps Champion")}
            onJoin={() => handleJoinChallenge("Steps Champion")}
            onViewDetails={() => handleViewDetails("Steps Champion")}
        />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.grey },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: theme.background, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 15, color: theme.text },
  content: { padding: 15 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: theme.text, marginBottom: 15, marginTop: 10 },
  
  // Card Styles
  card: { backgroundColor: theme.background, borderRadius: 15, padding: 20, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardHeaderText: { marginLeft: 15, flex: 1 },
  cardIcon: { },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: theme.text },
  cardDesc: { fontSize: 14, color: theme.lightText, marginBottom: 15, lineHeight: 20 },
  membersContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  membersText: { fontSize: 14, color: theme.lightText, marginLeft: 5 },
  
  buttonRow: { flexDirection: 'row', marginTop: 5 },
  joinButton: { backgroundColor: theme.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, alignSelf: 'flex-start' },
  joinButtonText: { color: theme.background, fontSize: 14, fontWeight: 'bold' },
  
  joinedButton: { backgroundColor: theme.grey, borderWidth: 1, borderColor: theme.primary },
  joinedButtonText: { color: theme.primary, fontSize: 14, fontWeight: 'bold' },

  // AI Specific Styles
  aiSection: { marginBottom: 20 },
  aiCard: { backgroundColor: theme.primary },
  aiText: { color: '#FFF' },
  aiJoinButton: { backgroundColor: '#FFF' },
  aiJoinText: { color: theme.primary },
  
  promoContainer: { backgroundColor: theme.background, borderRadius: 15, padding: 20, alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: theme.primary },
  promoText: { textAlign: 'center', color: theme.lightText, marginVertical: 10 },
  generateButton: { backgroundColor: theme.primary, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25, marginTop: 5 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});