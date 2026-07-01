import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const SettingsScreen = ({ navigation }) => {
  const { isDark, colors, toggleTheme } = useTheme();

  const SettingItem = ({ title, subtitle, icon, iconColor, value, onToggle, isSwitch, onPress }) => (
    <TouchableOpacity
      activeOpacity={onPress || isSwitch ? 0.7 : 1}
      onPress={onPress}
      style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: (iconColor || colors.primary) + '18' }]}>
          <Ionicons name={icon} size={20} color={iconColor || colors.primary} />
        </View>
        <View>
          <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
          {subtitle ? <Text style={[styles.settingSubtitle, { color: colors.textLight }]}>{subtitle}</Text> : null}
        </View>
      </View>
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primary + '90' }}
          thumbColor={value ? colors.primary : colors.textLight}
          ios_backgroundColor={colors.border}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentPadding}>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textLight }]}>Appearance</Text>
          <SettingItem
            title="Dark Mode"
            subtitle={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            icon={isDark ? 'sunny-outline' : 'moon-outline'}
            iconColor={isDark ? '#F5A623' : '#6C5CE7'}
            value={isDark}
            onToggle={toggleTheme}
            isSwitch={true}
          />
          <SettingItem
            title="Language"
            subtitle="English"
            icon="globe-outline"
            iconColor="#00B4D8"
          />
        </View>

        {/* Account & Security */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textLight }]}>Account &amp; Security</Text>
          <SettingItem
            title="Change Password"
            icon="lock-closed-outline"
            iconColor="#FF6B6B"
          />
          <SettingItem
            title="Privacy Settings"
            icon="shield-checkmark-outline"
            iconColor="#4ECDC4"
          />
          <SettingItem
            title="Two-Factor Auth"
            icon="key-outline"
            iconColor="#FFD93D"
          />
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textLight }]}>About</Text>
          <SettingItem
            title="App Version"
            subtitle="1.0.0"
            icon="information-circle-outline"
            iconColor="#A8DADC"
          />
          <SettingItem
            title="Terms of Service"
            icon="document-text-outline"
            iconColor="#B5838D"
          />
        </View>

        <TouchableOpacity style={[styles.deleteBtn, { borderColor: colors.error + '40', backgroundColor: colors.error + '10' }]}>
          <Ionicons name="trash-outline" size={18} color={colors.error} style={{ marginRight: 8 }} />
          <Text style={[styles.deleteBtnText, { color: colors.error }]}>Delete Account</Text>
        </TouchableOpacity>
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
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentPadding: {
    paddingBottom: 40,
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  deleteBtn: {
    marginTop: 36,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  deleteBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});

export default SettingsScreen;
