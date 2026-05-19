import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart, updateQuantityApi, removeFromCartApi } from '../store/slices/cartSlice';
import { useEffect } from 'react';
import { theme } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const CartScreen = ({ navigation }) => {
  const { items, totalAmount } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const [promoCode, setPromoCode] = useState('');

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleUpdateQuantity = (id, quantity) => {
    if (quantity < 1) {
      dispatch(removeFromCartApi(id));
    } else {
      dispatch(updateQuantityApi({ productId: id, quantity }));
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <View style={styles.itemHeader}>
          <View>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemSubtitle}>Fresh {item.name}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => dispatch(removeFromCartApi(item.id))}
            style={styles.deleteBtn}
          >
            <Ionicons name="trash-outline" size={20} color="#888" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.itemFooter}>
          <Text style={styles.itemPrice}>₹{item.price}</Text>
          <View style={styles.qtyContainer}>
            <TouchableOpacity 
              style={styles.qtyBtn}
              onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
            >
              <Ionicons name="remove" size={16} color="#333" />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{item.quantity}</Text>
            <TouchableOpacity 
              style={styles.qtyBtn}
              onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
            >
              <Ionicons name="add" size={16} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyInner}>
      <Ionicons name="cart-outline" size={80} color="#DDD" />
      <Text style={styles.emptyText}>Your cart is empty</Text>
      <TouchableOpacity 
        style={styles.shopBtn}
        onPress={() => navigation.navigate('HomeTab')}
      >
        <Text style={styles.shopBtnText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Cart</Text>
        <View style={{ width: 40 }} />
      </View>

      {items.length === 0 ? (
        <ScrollView contentContainerStyle={styles.emptyContent}>
          {renderEmptyCart()}
        </ScrollView>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.listContainer}>
              {items.map(item => (
                <View key={item.id}>
                  {renderItem({ item })}
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.fixedFooter}>
            <View style={styles.promoSection}>
              <View style={styles.promoInputContainer}>
                <TextInput 
                  style={styles.promoInput}
                  placeholder="Enter Promo Code"
                  value={promoCode}
                  onChangeText={setPromoCode}
                />
                <TouchableOpacity style={styles.applyBtn}>
                  <Text style={styles.applyBtnText}>Apply Code</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.summarySection}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>₹{totalAmount.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping Fee</Text>
                <Text style={styles.summaryValue}>₹30.00</Text>
              </View>
              <View style={styles.divider} />
              <View style={[styles.summaryRow, { marginTop: 10 }]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>₹{(totalAmount + 30).toFixed(2)}</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.checkoutBtn}
              onPress={() => navigation.navigate('Address', { mode: 'checkout' })}
            >
              <Text style={styles.checkoutBtnText}>Proceed To Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
  },
  listContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    borderRadius: 15,
    backgroundColor: '#F9F9F9',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'space-between',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  deleteBtn: {
    padding: 5,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 5,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  qtyBtn: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '700',
    marginHorizontal: 10,
    color: '#1A1A1A',
  },
  fixedFooter: {
    backgroundColor: '#FFFFFF',
    paddingTop: 15,
    paddingBottom: 25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  promoSection: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  promoInputContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 5,
  },
  promoInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  applyBtn: {
    backgroundColor: '#0B151F',
    height: 40,
    paddingHorizontal: 20,
    borderRadius: 20,
    justifyContent: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  summarySection: {
    paddingHorizontal: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 5,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  checkoutBtn: {
    backgroundColor: theme.colors.primary,
    marginHorizontal: 20,
    marginTop: 20,
    height: 55,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyInner: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    marginTop: 20,
    marginBottom: 30,
  },
  shopBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  shopBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  }
});
export default CartScreen;
