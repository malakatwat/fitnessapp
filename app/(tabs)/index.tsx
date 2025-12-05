import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'; // 1. Import ActivityIndicator
import { SafeAreaView } from 'react-native-safe-area-context';
import { Circle, Svg } from 'react-native-svg';
import { LoggedMeal, useApp } from '../../context/AppContext';

const theme = {
  primary: '#00A878',
  secondary: '#D3F3EE',
  background: '#FFFFFF',
  text: '#333',
  lightText: '#777',
  grey: '#F1F1F1',
  blue: '#3498db',
  orange: '#f39c12',
  red: '#e74c3c',
};

// --- (ProgressCircle and MacroBar components are unchanged) ---
const ProgressCircle = ({ progress, goal, label }: {progress: number, goal: number, label: string}) => {
    const radius = 60;
    const strokeWidth = 12;
    const circumference = 2 * Math.PI * radius;
    const goalSafe = Math.max(goal, 1);
    const progressSafe = Math.min(progress, goalSafe);
    const strokeDashoffset = circumference - (progressSafe / goalSafe) * circumference;

    return (
        <View style={styles.circleContainer}>
            <Svg height={radius * 2 + 20} width={radius * 2 + 20}>
                <Circle stroke={theme.grey} fill="none" cx={radius + 10} cy={radius + 10} r={radius} strokeWidth={strokeWidth} />
                <Circle
                    stroke={theme.primary}
                    fill="none"
                    cx={radius + 10}
                    cy={radius + 10}
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${radius + 10} ${radius + 10})`}
                />
            </Svg>
            <View style={styles.circleTextContainer}>
                <Text style={styles.circleValue}>{Math.round(goal - progress)}</Text>
                <Text style={styles.circleLabel}>{label}</Text>
            </View>
        </View>
    );
};

const MacroBar = ({ label, current, goal, color }: {label: string, current: number, goal: number, color: string}) => {
    const percentage = (current / Math.max(goal, 1)) * 100;
    return (
        <View style={styles.macroContainer}>
            <Text style={styles.macroLabel}>{label}</Text>
            <View style={styles.macroBarBackground}>
                <View style={[styles.macroBarFill, { width: `${Math.min(percentage, 100)}%`, backgroundColor: color }]} />
            </View>
            <Text style={styles.macroValue}>{Math.round(current)} / {goal}g</Text>
        </View>
    );
};
// --- (FeatureButton component is unchanged) ---
const FeatureButton = ({ href, icon, label }: { href: string, icon: any, label: string }) => (
  <Link href={href as any} asChild>
    <TouchableOpacity style={styles.featureButton}>
      <View style={[styles.iconWrapper, { backgroundColor: theme.secondary }]}>
        <Ionicons name={icon} size={28} color={theme.primary} />
      </View>
      <Text style={styles.featureLabel}>{label}</Text>
    </TouchableOpacity>
  </Link>
);

// --- 2. Update MealCard to use `meal_type` ---
const MealCard = ({ mealType, meals }: {mealType: string, meals: LoggedMeal[]}) => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{mealType}</Text>
            <Link href="/(tabs)/logFood" asChild>
                <TouchableOpacity style={styles.addButton}>
                    <Ionicons name="add" size={24} color={theme.primary} />
                </TouchableOpacity>
            </Link>
        </View>
        {meals.length > 0 ? meals.map((meal) => (
            <View key={meal.id} style={styles.mealItem}>
                <Text style={styles.mealName}>{meal.food.name}</Text>
                <Text style={styles.mealCalories}>{meal.food.calories} kcal</Text>
            </View>
        )) : (
            <Text style={styles.emptyText}>No items logged yet.</Text>
        )}
    </View>
);

// --- Main Dashboard Screen ---
export default function DashboardScreen() {
    // 3. Get the new `isLoading` state from our context
    const { goals, loggedMeals, getTodaysTotals, isLoading } = useApp();
    const totals = getTodaysTotals();

    // 4. Show a full-screen loading spinner
    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={styles.loadingText}>Loading your diary...</Text>
            </SafeAreaView>
        );
    }

    // 5. Once loading is false, show the dashboard
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.headerTitle}>Dashboard</Text>
                
                <Text style={styles.sectionTitle}>Today's Summary</Text>
                <View style={[styles.card, styles.summaryContainer]}>
                    <ProgressCircle progress={totals.calories} goal={goals.calories} label="kcal left" />
                    <View style={styles.macros}>
                        <MacroBar label="Protein" current={totals.protein} goal={goals.protein} color={theme.blue} />
                        <MacroBar label="Carbs" current={totals.carbs} goal={goals.carbs} color={theme.orange} />
                        <MacroBar label="Fat" current={totals.fat} goal={goals.fat} color={theme.red} />
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Explore Features</Text>
                <View style={styles.featuresGrid}>
                  <FeatureButton href="/(tabs)/consultation" icon="chatbubbles-outline" label="Consultation" />
                  <FeatureButton href="/(tabs)/challenges" icon="trophy-outline" label="Challenges" />
                  <FeatureButton href="/(tabs)/dietPlans" icon="document-text-outline" label="Diet Plans" />
                  <FeatureButton href="/(tabs)/recipes" icon="restaurant-outline" label="Recipes" />
                  <FeatureButton href="/(tabs)/reports" icon="stats-chart-outline" label="Reports" />
                </View>

                {/* 6. This filter is now updated to use `meal_type` */}
                <Text style={styles.sectionTitle}>Today's Diary</Text>
                <MealCard mealType="Breakfast" meals={loggedMeals.filter(m => m.meal_type === 'Breakfast')} />
                <MealCard mealType="Lunch" meals={loggedMeals.filter(m => m.meal_type === 'Lunch')} />
                <MealCard mealType="Dinner" meals={loggedMeals.filter(m => m.meal_type === 'Dinner')} />
                <MealCard mealType="Snacks" meals={loggedMeals.filter(m => m.meal_type === 'Snacks')} />

            </ScrollView>
        </SafeAreaView>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.grey },
    // 7. New styles for the loading screen
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: theme.lightText,
    },
    scrollContainer: { padding: 15, paddingBottom: 30 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: theme.text, marginBottom: 15, paddingTop: 20 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: theme.text, marginVertical: 10, marginTop: 15 },
    card: { backgroundColor: theme.background, borderRadius: 15, padding: 15, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3 },
    summaryContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    circleContainer: { alignItems: 'center', justifyContent: 'center' },
    circleTextContainer: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
    circleValue: { fontSize: 24, fontWeight: 'bold', color: theme.primary },
    circleLabel: { fontSize: 14, color: theme.lightText },
    macros: { flex: 1, marginLeft: 20 },
    macroContainer: { marginBottom: 10 },
    macroLabel: { fontSize: 14, color: theme.text },
    macroBarBackground: { height: 8, backgroundColor: theme.grey, borderRadius: 4, marginTop: 4, overflow: 'hidden' },
    macroBarFill: { height: '100%', borderRadius: 4 },
    macroValue: { fontSize: 12, color: theme.lightText, textAlign: 'right', marginTop: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    cardTitle: { fontSize: 20, fontWeight: 'bold', color: theme.text },
    addButton: { padding: 5 },
    mealItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.grey },
    mealName: { fontSize: 16, color: theme.text },
    mealCalories: { fontSize: 16, color: theme.lightText },
    emptyText: { fontSize: 14, color: theme.lightText, paddingVertical: 10 },
    featuresGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    featureButton: {
      backgroundColor: theme.background,
      width: '48%', 
      aspectRatio: 1.1, 
      padding: 10,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 3,
    },
    iconWrapper: {
      padding: 12,
      borderRadius: 25, 
      marginBottom: 10,
    },
    featureLabel: {
      fontSize: 15, 
      fontWeight: '600',
      color: theme.text,
      textAlign: 'center',
    },
});