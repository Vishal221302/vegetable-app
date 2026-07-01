import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { theme } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import { useTheme } from '../context/ThemeContext';

const HelpSupportScreen = ({ navigation }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  const { colors } = useTheme();
  const faqItems = [
    { q: 'How can I track my order?', a: 'You can track your order in the "My Orders" section of your profile.' },
    { q: 'What are the delivery charges?', a: 'Delivery charges vary based on your location and order value.' },
    { q: 'Can I cancel my order?', a: 'Yes, you can cancel your order within 15 minutes of placing it.' },
    { q: 'How do I return a product?', a: 'If you receive a damaged or incorrect item, contact us via the support button below.' },
  ];

  const handleSupportAction = (screenName) => {
    if (!isAuthenticated) {
      Toast.show({
        type: 'error',
        text1: '🔒 Login Required',
        text2: 'Please login first to contact support',
        visibilityTime: 2500,
      });
      navigation.navigate('Login');
      return;
    }
    navigation.navigate(screenName);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Help &amp; Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.searchSection, { backgroundColor: colors.headerBg }]}>
          <Text style={[styles.searchTitle, { color: colors.text }]}>How can we help you?</Text>
          <View style={[styles.searchBar, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
            <Ionicons name="search-outline" size={20} color={colors.textLight} style={styles.searchIcon} />
            <TextInput style={[styles.searchInput, { color: colors.text }]} placeholder="Search topics, questions..." placeholderTextColor={colors.textLight} />
          </View>
        </View>

        <View style={styles.supportCards}>
          <TouchableOpacity style={[styles.supportCard, { backgroundColor: colors.card }]} onPress={() => handleSupportAction('Chat')}>
            <View style={[styles.cardIcon, { backgroundColor: '#E1F5FE' }]}>
              <Ionicons name="chatbubbles-outline" size={24} color="#03A9F4" />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Live Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.supportCard, { backgroundColor: colors.card }]} onPress={() => handleSupportAction('Chat')}>
            <View style={[styles.cardIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="call-outline" size={24} color="#4CAF50" />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Call Us</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.supportCard, { backgroundColor: colors.card }]} onPress={() => handleSupportAction('EmailSupport')}>
            <View style={[styles.cardIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="mail-outline" size={24} color="#FF9800" />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Email Us</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.faqSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
          {faqItems.map((item, index) => (
            <View key={index} style={[styles.faqItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.faqQuestion, { color: colors.text }]}>{item.q}</Text>
              <Text style={[styles.faqAnswer, { color: colors.textLight }]}>{item.a}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.contactBtn}>
          <Text style={styles.contactBtnText}>Contact Support Team</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  content: {
    flex: 1,
  },
  searchSection: {
    backgroundColor: theme.colors.primary,
    padding: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  searchTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    height: 50,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  supportCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: -25,
  },
  supportCard: {
    backgroundColor: '#FFFFFF',
    width: '30%',
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
  },
  faqSection: {
    padding: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  faqItem: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 15,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  contactBtn: {
    backgroundColor: '#0B151F',
    margin: 20,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  contactBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  }
});

export default HelpSupportScreen;
