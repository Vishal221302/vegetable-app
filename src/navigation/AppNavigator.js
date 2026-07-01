import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { loadUser } from '../store/slices/authSlice';
import { ActivityIndicator, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

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
import ChatScreen from '../screens/ChatScreen';
import EmailSupportScreen from '../screens/EmailSupportScreen';

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
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.tabBarContainer, { backgroundColor: colors.tabBarBg }]}>
      <View style={[styles.tabBar, { backgroundColor: colors.tabBarBg }]}>
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
                {/* This notch background matches tab bar */}
                <View style={[styles.notchBackground, { backgroundColor: colors.tabBarBg }]} />
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
                color={isFocused ? colors.primary : colors.textLight} 
              />
              <Text style={[
                styles.tabLabel, 
                { color: isFocused ? colors.primary : colors.textLight }
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
  const { isDark, colors } = useTheme();

  useEffect(() => {
    const checkFirstTime = async () => {
      try {
        const value = await AsyncStorage.getItem('alreadyLaunched');
        if (value === null) {
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.headerBg} />
      <Stack.Navigator
        initialRouteName={isFirstTime ? 'Splash' : 'Main'}
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.headerBg,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerShadowVisible: false,
        }}
      >
        {/* Onboarding — always present so navigation works */}
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />

        {/* Auth — always present so goBack() returns user to prev screen after login */}
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Otp" component={OtpScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />

        {/* Main — accessible to all users including guests */}
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="ProductList" component={ProductListScreen} options={{ title: 'Products' }} />
        <Stack.Screen name="Categories" component={CategoriesScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Address" component={AddressScreen} options={{ title: 'Select Address' }} />
        <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Payment' }} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Cart" component={CartScreen} options={{ headerShown: false }} />
        <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
        <Stack.Screen name="EmailSupport" component={EmailSupportScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    zIndex: 1000, 
  },
  tabBar: {
    flexDirection: 'row',
    height: 70,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
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
  },
  floatingCart: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#01B763',
    justifyContent: 'center',
    alignItems: 'center',
    top: -30,
    shadowColor: '#01B763',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  floatingBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
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
