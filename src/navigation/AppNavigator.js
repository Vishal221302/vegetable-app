import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { loadUser } from '../store/slices/authSlice';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Onboarding Screens
import SplashScreen from '../screens/onboarding/SplashScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import OtpScreen from '../screens/auth/OtpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main Screens
import HomeScreen from '../screens/HomeScreen';
import ProductListScreen from '../screens/ProductListScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import AddressScreen from '../screens/AddressScreen';
import PaymentScreen from '../screens/PaymentScreen';
import OrderSuccessScreen from '../screens/OrderSuccessScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import OrdersScreen from '../screens/OrdersScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';

import { theme } from '../utils/theme';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, StyleSheet, Platform, LayoutAnimation, UIManager, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const { totalCount: cartCount } = useSelector(state => state.cart);

  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              if (route.name === 'CartTab') {
                navigation.navigate('Cart');
              } else {
                navigation.navigate(route.name);
              }
            }
          };

          let iconName;
          let label = '';
          if (route.name === 'HomeTab') {
            iconName = isFocused ? 'home' : 'home-outline';
            label = 'Home';
          } else if (route.name === 'FavoritesTab') {
            iconName = isFocused ? 'heart' : 'heart-outline';
            label = 'Favorite';
          } else if (route.name === 'CartTab') {
            iconName = 'cart';
          } else if (route.name === 'OrdersTab') {
            iconName = isFocused ? 'document-text' : 'document-text-outline';
            label = 'Order';
          } else if (route.name === 'ProfileTab') {
            iconName = isFocused ? 'person' : 'person-outline';
            label = 'Account';
          }

          if (route.name === 'CartTab') {
            return (
              <View key={route.key} style={styles.floatingButtonContainer}>
                {/* This white circle creates the notch effect */}
                <View style={styles.notchBackground} />
                <TouchableOpacity
                  onPress={onPress}
                  style={styles.floatingCart}
                  activeOpacity={0.9}
                >
                  <Ionicons name="cart" size={28} color="#FFFFFF" />
                  {cartCount > 0 && (
                    <View style={styles.floatingBadge}>
                      <Text style={styles.badgeText}>{cartCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={iconName} 
                size={24} 
                color={isFocused ? theme.colors.primary : '#A0A0A0'} 
              />
              <Text style={[
                styles.tabLabel, 
                { color: isFocused ? theme.colors.primary : '#A0A0A0' }
              ]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const MainTabs = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="FavoritesTab" component={FavoritesScreen} />
      <Tab.Screen name="CartTab" component={View} /> 
      <Tab.Screen name="OrdersTab" component={OrdersScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector(state => state.auth);
  const [isFirstTime, setIsFirstTime] = React.useState(null);

  useEffect(() => {
    const checkFirstTime = async () => {
      try {
        const value = await AsyncStorage.getItem('alreadyLaunched');
        if (value === null) {
          // First time launch
          setIsFirstTime(true);
        } else {
          setIsFirstTime(false);
        }
      } catch (error) {
        setIsFirstTime(false);
      }
    };

    checkFirstTime();
    dispatch(loadUser());
  }, [dispatch]);

  if (loading || isFirstTime === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerShadowVisible: false,
        }}
      >
        {!isAuthenticated ? (
          // Onboarding & Auth Stack
          <Stack.Group screenOptions={{ headerShown: false }}>
            {isFirstTime ? (
              <>
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
              </>
            ) : (
              <Stack.Screen name="Login" component={LoginScreen} />
            )}
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="Otp" component={OtpScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </Stack.Group>
        ) : (
          // Main Stack
          <Stack.Group>
            <Stack.Screen 
              name="Main" 
              component={MainTabs} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="ProductList" 
              component={ProductListScreen} 
              options={{ title: 'Products' }}
            />
            <Stack.Screen 
              name="Categories" 
              component={CategoriesScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="ProductDetail" 
              component={ProductDetailScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Address" 
              component={AddressScreen} 
              options={{ title: 'Select Address' }}
            />
            <Stack.Screen 
              name="Payment" 
              component={PaymentScreen} 
              options={{ title: 'Payment' }}
            />
            <Stack.Screen 
              name="EditProfile" 
              component={EditProfileScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="HelpSupport" 
              component={HelpSupportScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Cart" 
              component={CartScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="OrderSuccess" 
              component={OrderSuccessScreen} 
              options={{ headerShown: false }}
            />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: '#FFFFFF',
    zIndex: 1000, 
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    height: 70,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 20,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  floatingButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 70,
  },
  notchBackground: {
    position: 'absolute',
    top: -35,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
  },
  floatingCart: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    top: -30,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  floatingBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: theme.colors.error,
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  }
});

export default AppNavigator;
