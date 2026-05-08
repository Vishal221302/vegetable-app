import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../store/slices/cartSlice';
import api from '../utils/api';
import { ActivityIndicator } from 'react-native';

const PaymentScreen = ({ navigation, route }) => {
  const { shippingAddress } = route.params || {};
  const [selectedMethod, setSelectedMethod] = useState('cod');
  const { items, totalAmount } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const paymentMethods = [
    { id: 'cod', name: 'Cash on Delivery', icon: 'cash-outline' },
    { id: 'upi', name: 'UPI', icon: 'phone-portrait-outline' },
    { id: 'card', name: 'Credit / Debit Card', icon: 'card-outline' },
  ];

  const handlePlaceOrder = async () => {
    if (!shippingAddress) {
      alert('Please select a shipping address first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderData = {
        orderItems: items.map(item => ({
          name: item.name,
          qty: item.quantity,
          image: item.image,
          price: item.price,
          product: item.id
        })),
        shippingAddress: shippingAddress,
        paymentMethod: selectedMethod === 'cod' ? 'COD' : selectedMethod.toUpperCase(),
        totalPrice: totalAmount + 40,
        shippingPrice: 40,
      };

      const response = await api.post('/orders', orderData);

      if (response.status === 201) {
        dispatch(clearCart());
        navigation.navigate('OrderSuccess');
      }
    } catch (err) {
      console.error('Order Error:', err);
      setError(err.response?.data?.message || 'Something went wrong');
      alert(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentMethod = (item) => (
    <TouchableOpacity 
      key={item.id}
      style={[
        styles.methodCard,
        selectedMethod === item.id && styles.selectedCard
      ]}
      onPress={() => setSelectedMethod(item.id)}
    >
      <View style={styles.methodInfo}>
        <Ionicons 
          name={item.icon} 
          size={24} 
          color={selectedMethod === item.id ? theme.colors.primary : theme.colors.textLight} 
        />
        <Text style={[
          styles.methodName,
          selectedMethod === item.id && { color: theme.colors.primary }
        ]}>{item.name}</Text>
      </View>
      <Ionicons 
        name={selectedMethod === item.id ? "radio-button-on" : "radio-button-off"} 
        size={24} 
        color={selectedMethod === item.id ? theme.colors.primary : theme.colors.border} 
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Items Total</Text>
            <Text style={styles.value}>₹{totalAmount}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Delivery</Text>
            <Text style={styles.value}>₹40</Text>
          </View>
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalValue}>₹{totalAmount + 40}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Payment Method</Text>
        {paymentMethods.map(renderPaymentMethod)}

      </ScrollView>

      <View style={styles.footer}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : (
          <Button 
            title="Place Order" 
            onPress={handlePlaceOrder} 
          />
        )}
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
    padding: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.m,
  },
  summaryContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.xxl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.s,
  },
  label: {
    ...theme.typography.body,
    color: theme.colors.textLight,
  },
  value: {
    ...theme.typography.body,
  },
  totalRow: {
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    paddingTop: theme.spacing.m,
    marginTop: theme.spacing.s,
    marginBottom: 0,
  },
  totalLabel: {
    ...theme.typography.h3,
  },
  totalValue: {
    ...theme.typography.h2,
    color: theme.colors.primary,
  },
  methodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.m,
  },
  selectedCard: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodName: {
    ...theme.typography.body,
    marginLeft: theme.spacing.m,
  },
  footer: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
  }
});

export default PaymentScreen;
