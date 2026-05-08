import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

const SkeletonLoader = ({ width, height, borderRadius = 4, style }) => {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, [shimmerValue]);

  const translateX = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View style={[styles.skeleton, { width, height, borderRadius }, style]}>
      <Animated.View
        style={[
          styles.shimmer,
          {
            width: width,
            height: height,
            transform: [{ translateX }],
          },
        ]}
      >
        <View style={styles.shimmerGradient} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E1E9EE',
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  shimmerGradient: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    // In a real app with Expo, you'd use LinearGradient here
    // For now, a semi-transparent white view moving across works well
  },
});

export const ProductSkeleton = () => (
  <View style={productStyles.card}>
    <SkeletonLoader width="100%" height={110} borderRadius={15} />
    <View style={{ marginTop: 10 }}>
      <SkeletonLoader width="80%" height={16} borderRadius={4} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, alignItems: 'center' }}>
        <SkeletonLoader width="40%" height={20} borderRadius={4} />
        <SkeletonLoader width={28} height={28} borderRadius={14} />
      </View>
    </View>
  </View>
);

const productStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    marginRight: 15,
    width: 170,
    marginBottom: 5,
  }
});

export default SkeletonLoader;
