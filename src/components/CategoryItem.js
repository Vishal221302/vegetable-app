import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Image } from 'react-native';
import { theme } from '../utils/theme';

const CategoryItem = ({ item, isSelected, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Image source={{ uri: item.image }} style={styles.image} />
      </View>
      <Text style={styles.text}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: theme.spacing.l,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.round,
    backgroundColor: '#F3FBF6', // Very light green background
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  image: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  text: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.text,
  }
});

export default CategoryItem;
