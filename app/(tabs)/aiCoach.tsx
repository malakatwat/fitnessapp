import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert,
  FlatList,
  KeyboardAvoidingView, Platform,
  StyleSheet,
  Text,
  TextInput, TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URLS } from '../../config';
import { useAuth } from '../../context/AuthContext';

const theme = {
  primary: '#00A878',
  background: '#FFFFFF',
  text: '#333',
  lightText: '#777',
  grey: '#F1F1F1',
  userBubble: '#00A878',
  dietitianBubble: '#E8E8E8',
};

interface Message {
  id: number;
  sender_id: number;
  message: string;
  created_at: string;
}

export default function ConsultationScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // 1. Poll for new messages every 3 seconds
  // This allows us to see the AI's reply appearing "live"
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); 
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    if (!token) return;
    try {
      const response = await fetch(API_URLS.CHAT, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Error fetching messages", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle sending a message
  const handleSend = async () => {
    if (!newMessage.trim()) return;
    
    const messageToSend = newMessage;
    setNewMessage(''); // Clear input immediately for better UX

    try {
      // Send user message to backend
      await fetch(API_URLS.CHAT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: messageToSend })
      });
      
      // Refresh immediately to show user's message
      fetchMessages(); 
      
      // The backend will process the AI reply in the background.
      // The polling (setInterval) will pick it up in a few seconds.

    } catch (error) {
      Alert.alert("Error", "Failed to send message");
    }
  };

  // 3. Render a single message bubble
  const renderMessage = ({ item }: { item: Message }) => {
    // If sender_id matches user, it's ME (Right). If 0, it's AI/Dietitian (Left).
    const isMe = item.sender_id === user?.id;
    
    return (
      <View style={[
        styles.messageBubble, 
        isMe ? styles.myMessage : styles.theirMessage
      ]}>
        <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
          {item.message}
        </Text>
        <Text style={[styles.timeText, isMe ? {color: 'rgba(255,255,255,0.7)'} : {color: '#999'}]}>
            {new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* --- Header Section --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Dr. Malak Atwat (Dietitian)</Text>
            <View style={styles.statusContainer}>
                <View style={styles.onlineDot} />
                <Text style={styles.headerStatus}>Online</Text>
            </View>
        </View>
        <TouchableOpacity>
            <Ionicons name="videocam-outline" size={26} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {/* --- Messages List --- */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
            !isLoading ? <Text style={styles.emptyText}>Say "Hi" to start your AI consultation!</Text> : null
        }
      />
      
      {isLoading && messages.length === 0 && (
         <View style={styles.centerLoader}>
            <ActivityIndicator size="large" color={theme.primary} />
         </View>
      )}

      {/* --- Input Bar --- */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Ask about diet, protein, or recipes..."
            placeholderTextColor="#999"
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]} 
            onPress={handleSend}
            disabled={!newMessage.trim()}
          >
            <Ionicons name="send" size={20} color="#FFF" style={{marginLeft: 2}} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  
  // Header Styles
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 15, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, shadowOffset: {width:0, height:2}
  },
  headerInfo: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.text },
  statusContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50', marginRight: 5 },
  headerStatus: { fontSize: 12, color: theme.lightText },

  // Chat List Styles
  chatContent: { padding: 15, paddingBottom: 20 },
  
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 12,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: theme.userBubble,
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: theme.dietitianBubble,
    borderBottomLeftRadius: 4,
  },
  messageText: { fontSize: 16, lineHeight: 22 },
  myMessageText: { color: '#FFF' },
  theirMessageText: { color: '#333' },
  timeText: { fontSize: 10, alignSelf: 'flex-end', marginTop: 4 },
  
  // Input Bar Styles
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    padding: 10, paddingHorizontal: 15,
    backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE'
  },
  input: {
    flex: 1, backgroundColor: '#F5F5F5', borderRadius: 24,
    paddingHorizontal: 15, paddingVertical: 10, fontSize: 16, maxHeight: 100,
    color: '#333'
  },
  sendButton: {
    backgroundColor: theme.primary, borderRadius: 25, width: 45, height: 45,
    alignItems: 'center', justifyContent: 'center', marginLeft: 10,
    elevation: 2
  },
  sendButtonDisabled: {
    backgroundColor: '#CCC',
    elevation: 0
  },
  
  emptyText: { textAlign: 'center', color: '#999', marginTop: 50, fontSize: 16 },
  centerLoader: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }
});