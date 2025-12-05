import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { API_URLS } from '../config';
import { useAuth } from './AuthContext';

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving_size?: number;
  serving_unit?: string;
}

export interface LoggedMeal {
  id: string;
  food: FoodItem;
  meal_type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
}

interface UserGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// --- 1. Update the Context Type to include fetchDiary ---
interface AppContextType {
  goals: UserGoals;
  loggedMeals: LoggedMeal[];
  logMeal: (food: FoodItem, mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks') => Promise<void>;
  fetchDiary: (authToken: string) => Promise<void>; // <-- ADDED THIS
  getTodaysTotals: () => { calories: number; protein: number; carbs: number; fat: number; };
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
}

export const AppProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const { token, user } = useAuth();
  const [loggedMeals, setLoggedMeals] = useState<LoggedMeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const goals: UserGoals = {
    calories: user?.goal === 'gain_weight' ? 2500 : (user?.goal === 'lose_weight' ? 1800 : 2200),
    protein: user?.goal === 'gain_weight' ? 180 : 150,
    carbs: user?.goal === 'gain_weight' ? 300 : 250,
    fat: user?.goal === 'gain_weight' ? 80 : 70,
  };

  useEffect(() => {
    if (token) {
      fetchDiary(token);
    } else {
      setLoggedMeals([]);
      setIsLoading(false);
    }
  }, [token]);

  const fetchDiary = async (authToken: string) => {
    setIsLoading(true);
    try {
      const today = getTodayDateString();
      const response = await fetch(`${API_URLS.DIARY}?date=${today}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch diary');
      }
      const data = await response.json();
      
      const formattedMeals: LoggedMeal[] = data.diary.map((item: any) => ({
        id: item.id.toString(),
        meal_type: item.meal_type,
        food: {
            id: item.food_id.toString(),
            name: item.name,
            calories: parseFloat(item.calories),
            protein: parseFloat(item.protein),
            carbs: parseFloat(item.carbs),
            fat: parseFloat(item.fat),
            serving_size: parseFloat(item.serving_size),
            serving_unit: item.serving_unit,
        }
      }));
      setLoggedMeals(formattedMeals);

    } catch (e) {
      console.error("Failed to fetch diary", e);
      // Removing Alert here to avoid spamming if offline
    } finally {
      setIsLoading(false);
    }
  };

  const logMeal = async (food: FoodItem, mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks') => {
    if (!token) {
      Alert.alert("Error", "You must be logged in to log a meal.");
      return;
    }

    try {
      const response = await fetch(API_URLS.DIARY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          food_id: food.id,
          meal_type: mealType
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to log meal');
      }
      
      await fetchDiary(token);

    } catch (e: any) {
      console.error("Failed to log meal", e);
      Alert.alert("Notice", e.message);
    }
  };

  const getTodaysTotals = () => {
    return loggedMeals.reduce((totals, meal) => {
        totals.calories += meal.food.calories;
        totals.protein += meal.food.protein;
        totals.carbs += meal.food.carbs;
        totals.fat += meal.food.fat;
        return totals;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  return (
    // --- 2. Include fetchDiary in the value object ---
    <AppContext.Provider value={{ goals, loggedMeals, logMeal, fetchDiary, getTodaysTotals, isLoading }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};