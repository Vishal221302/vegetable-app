const React = require('react');
const { useState, useEffect, useRef } = require('react');
const { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
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

const EmailSupportScreen = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [expandedTicketId, setExpandedTicketId] = useState(null);
  const socketRef = useRef(null);
  const { colors, isDark } = useTheme();

  const fetchTickets = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const { data } = await api.get('/tickets/my-tickets');
      setTickets(data);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(true);

    // Socket.io for real-time ticket reply notifications
    if (user?._id) {
      const socket = io(SOCKET_URL, { transports: ['websocket'] });
      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('join', `user_${user._id}`);
      });

      socket.on('newTicketReply', ({ ticketId, text, status }) => {
        // Refresh tickets list
        fetchTickets(false);
        // Auto-expand the replied ticket
        setExpandedTicketId(ticketId);
        Toast.show({
          type: 'success',
          text1: '📧 Support Reply',
          text2: 'Admin has replied to your ticket!',
          visibilityTime: 3500,
        });
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user?._id]);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Required Fields',
        text2: 'Please enter both subject and message.'
      });
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/tickets', {
        subject: subject.trim(),
        message: message.trim()
      });
      Toast.show({
        type: 'success',
        text1: 'Ticket Created',
        text2: 'Our support team will get back to you shortly!'
      });
      setSubject('');
      setMessage('');
      fetchTickets(false);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Submission Failed',
        text2: error.response?.data?.message || 'Could not create ticket'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExpand = (ticketId) => {
    if (expandedTicketId === ticketId) {
      setExpandedTicketId(null);
    } else {
      setExpandedTicketId(ticketId);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Email Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Create Ticket Card */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Submit a Support Ticket</Text>
          
          <Text style={[styles.label, { color: colors.textSecondary }]}>Subject</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.text }]}
            placeholder="e.g. Order Delivery Issue"
            placeholderTextColor={colors.textLight}
            value={subject}
            onChangeText={setSubject}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Message Details</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.surfaceSecondary, color: colors.text }]}
            placeholder="Describe your query or problem in detail..."
            placeholderTextColor={colors.textLight}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          <TouchableOpacity 
            style={[styles.submitBtn, { backgroundColor: colors.primary }, submitting && { opacity: 0.8 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.submitBtnText}>Submit Ticket</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Tickets List */}
        <View style={styles.ticketsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Support History</Text>
          
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />
          ) : tickets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="mail-open-outline" size={40} color={colors.textLight} />
              <Text style={[styles.emptyText, { color: colors.textLight }]}>No support tickets found.</Text>
            </View>
          ) : (
            tickets.map((t) => {
              const isExpanded = expandedTicketId === t._id;
              const isOpen = t.status === 'Open';
              return (
                <View key={t._id} style={[styles.ticketCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <TouchableOpacity 
                    style={styles.ticketHeader} 
                    onPress={() => toggleExpand(t._id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.ticketHeaderLeft}>
                      <Text style={[styles.ticketSubject, { color: colors.text }]} numberOfLines={1}>{t.subject}</Text>
                      <Text style={[styles.ticketDate, { color: colors.textLight }]}>
                        {new Date(t.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </Text>
                    </View>
                    <View style={styles.ticketHeaderRight}>
                      <View style={[styles.statusBadge, isOpen ? styles.statusOpen : styles.statusResolved]}>
                        <Text style={[styles.statusText, isOpen ? styles.statusOpenText : styles.statusResolvedText]}>
                          {t.status}
                        </Text>
                      </View>
                      <Ionicons 
                        name={isExpanded ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color={colors.textLight} 
                        style={{ marginLeft: 8 }}
                      />
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={[styles.ticketBody, { backgroundColor: colors.surfaceSecondary, borderTopColor: colors.border }]}>
                      <View style={[styles.originalMessageCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.messageLabel, { color: colors.textLight }]}>Original Message:</Text>
                        <Text style={[styles.messageText, { color: colors.textSecondary }]}>{t.message}</Text>
                      </View>

                      {t.replies && t.replies.length > 0 && (
                        <View style={styles.repliesContainer}>
                          <Text style={[styles.repliesTitle, { color: colors.text }]}>Conversation History:</Text>
                          {t.replies.map((reply, idx) => {
                            const isAdmin = reply.sender === 'Admin';
                            return (
                              <View 
                                key={idx} 
                                style={[
                                  styles.replyBubble, 
                                  isAdmin ? [styles.adminReplyBubble, { backgroundColor: colors.primaryLight }] : [styles.userReplyBubble, { backgroundColor: colors.border }]
                                ]}
                              >
                                <Text style={[styles.replySender, { color: isAdmin ? colors.primary : colors.textLight }]}>{reply.sender}</Text>
                                <Text style={[styles.replyText, { color: colors.text }]}>{reply.text}</Text>
                                <Text style={[styles.replyTime, { color: colors.textLight }]}>
                                  {new Date(reply.createdAt).toLocaleDateString('en-IN', {
                                    hour: '2-digit', minute: '2-digit'
                                  })}
                                </Text>
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 25,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 15,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
  },
  submitBtn: {
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  ticketsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 15,
  },
  ticketCard: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  ticketHeaderLeft: {
    flex: 1,
    paddingRight: 10,
  },
  ticketSubject: {
    fontSize: 14,
    fontWeight: '700',
  },
  ticketDate: {
    fontSize: 11,
    marginTop: 2,
  },
  ticketHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusOpen: {
    backgroundColor: '#FEF3C7',
  },
  statusResolved: {
    backgroundColor: '#D1FAE5',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statusOpenText: {
    color: '#D97706',
  },
  statusResolvedText: {
    color: '#059669',
  },
  ticketBody: {
    padding: 15,
    borderTopWidth: 1,
  },
  originalMessageCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  messageLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  repliesContainer: {
    marginTop: 10,
  },
  repliesTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 10,
  },
  replyBubble: {
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    maxWidth: '85%',
  },
  userReplyBubble: {
    alignSelf: 'flex-start',
  },
  adminReplyBubble: {
    alignSelf: 'flex-end',
  },
  replySender: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 2,
  },
  replyText: {
    fontSize: 13,
    lineHeight: 18,
  },
  replyTime: {
    fontSize: 8,
    alignSelf: 'flex-end',
    marginTop: 3,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
  }
});

module.exports = EmailSupportScreen;
