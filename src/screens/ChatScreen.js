const React = require('react');
const { useState, useEffect, useRef } = require('react');
const { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator 
} = require('react-native');
const { SafeAreaView } = require('react-native-safe-area-context');
const { Ionicons } = require('@expo/vector-icons');
const { theme } = require('../utils/theme');
const api = require('../utils/api').default;
const Toast = require('react-native-toast-message').default;
const { useSelector } = require('react-redux');
const { io } = require('socket.io-client');
const { useTheme } = require('../context/ThemeContext');

const SOCKET_URL = 'http://localhost:5000';

const ChatScreen = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);
  const socketRef = useRef(null);
  const { colors, isDark } = useTheme();

  const fetchMessages = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const { data } = await api.get('/chat/my-messages');
      setMessages(data);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(true);

    // Setup polling every 4 seconds (fallback)
    const intervalId = setInterval(() => {
      fetchMessages(false);
    }, 4000);

    // Setup Socket.io for real-time admin replies
    if (user?._id) {
      const socket = io(SOCKET_URL, { transports: ['websocket'] });
      socketRef.current = socket;

      // Join user-specific room
      socket.on('connect', () => {
        socket.emit('join', `user_${user._id}`);
      });

      // Listen for admin chat replies
      socket.on('newAdminChatReply', (message) => {
        setMessages(prev => {
          // Avoid duplicate if polling already fetched it
          const exists = prev.some(m => m._id === message._id);
          if (!exists) {
            return [...prev, message];
          }
          return prev;
        });
        Toast.show({
          type: 'success',
          text1: '💬 Support Reply',
          text2: 'Admin has replied to your message!',
          visibilityTime: 3000,
        });
      });
    }

    return () => {
      clearInterval(intervalId);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user?._id]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);

    // Optimistic local update
    const tempId = Date.now().toString();
    setMessages(prev => [...prev, { _id: tempId, text: textToSend, isAdmin: false, createdAt: new Date() }]);

    try {
      await api.post('/chat/send', { text: textToSend });
      // Fetch latest messages to sync IDs
      fetchMessages(false);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to send message',
        text2: 'Please try again later'
      });
      // Rollback optimistic update
      setMessages(prev => prev.filter(m => m._id !== tempId));
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }) => {
    const isMe = !item.isAdmin;
    return (
      <View style={[styles.messageWrapper, isMe ? styles.myMessageWrapper : styles.adminMessageWrapper]}>
        <View style={[styles.bubble, isMe ? styles.myBubble : [styles.adminBubble, { backgroundColor: colors.card }]]}>
          <Text style={[styles.messageText, isMe ? styles.myMessageText : [styles.adminMessageText, { color: colors.text }]]}>
            {item.text}
          </Text>
          <Text style={[styles.timeText, isMe ? styles.myTimeText : [styles.adminTimeText, { color: colors.textLight }]]}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Support Chat</Text>
          <View style={styles.onlineBadge}>
            <View style={styles.greenDot} />
            <Text style={styles.onlineText}>Online Support</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.text }]}
            placeholder="Type your message here..."
            placeholderTextColor={colors.textLight}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendBtn, { backgroundColor: colors.primary }, !inputText.trim() && styles.disabledSendBtn]} 
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            <Ionicons name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 5,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  onlineText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '700',
  },
  keyboardView: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 15,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 12,
    width: '100%',
  },
  myMessageWrapper: {
    justifyContent: 'flex-end',
  },
  adminMessageWrapper: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  myBubble: {
    backgroundColor: '#01B763',
    borderBottomRightRadius: 2,
  },
  adminBubble: {
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  adminMessageText: {
  },
  timeText: {
    fontSize: 9,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myTimeText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  adminTimeText: {
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 22,
    paddingHorizontal: 15,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 14,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  disabledSendBtn: {
    backgroundColor: '#9CA3AF',
  }
});

module.exports = ChatScreen;
