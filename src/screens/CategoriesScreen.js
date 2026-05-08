import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { theme } from '../utils/theme';
import { categories } from '../utils/dummyData';
import { Ionicons } from '@expo/vector-icons';
import CartIcon from '../components/CartIcon';

const CategoriesScreen = ({ navigation }) => {
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <CartIcon />,
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>All Categories</Text>
        <View style={{ width: 44 }} />
      </View>
      <FlatList 
        data={categories}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.categoryCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ProductList', { category: item.name })}
          >
            <View style={styles.iconContainer}>
              <Image source={{ uri: item.image }} style={styles.image} />
            </View>
            <Text style={styles.categoryName}>{item.name}</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxl + 10,
    paddingBottom: theme.spacing.m,
    backgroundColor: theme.colors.surface,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...theme.typography.h2,
  },
  listContainer: {
    padding: theme.spacing.m,
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginBottom: theme.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3FBF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  image: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
  categoryName: {
    ...theme.typography.title,
    textAlign: 'center',
  }
});

export default CategoriesScreen;
