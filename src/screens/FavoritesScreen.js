import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { theme } from '../utils/theme';
import ProductCard from '../components/ProductCard';
import { fetchCart, addToCartApi } from '../store/slices/cartSlice';
import { fetchWishlist, toggleWishlistApi } from '../store/slices/wishlistSlice';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../context/ThemeContext';

const FavoritesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { items: favoriteItems } = useSelector(state => state.wishlist);
  const { colors } = useTheme();

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleAddToCart = (product) => {
    dispatch(addToCartApi({ 
      productId: product._id || product.id, 
      quantity: 1,
      price: product.price,
      name: product.name,
      image: product.image
    }));
    Toast.show({
      type: 'success',
      text1: 'Added to Cart',
      text2: `${product.name} has been added to your cart`,
      visibilityTime: 2000,
      autoHide: true,
    });
  };

  const handleToggleWishlist = (product) => {
    dispatch(toggleWishlistApi(product));
    Toast.show({
      type: 'success',
      text1: 'Removed from Wishlist',
      text2: `${product.name} has been removed from your wishlist`,
      visibilityTime: 2000,
      autoHide: true,
    });
  };

  if (favoriteItems.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="heart-outline" size={80} color={colors.border} />
        <Text style={[styles.emptyText, { color: colors.textLight }]}>No Favorites Yet</Text>
        <Text style={[styles.emptySubtext, { color: colors.textLight }]}>Add items you love to your wishlist</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.primary }]}>My Wishlist</Text>
        <Text style={[styles.count, { color: colors.textLight }]}>{favoriteItems.length} items</Text>
      </View>
      <FlatList
        data={favoriteItems}
        keyExtractor={item => (item._id || item.id).toString()}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => (
          <View style={{ width: '48%', marginBottom: theme.spacing.m }}>
            <ProductCard
              item={{ ...item, id: item._id || item.id, countInStock: item.countInStock }}
              onAdd={handleAddToCart}
              onPress={() => navigation.navigate('ProductDetail', { product: { ...item, id: item._id || item.id } })}
              isFavorite={true}
              onFavoritePress={handleToggleWishlist}
            />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxl + 10,
    paddingBottom: theme.spacing.m,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  title: {
    ...theme.typography.h1,
  },
  count: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    ...theme.typography.h2,
    marginTop: theme.spacing.l,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  listContainer: {
    padding: theme.spacing.m,
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  }
});

export default FavoritesScreen;
