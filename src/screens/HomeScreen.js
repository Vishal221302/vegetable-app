import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Image, FlatList, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../utils/theme';
import { categories as dummyCategories, products as dummyProducts, banners as dummyBanners } from '../utils/dummyData';
import api from '../utils/api';
import CategoryItem from '../components/CategoryItem';
import ProductCard from '../components/ProductCard';
import { useDispatch } from 'react-redux';
import { fetchCart, addToCartApi } from '../store/slices/cartSlice';
import { fetchWishlist, toggleWishlistApi } from '../store/slices/wishlistSlice';
import Toast from 'react-native-toast-message';

import SkeletonLoader, { ProductSkeleton } from '../components/SkeletonLoader';
import { useSelector } from 'react-redux';
import CartIcon from '../components/CartIcon';

const HomeScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [displayCount, setDisplayCount] = useState(8);
  const [isLoadMore, setIsLoadMore] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { items: wishlistItems } = useSelector(state => state.wishlist);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes, banRes] = await Promise.all([
          api.get('/categories').catch(() => ({ data: dummyCategories })),
          api.get('/products').catch(() => ({ data: dummyProducts })),
          api.get('/banners').catch(() => ({ data: dummyBanners }))
        ]);
        
        setCategories(catRes.data.length > 0 ? catRes.data : dummyCategories);
        setProducts(prodRes.data.length > 0 ? prodRes.data : dummyProducts);
        setBanners(banRes.data.length > 0 ? banRes.data : dummyBanners);
      } catch (error) {
        console.error('Error fetching home data:', error);
        // Fallback to dummy data on critical error
        setCategories(dummyCategories);
        setProducts(dummyProducts);
        setBanners(dummyBanners);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    dispatch(fetchCart());
    dispatch(fetchWishlist());
  }, [dispatch]);

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

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 50;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  };

  const loadMoreProducts = () => {
    if (isLoadMore || displayCount >= products.length) return;
    setIsLoadMore(true);
    setTimeout(() => {
      setDisplayCount(prev => prev + 8);
      setIsLoadMore(false);
    }, 1500); // Simulate network/processing delay
  };

  const renderHeader = () => (
    <View style={styles.headerWrapper}>
      <View style={styles.headerTop}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: user?.profileImage || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
            style={styles.profileImage}
          />
          <View>
            <Text style={styles.welcomeText}>Welcome</Text>
            <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
          </View>
        </View>
        <CartIcon color={theme.colors.headerDark} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={theme.colors.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search here..."
          placeholderTextColor={theme.colors.textLight}
          value={search}
          onChangeText={setSearch}
        />
      </View>
    </View>
  );

  const renderCategories = () => (
    <View style={styles.categoriesSection}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
        {loading ? (
          [1, 2, 3, 4, 5].map(i => (
            <View key={i} style={styles.categoryItemWrapper}>
              <SkeletonLoader width={60} height={60} borderRadius={30} />
              <SkeletonLoader width={40} height={10} borderRadius={2} style={{ marginTop: 5 }} />
            </View>
          ))
        ) : (
          <>
            <TouchableOpacity style={styles.categoryItemWrapper} onPress={() => navigation.navigate('ProductList', { category: 'All' })}>
              <View style={[styles.categoryIconContainer, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="menu-outline" size={32} color={theme.colors.surface} />
              </View>
              <Text style={[styles.categoryName, { color: theme.colors.primary }]}>All</Text>
            </TouchableOpacity>
            {categories.map(category => (
              <TouchableOpacity
                key={category._id || category.id}
                style={styles.categoryItemWrapper}
                onPress={() => navigation.navigate('ProductList', { category: category.name })}
              >
                <View style={styles.categoryIconContainer}>
                  <Image source={{ uri: category.image || category.icon || 'https://via.placeholder.com/60' }} style={styles.categoryIcon} />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );

  const renderBanners = () => (
    <View style={styles.bannerSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Special Offers</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bannerList}>
        {loading ? (
          <SkeletonLoader width={320} height={160} borderRadius={20} />
        ) : (
          banners.map(banner => {
            let bgColor = theme.colors.bannerLight;
            if (banner.color) {
              if (banner.color.includes('emerald')) bgColor = '#10B981';
              else if (banner.color.includes('gray')) bgColor = '#374151';
              else if (banner.color.includes('amber')) bgColor = '#F59E0B';
              else if (banner.color.startsWith('#')) bgColor = banner.color;
            }
            
            return (
              <View key={banner._id || banner.id} style={[styles.bannerCard, { backgroundColor: bgColor }]}>
                <View style={styles.bannerInfo}>
                  <Text style={styles.bannerDiscount}>
                    {banner.title || 'Special Offer'}
                  </Text>
                  <Text style={styles.bannerDesc} numberOfLines={2} ellipsizeMode="tail">
                    {banner.subtitle || '100% Guaranteed all Fresh Grocery Items'}
                  </Text>
                  <TouchableOpacity style={styles.shopNowBtn}>
                    <Text style={styles.shopNowText}>{banner.badge || 'Shop Now'}</Text>
                  </TouchableOpacity>
                </View>
                <Image
                  source={{ uri: banner.image || 'https://cdn-icons-png.flaticon.com/512/2329/2329865.png' }}
                  style={styles.bannerImage}
                />
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );

  const renderPopularProducts = () => {
    const popularProducts = products.filter(p => p.isPopular === true);

    if (!loading && popularProducts.length === 0) {
      return null;
    }

    return (
      <View style={styles.productSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Products</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ProductList')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.productGrid}>
          {loading ? (
            [1, 2, 3, 4].map(i => (
              <View key={i} style={styles.productGridItem}>
                <ProductSkeleton />
              </View>
            ))
          ) : (
            popularProducts.map(product => (
              <View key={product._id || product.id} style={styles.productGridItem}>
                <ProductCard
                  item={{...product, id: product._id || product.id, countInStock: product.countInStock}}
                  onPress={() => navigation.navigate('ProductDetail', { product: {...product, id: product._id || product.id} })}
                  onAdd={handleAddToCart}
                  isFavorite={wishlistItems.some(fav => (fav._id || fav.id) === (product._id || product.id))}
                  onFavoritePress={handleToggleWishlist}
                />
              </View>
            ))
          )}
        </View>
      </View>
    );
  };

  const renderMidBanner = () => (
    <View style={styles.midBannerContainer}>
      <View style={styles.midBannerCard}>
        <View style={styles.midBannerOverlay} />
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80' }} 
          style={styles.midBannerImage} 
        />
        <View style={styles.midBannerContent}>
          <Text style={styles.midBannerTitle}>Farm Fresh Vegetables</Text>
          <Text style={styles.midBannerSub} numberOfLines={2} ellipsizeMode="tail">Get up to 20% off on organic veggies today!</Text>
          <TouchableOpacity style={styles.midBannerBtn}>
            <Text style={styles.midBannerBtnText}>Order Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderAllProducts = () => (
    <View style={[styles.productSection, { marginTop: 20 }]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>All Products</Text>
      </View>
      <View style={styles.productGrid}>
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <View key={i} style={styles.productGridItem}>
              <ProductSkeleton />
            </View>
          ))
        ) : (
          products.slice(0, displayCount).map(product => (
            <View key={product._id || product.id} style={styles.productGridItem}>
              <ProductCard
                item={{...product, id: product._id || product.id, countInStock: product.countInStock}}
                onPress={() => navigation.navigate('ProductDetail', { product: {...product, id: product._id || product.id} })}
                onAdd={handleAddToCart}
                isFavorite={wishlistItems.some(fav => (fav._id || fav.id) === (product._id || product.id))}
                onFavoritePress={handleToggleWishlist}
              />
            </View>
          ))
        )}
      </View>
      {isLoadMore && (
        <View style={styles.loaderContainer}>
          <SkeletonLoader width={40} height={40} borderRadius={20} />
          <Text style={styles.loadingText}>Loading more...</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        onScroll={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
            loadMoreProducts();
          }
        }}
        scrollEventThrottle={400}
      >
        {renderHeader()}
        {renderCategories()}
        {renderBanners()}
        {renderPopularProducts()}
        {renderMidBanner()}
        {renderAllProducts()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerWrapper: {
    backgroundColor: theme.colors.headerDark,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 60, // Increased from 30
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginRight: 12,
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    height: 50,
    paddingHorizontal: 15,
    marginBottom: 10, // Added space below search bar
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  categoriesSection: {
    marginTop: -30, // Adjusted from -25 to leave more space below search bar
    paddingLeft: 20,
    marginBottom: 10, // Added more space below categories too
  },
  categoriesList: {
    paddingRight: 20,
    alignItems: 'center',
  },
  categoryItemWrapper: {
    alignItems: 'center',
    marginRight: 20,
  },
  categoryIconContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 10,
    overflow: 'hidden', // Add overflow hidden for circle image
  },
  categoryIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  bannerSection: {
    marginTop: 25,
  },
  bannerList: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  bannerCard: {
    width: 320,
    height: 160,
    backgroundColor: theme.colors.bannerLight,
    borderRadius: 20,
    flexDirection: 'row',
    padding: 20,
    marginRight: 15,
  },
  bannerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  bannerDiscount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF', // Changed to white for better contrast on colored backgrounds
    marginBottom: 5,
  },
  bannerDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white for readability
    marginBottom: 15,
    lineHeight: 18,
  },
  shopNowBtn: {
    backgroundColor: '#FFFFFF', // White button for better visibility on colored backgrounds
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shopNowText: {
    color: '#333333', // Dark text on white button
    fontSize: 12,
    fontWeight: '700',
  },
  bannerImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  sectionContainer: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  seeAll: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  productGridItem: {
    width: '48%', // Leaves a small gap between 2 columns
    marginBottom: 15,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    flexDirection: 'row',
    gap: 10,
  },
  loadingText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  midBannerContainer: {
    width: '100%',
    marginTop: 20,
    marginBottom: 10,
  },
  midBannerCard: {
    width: '100%',
    height: 150,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  midBannerImage: {
    position: 'absolute',
    width: '110%',
    height: '110%',
    resizeMode: 'cover',
  },
  midBannerOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 1,
  },
  midBannerContent: {
    zIndex: 2,
  },
  midBannerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 5,
  },
  midBannerSub: {
    color: '#E0E0E0',
    fontSize: 12,
    marginBottom: 12,
    maxWidth: '80%',
  },
  midBannerBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  midBannerBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  }
});

export default HomeScreen;
