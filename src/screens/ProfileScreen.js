import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { theme } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { items: cartItems } = useSelector(state => state.cart);
  const { items: wishlistItems } = useSelector(state => state.wishlist);
  const { colors } = useTheme();

  const handleLogout = () => {
    dispatch(logout());
  };

  // Guest view — prompt login
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        </View>
        <View style={styles.guestContainer}>
          <View style={[styles.guestIconCircle, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="person-outline" size={52} color={colors.primary} />
          </View>
          <Text style={[styles.guestTitle, { color: colors.text }]}>You're not logged in</Text>
          <Text style={[styles.guestSubtitle, { color: colors.textLight }]}>Login or create an account to view your profile, orders, wishlist and more.</Text>
          <TouchableOpacity style={[styles.guestLoginBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.guestLoginBtnText}>Login / Sign Up</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const menuItems = [
    { id: 1, title: 'Edit Profile', icon: 'person-outline', color: '#4A90E2', screen: 'EditProfile' },
    { id: 7, title: 'My Wishlist', icon: 'heart-outline', color: '#FF5A5F', screen: 'FavoritesTab' },
    { id: 2, title: 'My Addresses', icon: 'location-outline', color: '#F5A623', screen: 'Address' },
    { id: 3, title: 'Payment Methods', icon: 'card-outline', color: '#50E3C2' },
    { id: 4, title: 'Settings', icon: 'settings-outline', color: '#9013FE', screen: 'Settings' },
    { id: 5, title: 'Help & Support', icon: 'help-circle-outline', color: '#417505', screen: 'HelpSupport' },
    { id: 6, title: 'Privacy Policy', icon: 'shield-checkmark-outline', color: '#D0021B' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <TouchableOpacity style={styles.settingsTopBtn}>
          <Ionicons name="cog-outline" size={24} color={colors.icon} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
          <View style={styles.imageWrapper}>
            <Image 
              source={{ uri: user?.profileImage || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }} 
              style={styles.profileImage} 
            />
            <TouchableOpacity style={styles.editIcon} onPress={() => navigation.navigate('EditProfile')}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>{user?.name || 'Guest User'}</Text>
          <Text style={[styles.email, { color: colors.textLight }]}>{user?.email || 'No email provided'}</Text>
          
          <View style={[styles.statsContainer, { borderTopColor: colors.border }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.text }]}>{cartItems.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textLight }]}>In Cart</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.text }]}>{wishlistItems.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textLight }]}>Wishlist</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.text }]}>12</Text>
              <Text style={[styles.statLabel, { color: colors.textLight }]}>Orders</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Settings</Text>
          {menuItems.map(item => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.menuItem, { backgroundColor: colors.card }]}
              onPress={() => item.screen && navigation.navigate(item.screen)}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: item.color + '18' }]}>
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </View>
                <Text style={[styles.menuItemTitle, { color: colors.text }]}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={[styles.menuItem, styles.logoutItem, { backgroundColor: colors.card }]} onPress={handleLogout}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: colors.error + '18' }]}>
                <Ionicons name="log-out-outline" size={22} color={colors.error} />
              </View>
              <Text style={[styles.menuItemTitle, { color: colors.error }]}>Log Out</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footerInfo}>
          <Text style={[styles.versionText, { color: colors.textLight }]}>Version 1.0.4 (2026)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  settingsTopBtn: {
    padding: 5,
  },
  scrollContent: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#F8F9FA',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  email: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 25,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    width: '100%',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#F0F0F0',
    alignSelf: 'center',
  },
  menuSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 15,
    marginLeft: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  logoutItem: {
    marginTop: 10,
  },
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  guestIconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: theme.colors.primaryLight || '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
  },
  guestLoginBtn: {
    marginTop: 8,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 30,
  },
  guestLoginBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  footerInfo: {
    alignItems: 'center',
    marginBottom: 120,
  },
  versionText: {
    fontSize: 12,
    color: '#BBB',
  }
});

export default ProfileScreen;
