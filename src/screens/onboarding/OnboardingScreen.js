import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PagerView from 'react-native-pager-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../../utils/theme';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: 'Affordable Organic\nfor Everyone',
    description: 'Get affordable organic groceries made for everyone, every single day.',
    image: require('../../assets/onboarding/slide1.png'),
    backgroundColor: '#F0FFF4', // Soft light green
  },
  {
    id: 2,
    title: 'Your Grocery\nList In One Place',
    description: 'Manage your grocery list easily, all in one convenient, organized place.',
    image: require('../../assets/onboarding/slide2.png'),
    backgroundColor: '#F9FBF9', // Almost white green
  },
  {
    id: 3,
    title: 'Fast & Healthy\nDelivery',
    description: 'Fresh vegetables delivered to your doorstep within 30 minutes.',
    image: require('../../assets/onboarding/slide3.png'),
    backgroundColor: '#E8F5E9', // Soft mint green
  }
];

const OnboardingScreen = ({ navigation }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const pagerRef = useRef(null);

  const handleNext = async () => {
    if (currentPage < slides.length - 1) {
      pagerRef.current?.setPage(currentPage + 1);
    } else {
      await AsyncStorage.setItem('alreadyLaunched', 'true');
      navigation.replace('Login');
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('alreadyLaunched', 'true');
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <PagerView 
        style={styles.pager} 
        initialPage={0}
        ref={pagerRef}
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
      >
        {slides.map((slide, index) => (
          <View key={slide.id} style={[styles.slide, { backgroundColor: slide.backgroundColor }]}>
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.header}>
                <View style={styles.logoRow}>
                  <View style={styles.logoIcon}>
                    <Ionicons name="leaf" size={18} color="#FFFFFF" />
                  </View>
                  <Text style={styles.logoText}>EcoThrive</Text>
                </View>
                <TouchableOpacity onPress={handleSkip}>
                  <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.imageContainer}>
                <Image source={slide.image} style={styles.image} />
              </View>

              <View style={styles.content}>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{slide.title}</Text>
                  {index === 0 && (
                    <View style={styles.titleIcon}>
                      <Ionicons name="nutrition" size={24} color={theme.colors.primary} />
                    </View>
                  )}
                </View>
                <Text style={styles.description}>{slide.description}</Text>
              </View>

              <View style={styles.footer}>
                <View style={styles.pagination}>
                  {slides.map((_, i) => (
                    <View 
                      key={i} 
                      style={[
                        styles.dot, 
                        { 
                          width: i === currentPage ? 24 : 8,
                          backgroundColor: i === currentPage ? theme.colors.primary : '#D1D1D1' 
                        }
                      ]} 
                    />
                  ))}
                </View>
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                  <Text style={styles.nextButtonText}>
                    {currentPage === slides.length - 1 ? 'Get Started' : 'Next'}
                  </Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
        ))}
      </PagerView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pager: {
    flex: 1,
  },
  slide: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    backgroundColor: theme.colors.primary,
    padding: 6,
    borderRadius: 8,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1C1C28',
    marginLeft: 10,
  },
  skipText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width,
    height: height * 0.45,
    resizeMode: 'contain',
  },
  content: {
    paddingHorizontal: 30,
    paddingBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1C1C28',
    lineHeight: 42,
  },
  titleIcon: {
    backgroundColor: '#E8F5E9',
    padding: 8,
    borderRadius: 15,
    marginLeft: 10,
  },
  description: {
    fontSize: 17,
    color: '#606060',
    lineHeight: 26,
    fontWeight: '400',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  pagination: {
    flexDirection: 'row',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  nextButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 35,
    paddingVertical: 15,
    borderRadius: 18,
    elevation: 4,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default OnboardingScreen;
