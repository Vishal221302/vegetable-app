import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';

const ProductCard = ({ item, onAdd, onPress, isFavorite, onFavoritePress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {item.discount && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{item.discount}%</Text>
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.favoriteButton} 
        onPress={() => onFavoritePress(item)}
      >
        <Ionicons 
          name={isFavorite ? "heart" : "heart-outline"} 
          size={20} 
          color={isFavorite ? theme.colors.error : theme.colors.textLight} 
        />
      </TouchableOpacity>

      <Image source={{ uri: item.image }} style={styles.image} />
      
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{item.name}</Text>
        <View style={styles.bottomRow}>
          <Text style={styles.priceContainer}>
            <Text style={styles.price}>₹{item.price.toFixed(2)}</Text>
            <Text style={styles.pricePer}> /{item.pricePer}</Text>
          </Text>
          <TouchableOpacity style={styles.addButton} onPress={() => onAdd(item)}>
            <Ionicons name="add" size={20} color={theme.colors.surface} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    marginRight: 15,
    width: 170,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 5,
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
  infoContainer: {
    marginTop: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
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
    color: '#1A1A1A',
  },
  pricePer: {
    fontSize: 10,
    color: '#888',
  },
  addButton: {
    backgroundColor: '#1A1A1A',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProductCard;
