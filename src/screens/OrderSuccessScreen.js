import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';

const OrderSuccessScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Main');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigation]);
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark" size={60} color={theme.colors.surface} />
        </View>
        <Text style={styles.title}>Order Placed Successfully!</Text>
        <Text style={styles.message}>
          Your order has been placed and will be delivered soon.
        </Text>
        <Text style={styles.orderId}>Order ID: #ORD{Math.floor(Math.random() * 1000000)}</Text>
      </View>
      
      <View style={styles.footer}>
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
    backgroundColor: theme.colors.background,
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
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },
  message: {
    ...theme.typography.body,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginBottom: theme.spacing.l,
    lineHeight: 24,
  },
  orderId: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  footer: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
  }
});

export default OrderSuccessScreen;
