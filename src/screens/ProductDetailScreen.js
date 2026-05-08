import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../utils/theme';
import { useDispatch } from 'react-redux';
import { addToCartApi } from '../store/slices/cartSlice';
import Toast from 'react-native-toast-message';
import CartIcon from '../components/CartIcon';

const ProductDetailScreen = ({ route, navigation }) => {
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch();

  const handleAddToCart = async () => {
    try {
      await dispatch(addToCartApi({ 
        productId: product.id || product._id, 
        quantity,
        price: product.price,
        name: product.name,
        image: product.image
      })).unwrap();

      Toast.show({
        type: 'success',
        text1: 'Added to Cart',
        text2: `${quantity} ${product.name} added to your cart`,
        visibilityTime: 2000,
        autoHide: true,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: typeof error === 'string' ? error : (error.message || 'Could not add to cart'),
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
        <CartIcon />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.image} />
        </View>
        
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{product.name}</Text>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          </View>
          <Text style={styles.pricePer}>1 {product.pricePer}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star-outline" size={18} color={theme.colors.text} />
              <Text style={styles.statText}>{product.rating} Rating</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={18} color={theme.colors.text} />
              <Text style={styles.statText}>Time {product.time}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="flame-outline" size={18} color={theme.colors.text} />
              <Text style={styles.statText}>{product.kcal}</Text>
            </View>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.qtyContainer}>
          <TouchableOpacity 
            style={styles.qtyBtn} 
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Ionicons name="remove" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{quantity}</Text>
          <TouchableOpacity 
            style={styles.qtyBtn}
            onPress={() => setQuantity(quantity + 1)}
          >
            <Ionicons name="add" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.addBtn} onPress={handleAddToCart}>
          <Text style={styles.addBtnText}>Add to cart</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.m,
    paddingBottom: theme.spacing.m,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...theme.typography.title,
  },
  imageContainer: {
    width: '100%',
    height: 320,
    backgroundColor: theme.colors.primaryLight,
    borderBottomLeftRadius: 150,
    borderBottomRightRadius: 150,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  content: {
    padding: theme.spacing.xl,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    ...theme.typography.h1,
  },
  price: {
    ...theme.typography.h2,
  },
  pricePer: {
    ...theme.typography.caption,
    fontSize: 14,
    marginBottom: theme.spacing.l,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xxl,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    ...theme.typography.body,
    marginLeft: 6,
    color: theme.colors.textLight,
  },
  descriptionContainer: {
    marginBottom: theme.spacing.xl,
  },
  descriptionTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.s,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.textLight,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.xl,
    paddingBottom: 40,
    backgroundColor: theme.colors.surface,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.round,
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.s,
    marginRight: theme.spacing.m,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    ...theme.typography.title,
    marginHorizontal: theme.spacing.m,
  },
  addBtn: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    ...theme.typography.title,
    color: theme.colors.surface,
  }
});

export default ProductDetailScreen;
