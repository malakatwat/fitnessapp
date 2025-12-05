import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext'; // 1. Get goals from AppContext
import { useAuth } from '../../context/AuthContext'; // 2. Import useAuth for logout

const theme = {
  primary: '#00A878',
  background: '#FFFFFF',
  text: '#333',
  lightText: '#777',
  grey: '#F1F1F1',
};

const ProfileRow = ({ icon, label, value }: {icon: any, label: string, value: string | number}) => (
  <View style={styles.row}>
    <Ionicons name={icon} size={24} color={theme.primary} style={styles.icon} />
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { goals } = useApp(); // 3. These goals are now dynamic
  const { logout } = useAuth(); // 4. Get the logout function

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive", 
          onPress: () => {
          logout();           
          router.replace('/(login)'); 
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>My Daily Goals</Text>
        {/* 7. This data is now 100% from your database */}
        <ProfileRow icon="flame-outline" label="Calories" value={`${goals.calories} kcal`} />
        <ProfileRow icon="fish-outline" label="Protein" value={`${goals.protein} g`} />
        <ProfileRow icon="bicycle-outline" label="Carbohydrates" value={`${goals.carbs} g`} />
        <ProfileRow icon="nutrition-outline" label="Fat" value={`${goals.fat} g`} />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
        <Ionicons name="log-out-outline" size={22} color="#e74c3c" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.grey },
  header: { padding: 15, backgroundColor: theme.background, paddingTop: 40 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: theme.text },
  card: { backgroundColor: theme.background, borderRadius: 15, padding: 15, margin: 15 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: theme.text, marginBottom: 15 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: theme.grey },
  icon: { marginRight: 15 },
  label: { flex: 1, fontSize: 16, color: theme.text },
  value: { fontSize: 16, fontWeight: '600', color: theme.lightText },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.background,
    borderRadius: 15,
    padding: 15,
    margin: 15,
    marginTop: 5,
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginRight: 10,
  },
});