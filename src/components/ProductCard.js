import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { theme, getDiscountedPrice } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const ProductCard = ({ item, onAdd, onPress, isFavorite, onFavoritePress }) => {
  const isOutOfStock = item.countInStock <= 0;
  const { colors, isDark } = useTheme();

  // The ribbon cutout needs to match the card background
  const cardBg = colors.card;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cardBg, shadowColor: isDark ? '#000' : '#000' }, isOutOfStock && styles.outOfStockCard]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {item.tag && !isOutOfStock ? (
        <View style={styles.ribbonContainer}>
          <View style={styles.ribbonBody}>
            <Text style={styles.ribbonText}>{item.tag}</Text>
            <View style={[styles.ribbonCutout, { borderLeftColor: cardBg }]} />
          </View>
          <View style={styles.ribbonFold} />
        </View>
      ) : item.discount && !isOutOfStock ? (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{item.discount}%</Text>
        </View>
      ) : null}

      {isOutOfStock && (
        <View style={[styles.outOfStockBadge, { backgroundColor: colors.error + '15', borderColor: colors.error + '30' }]}>
          <Text style={[styles.outOfStockText, { color: colors.error }]}>Out of Stock</Text>
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.favoriteButton} 
        onPress={() => onFavoritePress(item)}
      >
        <Ionicons 
          name={isFavorite ? "heart" : "heart-outline"} 
          size={20} 
          color={isFavorite ? theme.colors.error : colors.textLight} 
        />
      </TouchableOpacity>

      <Image source={{ uri: item.image }} style={[styles.image, isOutOfStock && styles.outOfStockImage]} />
      
      <View style={styles.infoContainer}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
        <View style={styles.bottomRow}>
          <Text style={styles.priceContainer}>
            {item.tag && getDiscountedPrice(item.price, item.tag) !== item.price ? (
              <Text>
                <Text style={[styles.price, { color: colors.text }]}>₹{getDiscountedPrice(item.price, item.tag).toFixed(2)}</Text>
                <Text style={styles.originalPrice}> ₹{item.price.toFixed(2)}</Text>
              </Text>
            ) : (
              <Text style={[styles.price, { color: colors.text }]}>₹{item.price.toFixed(2)}</Text>
            )}
            <Text style={[styles.pricePer, { color: colors.textLight }]}> /{item.pricePer}</Text>
          </Text>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: isDark ? colors.primary : '#1A1A1A' }, isOutOfStock && styles.disabledAddButton]} 
            onPress={() => !isOutOfStock && onAdd(item)}
            disabled={isOutOfStock}
          >
            <Ionicons name={isOutOfStock ? "close" : "add"} size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 15,
    marginRight: 15,
    width: 170,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 5,
  },
  outOfStockCard: {
    opacity: 0.8,
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    zIndex: 1,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 1,
  },
  outOfStockText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  image: {
    width: '100%',
    height: 110,
    resizeMode: 'contain',
    marginTop: 10,
    marginBottom: 10,
  },
  outOfStockImage: {
    opacity: 0.4,
  },
  infoContainer: {
    marginTop: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
  },
  pricePer: {
    fontSize: 10,
  },
  originalPrice: {
    fontSize: 10,
    color: '#8F92A1',
    textDecorationLine: 'line-through',
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledAddButton: {
    backgroundColor: '#CCC',
  },
  ribbonContainer: {
    position: 'absolute',
    top: 15,
    left: 0,
    zIndex: 10,
  },
  ribbonBody: {
    backgroundColor: '#01B763',
    paddingVertical: 3,
    paddingLeft: 12,
    paddingRight: 8,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  ribbonText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  ribbonCutout: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderLeftWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    // borderLeftColor set dynamically
  },
  ribbonFold: {
    position: 'absolute',
    bottom: -5,
    right: 0,
    width: 0,
    height: 0,
    borderTopWidth: 5,
    borderRightWidth: 5,
    borderTopColor: '#007A41',
    borderRightColor: 'transparent',
  },
});

export default ProductCard;
