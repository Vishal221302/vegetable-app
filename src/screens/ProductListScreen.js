import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { theme } from '../utils/theme';
import { products as dummyProducts } from '../utils/dummyData';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { ProductSkeleton } from '../components/SkeletonLoader';
import { useDispatch } from 'react-redux';
import { fetchCart, addToCartApi } from '../store/slices/cartSlice';
import { fetchWishlist, toggleWishlistApi } from '../store/slices/wishlistSlice';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import CartIcon from '../components/CartIcon';

const ProductListScreen = ({ navigation, route }) => {
  const { category } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const dispatch = useDispatch();
  const { items: wishlistItems } = useSelector(state => state.wishlist);

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
      await dispatch(addToCartApi({ 
        productId: product._id || product.id, 
        quantity: 1,
        price: product.price,
        name: product.name,
        image: product.image
      })).unwrap();
      
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

  return (
    <View style={styles.container}>
      <FlatList 
        data={loading ? [1, 2, 3, 4, 5, 6] : products}
        keyExtractor={(item, index) => loading ? index.toString() : (item._id || item.id).toString()}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => (
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
        )}
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
