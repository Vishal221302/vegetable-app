import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  KeyboardAvoidingView, Platform, Switch, Alert, ActivityIndicator 
} from 'react-native';
import { theme } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import Input from '../components/Input';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../utils/api';
import { useFocusEffect } from '@react-navigation/native';

const AddressScreen = ({ navigation, route }) => {
  const mode = route.params?.mode; // 'checkout' or undefined
  const [viewState, setViewState] = useState('list'); // 'list' or 'form'
  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    _id: null,
    fullName: '',
    mobileNumber: '',
    emailAddress: '',
    houseNo: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    addressType: 'Home',
    deliveryInstructions: '',
    isDefault: false,
  });

  const [errors, setErrors] = useState({});

  /* ─── Fetch Addresses from Backend ─── */
  const fetchAddresses = async () => {
    try {
      const { data } = await api.get('/user/addresses');
      setAddresses(data);
      if (data.length > 0) {
        const defaultAddr = data.find(a => a.isDefault) || data[0];
        setSelectedId(defaultAddr._id);
      }
    } catch (e) {
      console.error('Failed to fetch addresses:', e);
      Alert.alert('Error', 'Could not load your addresses');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [])
  );

  /* ─── Form Handlers ─── */
  const resetForm = () => {
    setFormData({
      _id: null,
      fullName: '',
      mobileNumber: '',
      emailAddress: '',
      houseNo: '',
      street: '',
      landmark: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
      addressType: 'Home',
      deliveryInstructions: '',
      isDefault: false,
    });
    setErrors({});
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleGetLocation = () => {
    setIsLocating(true);
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        houseNo: 'Flat 402, Shiv Plaza',
        street: 'Adajan Road',
        landmark: 'Near Star Bazar',
        city: 'Surat',
        state: 'Gujarat',
        pincode: '395009'
      }));
      setIsLocating(false);
      Alert.alert('Location Found', 'Your current address has been partially filled.');
    }, 1500);
  };

  const saveAddress = async () => {
    let newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Required';
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Required';
    if (!formData.houseNo.trim()) newErrors.houseNo = 'Required';
    if (!formData.city.trim()) newErrors.city = 'Required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    try {
      if (formData._id) {
        // Edit
        await api.put(`/user/addresses/${formData._id}`, formData);
      } else {
        // Add
        await api.post('/user/addresses', formData);
      }
      
      await fetchAddresses();
      setViewState('list');
      resetForm();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to save address');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteAddress = (id) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to remove this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/user/addresses/${id}`);
              await fetchAddresses();
            } catch (e) {
              Alert.alert('Error', 'Failed to delete address');
            }
          }
        }
      ]
    );
  };

  const editAddress = (addr) => {
    setFormData(addr);
    setViewState('form');
  };

  const handleProceed = () => {
    const selected = addresses.find(a => a._id === selectedId);
    if (!selected) {
      Alert.alert('Select Address', 'Please select or add a delivery address');
      return;
    }
    const fullString = `${selected.houseNo}, ${selected.street}, ${selected.city} - ${selected.pincode}`;
    navigation.navigate('Payment', { shippingAddress: fullString });
  };

  /* ─── Render Components ─── */
  const AddressCard = ({ item }) => (
    <TouchableOpacity 
      style={[styles.addrCard, selectedId === item._id && styles.activeAddrCard]}
      onPress={() => setSelectedId(item._id)}
      activeOpacity={0.8}
    >
      <View style={styles.addrHeader}>
        <View style={styles.addrTypeBadge}>
          <Ionicons 
            name={item.addressType === 'Home' ? 'home' : 'business'} 
            size={14} 
            color={theme.colors.primary} 
          />
          <Text style={styles.addrTypeText}>{item.addressType}</Text>
        </View>
        <View style={styles.addrActions}>
          <TouchableOpacity onPress={() => editAddress(item)} style={styles.iconBtn}>
            <Ionicons name="pencil" size={18} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteAddress(item._id)} style={styles.iconBtn}>
            <Ionicons name="trash-outline" size={18} color="#FF4D4F" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.addrName}>{item.fullName}</Text>
      <Text style={styles.addrText} numberOfLines={2}>
        {item.houseNo}, {item.street}, {item.landmark && item.landmark + ', '}{item.city}, {item.pincode}
      </Text>
      <Text style={styles.addrMobile}>📞 {item.mobileNumber}</Text>

      {item.isDefault && (
        <View style={styles.defaultTag}>
          <Text style={styles.defaultTagText}>DEFAULT</Text>
        </View>
      )}

      <View style={styles.selectionIndicator}>
        <Ionicons 
          name={selectedId === item._id ? "checkmark-circle" : "ellipse-outline"} 
          size={24} 
          color={selectedId === item._id ? theme.colors.primary : "#DDD"} 
        />
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {viewState === 'list' ? 'My Addresses' : (formData._id ? 'Edit Address' : 'Add New Address')}
          </Text>
          {viewState === 'list' && (
            <TouchableOpacity 
              style={styles.addSmallBtn}
              onPress={() => { resetForm(); setViewState('form'); }}
            >
              <Ionicons name="add-circle" size={20} color={theme.colors.primary} />
              <Text style={styles.addSmallText}>Add New</Text>
            </TouchableOpacity>
          )}
        </View>

        {viewState === 'list' ? (
          <ScrollView contentContainerStyle={styles.listContent}>
            {addresses.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="location-outline" size={80} color="#EEE" />
                <Text style={styles.emptyText}>No addresses saved in cloud yet</Text>
                <Button 
                  title="Add Your First Address" 
                  onPress={() => setViewState('form')} 
                  type="outline"
                  style={{ marginTop: 20 }}
                />
              </View>
            ) : (
              addresses.map(addr => <AddressCard key={addr._id} item={addr} />)
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={styles.locationBtn} onPress={handleGetLocation} disabled={isLocating}>
              {isLocating ? <ActivityIndicator size="small" color="#FFF" /> : (
                <><Ionicons name="navigate-circle" size={24} color="#FFF" /><Text style={styles.locationBtnText}>Use GPS Location</Text></>
              )}
            </TouchableOpacity>

            <View style={styles.formCard}>
              <Input label="Full Name *" value={formData.fullName} onChangeText={(v) => handleInputChange('fullName', v)} error={errors.fullName} />
              <Input label="Mobile Number *" keyboardType="phone-pad" value={formData.mobileNumber} onChangeText={(v) => handleInputChange('mobileNumber', v)} error={errors.mobileNumber} />
              <Input label="House / Flat No. *" value={formData.houseNo} onChangeText={(v) => handleInputChange('houseNo', v)} error={errors.houseNo} />
              <Input label="Street / Area" value={formData.street} onChangeText={(v) => handleInputChange('street', v)} />
              <Input label="Landmark" value={formData.landmark} onChangeText={(v) => handleInputChange('landmark', v)} />
              <View style={styles.row}>
                <View style={{ flex: 1 }}><Input label="City *" value={formData.city} onChangeText={(v) => handleInputChange('city', v)} error={errors.city} /></View>
                <View style={{ width: 12 }} /><View style={{ flex: 1 }}><Input label="Pincode *" value={formData.pincode} keyboardType="number-pad" onChangeText={(v) => handleInputChange('pincode', v)} error={errors.pincode} /></View>
              </View>
              <View style={styles.typeToggleRow}>
                {['Home', 'Office'].map(type => (
                  <TouchableOpacity key={type} style={[styles.typeToggleBtn, formData.addressType === type && styles.activeTypeToggle]} onPress={() => handleInputChange('addressType', type)}>
                    <Text style={[styles.typeToggleText, formData.addressType === type && styles.activeTypeToggleText]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Make Default</Text>
                <Switch value={formData.isDefault} onValueChange={(v) => handleInputChange('isDefault', v)} trackColor={{ true: theme.colors.primary }} />
              </View>
            </View>

            <View style={styles.formActionRow}>
              <Button title="Cancel" type="outline" onPress={() => setViewState('list')} style={{ flex: 1 }} />
              <View style={{ width: 15 }} />
              <Button title={isSaving ? "Saving..." : "Save Address"} onPress={saveAddress} disabled={isSaving} style={{ flex: 2 }} />
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      {viewState === 'list' && addresses.length > 0 && mode === 'checkout' && (
        <View style={styles.footer}>
          <Button title="Proceed to Payment" onPress={handleProceed} style={styles.mainBtn} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 22, paddingTop: 20, paddingBottom: 15, backgroundColor: '#FFF' 
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  addSmallBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  addSmallText: { color: theme.colors.primary, fontWeight: '700', fontSize: 14 },
  listContent: { padding: 22 },
  addrCard: { 
    backgroundColor: '#FFF', borderRadius: 20, padding: 18, marginBottom: 15,
    borderWidth: 1.5, borderColor: '#F0F0F0', position: 'relative'
  },
  activeAddrCard: { borderColor: theme.colors.primary, backgroundColor: '#FDFEFF' },
  addrHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  addrTypeBadge: { 
    flexDirection: 'row', alignItems: 'center', gap: 5, 
    backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 
  },
  addrTypeText: { fontSize: 11, fontWeight: '700', color: theme.colors.primary, textTransform: 'uppercase' },
  addrActions: { flexDirection: 'row', gap: 15 },
  iconBtn: { padding: 4 },
  addrName: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  addrText: { fontSize: 13, color: '#666', lineHeight: 18, paddingRight: 40 },
  addrMobile: { fontSize: 13, fontWeight: '600', color: '#333', marginTop: 8 },
  defaultTag: { position: 'absolute', top: 18, right: 100, backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  defaultTagText: { fontSize: 9, fontWeight: '800', color: '#999' },
  selectionIndicator: { position: 'absolute', bottom: 18, right: 18 },
  emptyBox: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, color: '#AAA', fontWeight: '600', marginTop: 10 },
  formContent: { padding: 22 },
  locationBtn: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#4F46E5', paddingVertical: 15, borderRadius: 16, marginBottom: 20 
  },
  locationBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  formCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 20 },
  row: { flexDirection: 'row' },
  typeToggleRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  typeToggleBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#F0F0F0', alignItems: 'center' },
  activeTypeToggle: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary },
  typeToggleText: { fontWeight: '700', color: '#666' },
  activeTypeToggleText: { color: '#FFF' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  switchLabel: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  formActionRow: { flexDirection: 'row' },
  footer: { padding: 22, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  mainBtn: { height: 56, borderRadius: 18 }
});

export default AddressScreen;
