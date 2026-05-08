import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../utils/theme';

const { width } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const textOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo scale and opacity animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Delayed text fade-in
    Animated.timing(textOpacityAnim, {
      toValue: 1,
      duration: 1000,
      delay: 500,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.logoContainer, 
        { transform: [{ scale: scaleAnim }], opacity: opacityAnim }
      ]}>
        <View style={styles.iconCircle}>
          <Ionicons name="leaf" size={80} color={theme.colors.primary} />
        </View>
        <Animated.View style={{ opacity: textOpacityAnim, alignItems: 'center' }}>
          <Text style={styles.title}>VeggieFresh</Text>
          <Text style={styles.subtitle}>Premium Grocery Delivery</Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
    fontWeight: '500',
  }
});

export default SplashScreen;
