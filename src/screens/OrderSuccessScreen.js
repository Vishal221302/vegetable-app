import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import { useTheme } from '../context/ThemeContext';

const OrderSuccessScreen = ({ navigation }) => {
  const { colors } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Main');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
          <Ionicons name="checkmark" size={60} color="#FFFFFF" />
        </View>
        <Text style={[styles.title, { color: colors.primary }]}>Order Placed Successfully!</Text>
        <Text style={[styles.message, { color: colors.textLight }]}>
          Your order has been placed and will be delivered soon.
        </Text>
        <Text style={[styles.orderId, { color: colors.text }]}>Order ID: #ORD{Math.floor(Math.random() * 1000000)}</Text>
      </View>
      
      <View style={[styles.footer, { backgroundColor: colors.card }]}>
        <Button 
          title="Continue Shopping" 
          onPress={() => navigation.navigate('Main')} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },
  message: {
    ...theme.typography.body,
    textAlign: 'center',
    marginBottom: theme.spacing.l,
    lineHeight: 24,
  },
  orderId: {
    ...theme.typography.h3,
  },
  footer: {
    padding: theme.spacing.xl,
  }
});

export default OrderSuccessScreen;
