import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme, getDiscountedPrice } from '../utils/theme';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartApi, addToCartLocal } from '../store/slices/cartSlice';
import { toggleWishlistApi } from '../store/slices/wishlistSlice';
import Toast from 'react-native-toast-message';
import CartIcon from '../components/CartIcon';
import ProductCard from '../components/ProductCard';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';

const ProductDetailScreen = ({ route, navigation }) => {
  const { product } = route.params;
  const [productData, setProductData] = useState(product);
  const [reviews, setReviews] = useState(product.reviews || []);
  const [rating, setRating] = useState(product.rating || 0);
  const [numReviews, setNumReviews] = useState(product.numReviews || 0);
  const [countInStock, setCountInStock] = useState(product.countInStock || 0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  // Review inputs
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const wishlistItems = useSelector(state => state.wishlist?.items) || [];
  const { colors, isDark } = useTheme();

  const fetchProductDetails = async () => {
    try {
      const { data } = await api.get(`/products/${product._id || product.id}`);
      setProductData(data);
      setReviews(data.reviews || []);
      setRating(data.rating || 0);
      setNumReviews(data.numReviews || 0);
      setCountInStock(data.countInStock !== undefined ? data.countInStock : 0);
      
      if (data.countInStock <= 0) {
        setQuantity(0);
      } else if (quantity > data.countInStock) {
        setQuantity(data.countInStock);
      }

      // Fetch related products (same category, different ID)
      const { data: allProducts } = await api.get('/products');
      const filtered = allProducts.filter(
        (p) => p.category === data.category && (p._id || p.id) !== (data._id || data.id)
      );
      setRelatedProducts(filtered);
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [product]);

  const handleAddToCart = async () => {
    if (countInStock <= 0) return;
    try {
      const productPayload = {
        productId: productData._id || productData.id, 
        quantity,
        price: getDiscountedPrice(productData.price, productData.tag),
        name: productData.name,
        image: productData.image
      };

      if (isAuthenticated) {
        await dispatch(addToCartApi(productPayload)).unwrap();
      } else {
        dispatch(addToCartLocal(productPayload));
      }

      Toast.show({
        type: 'success',
        text1: 'Added to Cart',
        text2: `${quantity} ${productData.name} added to your cart`,
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

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      Toast.show({
        type: 'error',
        text1: '🔒 Login Required',
        text2: 'Please login first to submit a review',
        visibilityTime: 2500,
      });
      navigation.navigate('Login');
      return;
    }
    if (!reviewComment.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Review Comment Required',
        text2: 'Please enter a comment for your review.',
      });
      return;
    }

    setSubmittingReview(true);
    try {
      await api.post(`/products/${productData._id || productData.id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      Toast.show({
        type: 'success',
        text1: 'Review Submitted',
        text2: 'Thank you for your feedback!',
      });

      setReviewComment('');
      setReviewRating(5);
      fetchProductDetails();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Submission Failed',
        text2: error.response?.data?.message || 'Could not submit review',
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleLikeReview = async (reviewId) => {
    if (!isAuthenticated) {
      Toast.show({
        type: 'error',
        text1: '🔒 Login Required',
        text2: 'Please login first to like a review',
        visibilityTime: 2500,
      });
      navigation.navigate('Login');
      return;
    }
    try {
      const { data } = await api.put(`/products/${productData._id || productData.id}/reviews/${reviewId}/like`);
      setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, likes: data.review.likes, dislikes: data.review.dislikes } : r));
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not like review' });
    }
  };

  const handleDislikeReview = async (reviewId) => {
    if (!isAuthenticated) {
      Toast.show({
        type: 'error',
        text1: '🔒 Login Required',
        text2: 'Please login first to dislike a review',
        visibilityTime: 2500,
      });
      navigation.navigate('Login');
      return;
    }
    try {
      const { data } = await api.put(`/products/${productData._id || productData.id}/reviews/${reviewId}/dislike`);
      setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, likes: data.review.likes, dislikes: data.review.dislikes } : r));
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not dislike review' });
    }
  };

  const renderStars = (num, size = 16) => {
    const stars = [];
    const rounded = Math.round(num * 2) / 2; // Support half stars
    for (let i = 1; i <= 5; i++) {
      let iconName = "star-outline";
      if (i <= rounded) {
        iconName = "star";
      } else if (i - 0.5 === rounded) {
        iconName = "star-half";
      }
      stars.push(
        <Ionicons 
          key={i} 
          name={iconName} 
          size={size} 
          color="#FBBF24" 
          style={{ marginRight: 2 }}
        />
      );
    }
    return <View style={styles.starsRow}>{stars}</View>;
  };

  const isOutOfStock = countInStock <= 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity style={[styles.headerBtn, { borderColor: colors.border }]} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Details</Text>
        <CartIcon />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.imageContainer, { backgroundColor: colors.primaryLight }]}>
          {productData.tag && (
            <View style={styles.ribbonContainer}>
              <View style={styles.ribbonBody}>
                <Text style={styles.ribbonText}>{productData.tag}</Text>
                <View style={[styles.ribbonCutout, { borderLeftColor: colors.primaryLight }]} />
              </View>
              <View style={styles.ribbonFold} />
            </View>
          )}
          <Image source={{ uri: productData.image }} style={styles.image} />
        </View>
        
        <View style={[styles.content, { backgroundColor: colors.surface }]}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]}>{productData.name}</Text>
            {productData.tag && getDiscountedPrice(productData.price, productData.tag) !== productData.price ? (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.price, { color: colors.text }]}>₹{getDiscountedPrice(productData.price, productData.tag).toFixed(2)}</Text>
                <Text style={styles.originalPriceDetail}>₹{productData.price.toFixed(2)}</Text>
              </View>
            ) : (
              <Text style={[styles.price, { color: colors.text }]}>₹{productData.price.toFixed(2)}</Text>
            )}
          </View>
          
          <View style={styles.metaRow}>
            <Text style={[styles.pricePer, { color: colors.textLight }]}>1 {productData.pricePer}</Text>
            
            {/* Stock Badge */}
            <View style={[
              styles.stockBadge, 
              isOutOfStock ? styles.outOfStockBadge : styles.inStockBadge
            ]}>
              <View style={[
                styles.stockDot, 
                isOutOfStock ? styles.outOfStockDot : styles.inStockDot
              ]} />
              <Text style={[
                styles.stockText, 
                isOutOfStock ? styles.outOfStockText : styles.inStockText
              ]}>
                {isOutOfStock ? 'Out of Stock' : (countInStock <= 5 ? `Only ${countInStock} Left` : 'In Stock')}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={18} color="#FBBF24" />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>{rating.toFixed(1)} ({numReviews} Reviews)</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={18} color={theme.colors.text} />
              <Text style={styles.statText}>{productData.time}</Text>
            </View>
            {productData.kcal && (
              <View style={styles.statItem}>
                <Ionicons name="flame-outline" size={18} color={theme.colors.text} />
                <Text style={styles.statText}>{productData.kcal}</Text>
              </View>
            )}
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{productData.description}</Text>
          </View>

          <View style={styles.divider} />

          {/* Reviews List Section */}
          <View style={styles.reviewsSection}>
            <Text style={styles.sectionTitle}>Reviews & Comments</Text>
            
            {reviews.length === 0 ? (
              <View style={styles.emptyReviews}>
                <Ionicons name="chatbubble-ellipses-outline" size={40} color="#CCC" />
                <Text style={styles.emptyReviewsText}>No reviews yet. Be the first to review this product!</Text>
              </View>
            ) : (
              reviews.map((rev) => (
                <View key={rev._id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerAvatar}>
                      <Text style={styles.avatarText}>{rev.name.slice(0,1).toUpperCase()}</Text>
                    </View>
                    <View style={styles.reviewerInfo}>
                      <Text style={styles.reviewerName}>{rev.name}</Text>
                      <Text style={styles.reviewDate}>
                        {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </Text>
                    </View>
                    {renderStars(rev.rating, 14)}
                  </View>
                  <Text style={styles.reviewComment}>{rev.comment}</Text>

                  {/* Like / Dislike row — visible to all, action requires login */}
                  <View style={styles.reactionRow}>
                    <TouchableOpacity
                      style={[
                        styles.reactionBtn,
                        user && rev.likes?.some(id => id === (user._id || user.id)) && styles.reactionBtnActive
                      ]}
                      onPress={() => handleLikeReview(rev._id)}
                    >
                      <Ionicons
                        name={user && rev.likes?.some(id => id === (user._id || user.id)) ? 'thumbs-up' : 'thumbs-up-outline'}
                        size={16}
                        color={user && rev.likes?.some(id => id === (user._id || user.id)) ? theme.colors.primary : '#999'}
                      />
                      <Text style={[
                        styles.reactionCount,
                        user && rev.likes?.some(id => id === (user._id || user.id)) && { color: theme.colors.primary }
                      ]}>
                        {rev.likes?.length || 0}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.reactionBtn,
                        user && rev.dislikes?.some(id => id === (user._id || user.id)) && styles.reactionBtnDislikeActive
                      ]}
                      onPress={() => handleDislikeReview(rev._id)}
                    >
                      <Ionicons
                        name={user && rev.dislikes?.some(id => id === (user._id || user.id)) ? 'thumbs-down' : 'thumbs-down-outline'}
                        size={16}
                        color={user && rev.dislikes?.some(id => id === (user._id || user.id)) ? '#EF4444' : '#999'}
                      />
                      <Text style={[
                        styles.reactionCount,
                        user && rev.dislikes?.some(id => id === (user._id || user.id)) && { color: '#EF4444' }
                      ]}>
                        {rev.dislikes?.length || 0}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={styles.divider} />

          {/* Write a Review Section */}
          <View style={styles.writeReviewSection}>
            <Text style={styles.sectionTitle}>Write a Review</Text>
            
            <Text style={styles.ratingLabel}>Rate this product:</Text>
            <View style={styles.ratingSelector}>
              {[1, 2, 3, 4, 5].map((val) => (
                <TouchableOpacity 
                  key={val} 
                  onPress={() => setReviewRating(val)}
                  style={styles.starBtn}
                >
                  <Ionicons 
                    name={val <= reviewRating ? "star" : "star-outline"} 
                    size={32} 
                    color="#FBBF24" 
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.reviewInput}
              placeholder="Share your thoughts about this product..."
              placeholderTextColor="#AAA"
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity 
              style={[styles.submitReviewBtn, submittingReview && { opacity: 0.7 }]} 
              onPress={handleSubmitReview}
              disabled={submittingReview}
            >
              {submittingReview ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.submitReviewText}>Submit Review</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.relatedSection}>
                <Text style={styles.sectionTitle}>Related Products</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  contentContainerStyle={styles.relatedProductsList}
                >
                  {relatedProducts.map((item) => (
                    <ProductCard
                      key={item._id || item.id}
                      item={{ ...item, id: item._id || item.id, countInStock: item.countInStock }}
                      onAdd={async (prod) => {
                        try {
                          const productPayload = {
                            productId: prod.id || prod._id,
                            quantity: 1,
                            price: prod.price,
                            name: prod.name,
                            image: prod.image
                          };

                          if (isAuthenticated) {
                            await dispatch(addToCartApi(productPayload)).unwrap();
                          } else {
                            dispatch(addToCartLocal(productPayload));
                          }

                          Toast.show({
                            type: 'success',
                            text1: 'Added to Cart',
                            text2: `${prod.name} added to your cart`
                          });
                        } catch (err) {
                          Toast.show({
                            type: 'error',
                            text1: 'Error',
                            text2: typeof err === 'string' ? err : (err.message || 'Could not add to cart')
                          });
                        }
                      }}
                      onPress={() => navigation.push('ProductDetail', { product: { ...item, id: item._id || item.id } })}
                      isFavorite={wishlistItems.some(fav => (fav._id || fav.id) === (item._id || item.id))}
                      onFavoritePress={(prod) => {
                        dispatch(toggleWishlistApi(prod));
                        const isFav = wishlistItems.some(fav => (fav._id || fav.id) === (prod._id || prod.id));
                        Toast.show({
                          type: 'success',
                          text1: isFav ? 'Removed from Wishlist' : 'Added to Wishlist',
                          text2: `${prod.name} has been ${isFav ? 'removed from' : 'added to'} your wishlist`
                        });
                      }}
                    />
                  ))}
                </ScrollView>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Footer Order Section */}
      <View style={styles.footer}>
        <View style={styles.qtyContainer}>
          <TouchableOpacity 
            style={[styles.qtyBtn, isOutOfStock && styles.disabledQtyBtn]} 
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={isOutOfStock}
          >
            <Ionicons name="remove" size={20} color={isOutOfStock ? "#CCC" : theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{quantity}</Text>
          <TouchableOpacity 
            style={[styles.qtyBtn, isOutOfStock && styles.disabledQtyBtn]}
            onPress={() => setQuantity(Math.min(countInStock, quantity + 1))}
            disabled={isOutOfStock}
          >
            <Ionicons name="add" size={20} color={isOutOfStock ? "#CCC" : theme.colors.primary} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.addBtn, isOutOfStock && styles.disabledAddBtn]} 
          onPress={handleAddToCart}
          disabled={isOutOfStock}
        >
          <Text style={styles.addBtnText}>
            {isOutOfStock ? 'Out of stock' : 'Add to cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    height: 220,
    backgroundColor: theme.colors.primaryLight,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '70%',
    height: '70%',
    resizeMode: 'contain',
  },
  content: {
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.m,
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
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.l,
  },
  pricePer: {
    ...theme.typography.caption,
    fontSize: 14,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  inStockBadge: {
    backgroundColor: '#ECFDF5',
  },
  outOfStockBadge: {
    backgroundColor: '#FEF2F2',
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  inStockDot: {
    backgroundColor: '#10B981',
  },
  outOfStockDot: {
    backgroundColor: '#EF4444',
  },
  stockText: {
    fontSize: 12,
    fontWeight: '700',
  },
  inStockText: {
    color: '#047857',
  },
  outOfStockText: {
    color: '#B91C1C',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.m,
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
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  descriptionContainer: {
    marginBottom: theme.spacing.m,
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.xs,
    color: '#1A1A1A',
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.textLight,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.m,
  },
  reviewsSection: {
    marginBottom: theme.spacing.m,
  },
  emptyReviews: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 8,
  },
  emptyReviewsText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  reviewCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#0284C7',
    fontWeight: '800',
    fontSize: 14,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontWeight: '700',
    color: '#333',
    fontSize: 14,
  },
  reviewDate: {
    fontSize: 11,
    color: '#AAA',
    marginTop: 1,
  },
  reviewComment: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  reactionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  reactionBtnActive: {
    backgroundColor: '#ECFDF5',
  },
  reactionBtnDislikeActive: {
    backgroundColor: '#FEF2F2',
  },
  reactionCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
  },
  writeReviewSection: {
    marginBottom: theme.spacing.m,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  ratingSelector: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  starBtn: {
    marginRight: 8,
  },
  reviewInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 80,
    marginBottom: 12,
  },
  submitReviewBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.round,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitReviewText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  relatedSection: {
    marginBottom: theme.spacing.m,
  },
  relatedProductsList: {
    paddingVertical: theme.spacing.s,
    paddingRight: theme.spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.m,
    paddingBottom: 25,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
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
  disabledQtyBtn: {
    backgroundColor: '#F3F4F6',
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
    height: 52,
  },
  disabledAddBtn: {
    backgroundColor: '#DDD',
  },
  addBtnText: {
    ...theme.typography.title,
    color: theme.colors.surface,
  },
  ribbonContainer: {
    position: 'absolute',
    top: 15,
    left: 0,
    zIndex: 10,
  },
  ribbonBody: {
    backgroundColor: theme.colors.primary, // green color
    paddingVertical: 4,
    paddingLeft: 16, // notch width is 10, so 16 leaves padding for text
    paddingRight: 10,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  ribbonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  ribbonCutout: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    borderTopWidth: 12,
    borderBottomWidth: 12,
    borderLeftWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#E6F8EF', // matching theme.colors.primaryLight background
  },
  ribbonFold: {
    position: 'absolute',
    bottom: -6,
    right: 0,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderRightWidth: 6,
    borderTopColor: '#007A41', // darker shadow green
    borderRightColor: 'transparent',
  },
  originalPriceDetail: {
    fontSize: 14,
    color: '#8F92A1',
    textDecorationLine: 'line-through',
    marginTop: 2,
  }
});

export default ProductDetailScreen;
