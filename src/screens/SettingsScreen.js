import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { theme } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const SettingsScreen = ({ navigation }) => {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const SettingItem = ({ title, icon, value, onToggle, isSwitch }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={22} color={theme.colors.primary} />
        </View>
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      {isSwitch ? (
        <Switch 
          value={value} 
          onValueChange={onToggle}
          trackColor={{ false: '#DDD', true: theme.colors.primary + '80' }}
          thumbColor={value ? theme.colors.primary : '#F4F3F4'}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#CCC" />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <SettingItem 
            title="Push Notifications" 
            icon="notifications-outline" 
            value={pushNotifications} 
            onToggle={setPushNotifications}
            isSwitch={true}
          />
          <SettingItem 
            title="Email Notifications" 
            icon="mail-outline" 
            value={emailNotifications} 
            onToggle={setEmailNotifications}
            isSwitch={true}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <SettingItem 
            title="Dark Mode" 
            icon="moon-outline" 
            value={darkMode} 
            onToggle={setDarkMode}
            isSwitch={true}
          />
          <SettingItem title="Language" icon="globe-outline" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account & Security</Text>
          <SettingItem title="Change Password" icon="lock-closed-outline" />
          <SettingItem title="Privacy Settings" icon="shield-checkmark-outline" />
          <SettingItem title="Two-Factor Auth" icon="key-outline" />
        </View>

        <TouchableOpacity style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#888',
    marginBottom: 15,
    marginLeft: 5,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 20,
    marginBottom: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  deleteBtn: {
    marginTop: 40,
    marginBottom: 40,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: theme.colors.error,
    fontSize: 16,
    fontWeight: '700',
  }
});

export default SettingsScreen;
