import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { theme } from '../utils/theme';
import { useNavigation } from '@react-navigation/native';

const CartIcon = ({ color = theme.colors.text }) => {
  const navigation = useNavigation();
  const { items } = useSelector(state => state.cart);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => navigation.navigate('Cart')}
    >
      <Ionicons name="cart-outline" size={26} color={color} />
      {itemCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{itemCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 5,
    marginRight: 5,
  },
  badge: {
    position: 'absolute',
    right: -2,
    top: -2,
    backgroundColor: theme.colors.primary,
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  }
});

export default CartIcon;
