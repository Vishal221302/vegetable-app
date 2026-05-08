import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { theme } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const EditProfileScreen = ({ navigation }) => {
  const [name, setName] = useState('Tariqul Islam');
  const [email, setEmail] = useState('tariqul.islam@example.com');
  const [phone, setPhone] = useState('+880 1234 567890');
  const [address, setAddress] = useState('Dhaka, Bangladesh');

  const handleSave = () => {
    // Logic to save profile changes
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageSection}>
          <View style={styles.imageWrapper}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80' }} 
              style={styles.profileImage} 
            />
            <TouchableOpacity style={styles.cameraIcon}>
              <Ionicons name="camera" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="location-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your location"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.updateBtn} onPress={handleSave}>
          <Text style={styles.updateBtnText}>Update Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  imageSection: {
    alignItems: 'center',
    marginVertical: 30,
  },
  imageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#F8F9FA',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 5,
    backgroundColor: theme.colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  form: {
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginLeft: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
  },
  updateBtn: {
    backgroundColor: theme.colors.primary,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  updateBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  }
});

export default EditProfileScreen;
