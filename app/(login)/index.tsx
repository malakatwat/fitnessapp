import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import AppleIcon from '../../assets/images/apple_icon.png';
import GoogleIcon from '../../assets/images/google_icon.png';
import Logo from '../../assets/images/logos/3.png';
import { API_URLS } from '../../config';
import { useAuth } from '../../context/AuthContext'; // --- 1. Import the useAuth hook ---

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BANNERS = [
  { image: require('../../assets/images/6.png'), description: 'Be part of a vibrant community, join exciting challenges, and hit your goals together.' },
  { image: require('../../assets/images/5_.png'), description: 'Get one-on-one consultations and science-based meal plans that fit your life.' },
  { image: require('../../assets/images/4_.png'), description: 'Snap a picture of your meal and instantly track calories, macros, and nutrients.' },
];

export default function LoginScreen() {
  const router = useRouter();
  const { setAuthToken } = useAuth(); // --- 2. Get the setAuthToken function ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Banner auto-scroll logic (no change)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % BANNERS.length;
        scrollViewRef.current?.scrollTo({
          x: nextIndex * (SCREEN_WIDTH - 40),
          animated: true,
        });
        return nextIndex;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // --- 3. THIS IS THE FIXED DYNAMIC LOGIN FUNCTION ---
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please enter your email and password.');
      return;
    }
    setIsLoading(true);
    
    try {
      // --- THIS IS THE FIX ---
      // We must tell fetch to use 'POST' and send the email/password
      const response = await fetch(API_URLS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // Send the email and password
      });
      // --- END OF FIX ---

      const result = await response.json();

      console.log('Server Response:', JSON.stringify(result, null, 2));

      if (!response.ok) {
        // If login failed (401, 404, 500)
        throw new Error(result.message || 'Login failed.');
      }
      
      if (result.token) {
        // SUCCESS
        await setAuthToken(result.token);
        router.replace('/(tabs)'); 
      } else {
        // This means the server sent a 200 OK, but the JSON had no token
        throw new Error("No token received from server.");
      }

    } catch (error: any) {
      // This will now show the *real* error message, like "Invalid credentials"
      Alert.alert('Login Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert('Coming Soon', `${provider} login is not yet available.`);
  };

  // --- The rest of your component's JSX (return statement) is unchanged ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <View style={styles.mainContainer}>
          
          <View style={styles.logoContainer}>
            <Image source={Logo} style={styles.logoImage} resizeMode="contain" />
          </View>

          <View style={styles.bannerContainer}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const newIndex = Math.round(event.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 40));
                setActiveIndex(newIndex);
              }}
              scrollEventThrottle={16}
              style={styles.bannerScrollView}>
              {BANNERS.map((banner, index) => (
                <View style={styles.bannerSlide} key={index}>
                  <View style={styles.bannerImageContainer}>
                    <Image source={banner.image} style={styles.bannerImage} resizeMode="cover" />
                  </View>
                  <Text style={styles.bannerDescription}>{banner.description}</Text>
                </View>
              ))}
            </ScrollView>
            {/* <View style={styles.pagination}>
              {BANNERS.map((_, index) => (
                <View key={index} style={[styles.dot, activeIndex === index && styles.dotActive]} />
              ))}
            </View> */}
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Log In</Text>}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('Google')}>
                <Image source={GoogleIcon} style={styles.socialIcon} />
                <Text style={styles.socialLabel}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('Apple')}>
                <Image source={AppleIcon} style={styles.socialIcon} />
                <Text style={styles.socialLabel}>Apple</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => router.push('/(signup)')} style={styles.signupContainer}>
              <Text style={styles.signupText}>
                Don't have an account?{' '}
                <Text style={styles.signupLink}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- STYLES (All styles are unchanged) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'space-around', 
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoImage: {
    width: 180,
    height: 90,
  },
  bannerContainer: {
    width: '100%',
    height: '45%', 
    maxHeight: 350,
  },
  bannerScrollView: {
    flex: 1,
  },
  bannerSlide: {
    width: SCREEN_WIDTH - 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerImageContainer: {
    width: '90%',
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: '#fff',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerDescription: {
    fontSize: 14,
    color: '#00A878',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 10,
    marginBottom:7,
    paddingHorizontal: 10,
  },
  pagination: {
    flexDirection: 'row',
    alignSelf: 'center',
    position: 'absolute',
    bottom: -1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CCC',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#00A878',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#F1F1F1',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#00A878',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#A0A0A0',
    fontSize: 12,
    fontWeight: '600',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  socialLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  signupContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 15,
  },
  signupText: {
    fontSize: 16,
    color: '#777',
  },
  signupLink: {
    color: '#00A878',
    fontWeight: 'bold',
  },
});