import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { theme, getDiscountedPrice } from '../utils/theme';
import { products as dummyProducts } from '../utils/dummyData';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { ProductSkeleton } from '../components/SkeletonLoader';
import { useDispatch } from 'react-redux';
import { fetchCart, addToCartApi, addToCartLocal } from '../store/slices/cartSlice';
import { fetchWishlist, toggleWishlistApi } from '../store/slices/wishlistSlice';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import CartIcon from '../components/CartIcon';
import { useTheme } from '../context/ThemeContext';

const ProductListScreen = ({ navigation, route }) => {
  const { category } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const dispatch = useDispatch();
  const { items: wishlistItems } = useSelector(state => state.wishlist);
  const { isAuthenticated } = useSelector(state => state.auth);
  const { colors } = useTheme();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/products');
        
        let filtered = data;
        if (category && category !== 'All') {
          filtered = data.filter(p => p.category === category);
        }
        
        setProducts(filtered.length > 0 ? filtered : dummyProducts);
      } catch (error) {
        console.error('Failed to fetch products', error);
        setProducts(dummyProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // Add Cart Icon to header
    navigation.setOptions({
      headerRight: () => <CartIcon />,
    });
  }, [category, navigation]);

  const handleAddToCart = async (product) => {
    try {
      const productPayload = {
        productId: product._id || product.id,
        quantity: 1,
        price: getDiscountedPrice(product.price, product.tag),
        name: product.name,
        image: product.image
      };
      
      if (isAuthenticated) {
        await dispatch(addToCartApi(productPayload)).unwrap();
      } else {
        dispatch(addToCartLocal(productPayload));
      }
      
      Toast.show({
        type: 'success',
        text1: 'Added to Cart',
        text2: `${product.name} has been added to your cart`,
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

  const handleToggleWishlist = (product) => {
    if (!isAuthenticated) {
      Toast.show({
        type: 'error',
        text1: '🔒 Login Required',
        text2: 'Please login first to save favourites',
        visibilityTime: 2500,
      });
      navigation.navigate('Login');
      return;
    }
    dispatch(toggleWishlistApi(product));
    const isFav = wishlistItems.some(item => (item._id || item.id) === (product._id || product.id));
    Toast.show({
      type: 'success',
      text1: isFav ? 'Removed from Wishlist' : 'Added to Wishlist',
      text2: `${product.name} has been ${isFav ? 'removed from' : 'added to'} your wishlist`,
      visibilityTime: 2000,
      autoHide: true,
    });
  };

  const renderItem = useCallback(({ item }) => (
    loading ? (
      <ProductSkeleton />
    ) : (
      <ProductCard 
        item={{...item, id: item._id || item.id, countInStock: item.countInStock}} 
        onAdd={handleAddToCart}
        onPress={() => navigation.navigate('ProductDetail', { product: {...item, id: item._id || item.id} })}
        isFavorite={wishlistItems.some(fav => (fav._id || fav.id) === (item._id || item.id))}
        onFavoritePress={handleToggleWishlist}
      />
    )
  ), [loading, wishlistItems, handleAddToCart, handleToggleWishlist, navigation]);

  const keyExtractor = useCallback((item, index) => loading ? index.toString() : (item._id || item.id).toString(), [loading]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList 
        data={loading ? [1, 2, 3, 4, 5, 6] : products}
        keyExtractor={keyExtractor}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={renderItem}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContainer: {
    padding: theme.spacing.m,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  }
});

export default ProductListScreen;
