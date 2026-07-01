import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl, Modal, ScrollView,
  Dimensions, TextInput, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { theme } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../utils/api';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

const { height } = Dimensions.get('window');

const OrdersScreen = () => {
  const [activeTab, setActiveTab]         = useState('Active');
  const [orders, setOrders]               = useState([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { colors, isDark } = useTheme();

  // Address edit state
  const [editingAddress, setEditingAddress]   = useState(false);
  const [newAddress, setNewAddress]           = useState('');
  const [savingAddress, setSavingAddress]     = useState(false);

  // Cancel order state
  const [cancellingOrder, setCancellingOrder] = useState(false);

  /* ─── Fetch orders ─── */
  const fetchOrders = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await api.get('/orders/myorders');
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchOrders();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  /* ─── Save updated address ─── */
  const handleSaveAddress = async () => {
    if (!newAddress.trim()) {
      Alert.alert('Error', 'Address cannot be empty');
      return;
    }
    setSavingAddress(true);
    try {
      const res = await api.put(`/orders/${selectedOrder._id}/address`, {
        shippingAddress: newAddress.trim()
      });
      // Update local state
      const updated = res.data;
      setOrders(prev => prev.map(o => o._id === updated._id ? updated : o));
      setSelectedOrder(updated);
      setEditingAddress(false);
      Alert.alert('✅ Success', 'Shipping address updated successfully!');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update address');
    } finally {
      setSavingAddress(false);
    }
  };

  /* ─── Cancel Order ─── */
  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setCancellingOrder(true);
            try {
              const res = await api.put(`/orders/${selectedOrder._id}/cancel`);
              const updated = res.data;
              
              // 1. First close the modal to prevent UI lock
              setSelectedOrder(null);
              setEditingAddress(false);
              
              // 2. Update local list and sync from server
              setOrders(prev => prev.map(o => o._id === updated._id ? updated : o));
              fetchOrders(false);
              
              // 3. Show success message
              setTimeout(() => {
                Alert.alert('✅ Success', 'Order cancelled successfully!');
              }, 500);
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to cancel order');
            } finally {
              setCancellingOrder(false);
            }
          }
        }
      ]
    );
  };

  /* ─── Helpers ─── */
  const activeOrders    = orders.filter(o => o.status === 'Preparing' || o.status === 'On Delivery');
  const completedOrders = orders.filter(o => o.status === 'Delivered' || o.status === 'Cancelled');
  const displayOrders   = activeTab === 'Active' ? activeOrders : completedOrders;

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Preparing':   return { bg: '#EEF2FF', text: '#4F46E5' };
      case 'On Delivery': return { bg: '#FFF7ED', text: '#EA580C' };
      case 'Delivered':   return { bg: '#F0FDF4', text: '#16A34A' };
      case 'Cancelled':   return { bg: '#FEF2F2', text: '#DC2626' };
      default:            return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Preparing':   return 'time-outline';
      case 'On Delivery': return 'bicycle-outline';
      case 'Delivered':   return 'checkmark-circle-outline';
      case 'Cancelled':   return 'close-circle-outline';
      default:            return 'ellipse-outline';
    }
  };

  const getItemSummary = (orderItems) => {
    if (!orderItems?.length) return 'No items';
    const names = orderItems.map(i => i.name);
    if (names.length <= 2) return names.join(', ');
    return `${names[0]}, ${names[1]}, +${names.length - 2} more`;
  };

  /* ─── Order Detail Modal ─── */
  const OrderDetailModal = () => {
    if (!selectedOrder) return null;
    const statusStyle = getStatusStyle(selectedOrder.status);
    const subtotal    = selectedOrder.totalPrice - selectedOrder.shippingPrice;
    const canEdit     = selectedOrder.status === 'Preparing';

    return (
      <Modal
        visible={!!selectedOrder}
        animationType="slide"
        transparent
        onRequestClose={() => { setSelectedOrder(null); setEditingAddress(false); }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>

              {/* Modal Header */}
              <View style={[styles.modalHeader, { borderColor: colors.border }]}>
                <View>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Order Details</Text>
                  <Text style={[styles.modalSubtitle, { color: colors.textLight }]}>
                    #{selectedOrder._id.slice(-10).toUpperCase()}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.closeBtn, { backgroundColor: colors.surfaceSecondary }]}
                  onPress={() => { setSelectedOrder(null); setEditingAddress(false); }}
                >
                  <Ionicons name="close" size={22} color={colors.icon} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll} keyboardShouldPersistTaps="handled">

                {/* Status Badge */}
                <View style={[styles.statusFullBadge, { backgroundColor: statusStyle.bg }]}>
                  <Ionicons name={getStatusIcon(selectedOrder.status)} size={20} color={statusStyle.text} />
                  <Text style={[styles.statusFullText, { color: statusStyle.text }]}>
                    {selectedOrder.status}
                  </Text>
                  <Text style={[styles.statusDate, { color: statusStyle.text }]}>
                    {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </Text>
                </View>

                {/* Items */}
                <Text style={styles.sectionTitle}>Items Ordered</Text>
                <View style={styles.itemsCard}>
                  {selectedOrder.orderItems.map((item, idx) => (
                    <View key={idx} style={[styles.itemRow, idx > 0 && styles.itemBorder]}>
                      <Image source={{ uri: item.image }} style={styles.itemImg} />
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                        <Text style={styles.itemQty}>Qty: {item.qty}</Text>
                      </View>
                      <Text style={styles.itemPrice}>₹{(item.price * item.qty).toFixed(2)}</Text>
                    </View>
                  ))}
                </View>

                {/* Price Summary */}
                <Text style={styles.sectionTitle}>Price Summary</Text>
                <View style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal ({selectedOrder.orderItems.length} items)</Text>
                    <Text style={styles.summaryValue}>₹{subtotal.toFixed(2)}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Delivery Charges</Text>
                    <Text style={styles.summaryValue}>₹{selectedOrder.shippingPrice.toFixed(2)}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.summaryRow}>
                    <Text style={styles.totalLabel}>Total Paid</Text>
                    <Text style={styles.totalValue}>₹{selectedOrder.totalPrice.toFixed(2)}</Text>
                  </View>
                </View>

                {/* Delivery Info + Edit Address */}
                <Text style={styles.sectionTitle}>Delivery Info</Text>
                <View style={styles.infoCard}>

                  {/* Shipping Address Row */}
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconBox}>
                      <Ionicons name="location-outline" size={18} color={theme.colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.infoLabelRow}>
                        <Text style={styles.infoLabel}>Shipping Address</Text>
                        {canEdit && !editingAddress && (
                          <TouchableOpacity
                            style={styles.editAddressBtn}
                            onPress={() => { setNewAddress(selectedOrder.shippingAddress); setEditingAddress(true); }}
                          >
                            <Ionicons name="pencil-outline" size={13} color={theme.colors.primary} />
                            <Text style={styles.editAddressText}>Edit</Text>
                          </TouchableOpacity>
                        )}
                      </View>

                      {editingAddress ? (
                        <View style={styles.editAddressContainer}>
                          <TextInput
                            style={styles.addressInput}
                            value={newAddress}
                            onChangeText={setNewAddress}
                            multiline
                            numberOfLines={3}
                            placeholder="Enter new shipping address..."
                            placeholderTextColor="#BBB"
                            textAlignVertical="top"
                            autoFocus
                          />
                          <View style={styles.editBtnRow}>
                            <TouchableOpacity
                              style={styles.cancelEditBtn}
                              onPress={() => setEditingAddress(false)}
                            >
                              <Text style={styles.cancelEditText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.saveEditBtn, savingAddress && { opacity: 0.6 }]}
                              onPress={handleSaveAddress}
                              disabled={savingAddress}
                            >
                              {savingAddress ? (
                                <ActivityIndicator size="small" color="#FFF" />
                              ) : (
                                <>
                                  <Ionicons name="checkmark" size={15} color="#FFF" />
                                  <Text style={styles.saveEditText}>Save</Text>
                                </>
                              )}
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : (
                        <Text style={styles.infoValue}>{selectedOrder.shippingAddress}</Text>
                      )}

                      {/* Note shown only for Preparing status */}
                      {canEdit && (
                        <View style={styles.preparingNote}>
                          <Ionicons name="information-circle-outline" size={13} color="#4F46E5" />
                          <Text style={styles.preparingNoteText}>
                            You can change the address while order is Preparing
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Payment Method */}
                  <View style={[styles.infoRow, { marginTop: 16 }]}>
                    <View style={styles.infoIconBox}>
                      <Ionicons name="card-outline" size={18} color={theme.colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.infoLabel}>Payment Method</Text>
                      <Text style={styles.infoValue}>{selectedOrder.paymentMethod}</Text>
                    </View>
                  </View>
                </View>

                <View style={{ height: 20 }} />

                {/* Cancel Button */}
                {canEdit && (
                  <TouchableOpacity
                    style={[styles.cancelOrderBtn, cancellingOrder && { opacity: 0.7 }]}
                    onPress={handleCancelOrder}
                    disabled={cancellingOrder}
                  >
                    {cancellingOrder ? (
                      <ActivityIndicator size="small" color="#DC2626" />
                    ) : (
                      <>
                        <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
                        <Text style={styles.cancelOrderBtnText}>Cancel Order</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                <View style={{ height: 30 }} />
              </ScrollView>

              {/* Bottom Close Button */}
              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={() => { setSelectedOrder(null); setEditingAddress(false); }}
              >
                <Text style={styles.closeModalBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  /* ─── Order Card ─── */
  const renderOrderItem = ({ item }) => {
    const statusStyle = getStatusStyle(item.status);
    const firstImage  = item.orderItems?.[0]?.image;

    return (
      <TouchableOpacity
        style={[styles.orderCard, { backgroundColor: colors.card }]}
        onPress={() => { setSelectedOrder(item); setEditingAddress(false); }}
        activeOpacity={0.85}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderIdGroup}>
            <Text style={[styles.orderId, { color: colors.text }]}>#{item._id.slice(-8).toUpperCase()}</Text>
            <Text style={[styles.orderDate, { color: colors.textLight }]}>
              {new Date(item.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
              })}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Ionicons name={getStatusIcon(item.status)} size={12} color={statusStyle.text} style={{ marginRight: 4 }} />
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status}</Text>
          </View>
        </View>

        <View style={[styles.hrDivider, { backgroundColor: colors.border }]} />

        <View style={styles.orderBody}>
          {firstImage ? (
            <Image source={{ uri: firstImage }} style={[styles.itemImage, { backgroundColor: colors.surfaceSecondary }]} />
          ) : (
            <View style={[styles.itemImage, styles.imagePlaceholder, { backgroundColor: colors.surfaceSecondary }]}>
              <Ionicons name="basket-outline" size={28} color={colors.textLight} />
            </View>
          )}
          <View style={styles.itemInfo}>
            <Text style={[styles.itemText, { color: colors.text }]} numberOfLines={1}>{getItemSummary(item.orderItems)}</Text>
            <Text style={[styles.itemCount, { color: colors.textLight }]}>{item.orderItems.length} item(s)</Text>
            <Text style={[styles.priceText, { color: colors.text }]}>₹{Number(item.totalPrice).toFixed(2)}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </View>

        <View style={styles.orderFooter}>
          <View style={[styles.methodBadge, { backgroundColor: colors.surfaceSecondary }]}>
            <Ionicons name="card-outline" size={13} color={colors.textLight} />
            <Text style={[styles.methodText, { color: colors.textLight }]}>{item.paymentMethod}</Text>
          </View>
          {item.status === 'Preparing' && (
            <View style={[styles.editHintBadge, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="pencil-outline" size={11} color={colors.primary} />
              <Text style={[styles.editHintText, { color: colors.primary }]}>Address editable</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Orders</Text>
        <TouchableOpacity onPress={onRefresh} style={[styles.refreshBtn, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="refresh-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.tabContainer, { backgroundColor: colors.headerBg }]}>
        {[
          { key: 'Active', count: activeOrders.length },
          { key: 'Completed', count: completedOrders.length }
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, { backgroundColor: colors.surfaceSecondary }, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, { color: colors.textLight }, activeTab === tab.key && styles.activeTabText]}>
              {tab.key} ({tab.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textLight }]}>Loading your orders...</Text>
        </View>
      ) : (
        <FlatList
          data={displayOrders}
          renderItem={renderOrderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={80} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No {activeTab.toLowerCase()} orders</Text>
              <Text style={[styles.emptySubText, { color: colors.textLight }]}>
                {activeTab === 'Active'
                  ? 'Place an order to see it here'
                  : 'Your completed orders will appear here'}
              </Text>
            </View>
          }
        />
      )}

      <OrderDetailModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:        { flex: 1 },
  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1 },
  headerTitle:      { fontSize: 22, fontWeight: '800' },
  refreshBtn:       { padding: 6, borderRadius: 10 },
  tabContainer:     { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 15, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, gap: 10 },
  tab:              { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 15, backgroundColor: '#F5F5F5' },
  activeTab:        { backgroundColor: theme.colors.primary },
  tabText:          { fontSize: 13, fontWeight: '700', color: '#888' },
  activeTabText:    { color: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText:      { color: '#888', fontSize: 14 },
  listContent:      { padding: 20, paddingBottom: 110 },

  orderCard:        { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  orderHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  orderIdGroup:     { flex: 1 },
  orderId:          { fontSize: 15, fontWeight: '800', color: '#1A1A1A', fontFamily: 'monospace' },
  orderDate:        { fontSize: 12, color: '#AAA', marginTop: 2 },
  statusBadge:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  statusText:       { fontSize: 11, fontWeight: '700' },
  hrDivider:        { height: 1, backgroundColor: '#F0F0F0', marginBottom: 12 },
  orderBody:        { flexDirection: 'row', alignItems: 'center' },
  itemImage:        { width: 65, height: 65, borderRadius: 14, backgroundColor: '#F8F9FA', resizeMode: 'contain' },
  imagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  itemInfo:         { flex: 1, marginLeft: 14 },
  itemText:         { fontSize: 14, color: '#333', fontWeight: '600' },
  itemCount:        { fontSize: 12, color: '#AAA', marginTop: 2 },
  priceText:        { fontSize: 17, fontWeight: '800', color: '#1A1A1A', marginTop: 5 },
  orderFooter:      { flexDirection: 'row', marginTop: 12, justifyContent: 'space-between', alignItems: 'center' },
  methodBadge:      { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F5F5F5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  methodText:       { fontSize: 11, color: '#888', fontWeight: '600' },
  editHintBadge:    { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  editHintText:     { fontSize: 11, color: '#4F46E5', fontWeight: '700' },
  emptyContainer:   { alignItems: 'center', marginTop: 80, gap: 10 },
  emptyText:        { fontSize: 18, color: '#555', fontWeight: '700', marginTop: 10 },
  emptySubText:     { fontSize: 13, color: '#AAA', textAlign: 'center', paddingHorizontal: 40 },

  /* Modal */
  modalOverlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalContainer:     { borderTopLeftRadius: 30, borderTopRightRadius: 30, maxHeight: height * 0.93 },
  modalHeader:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 24, paddingTop: 22, paddingBottom: 16, borderBottomWidth: 1 },
  modalTitle:         { fontSize: 20, fontWeight: '800' },
  modalSubtitle:      { fontSize: 12, fontFamily: 'monospace', marginTop: 3 },
  closeBtn:           { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  modalScroll:        { paddingHorizontal: 22 },

  statusFullBadge:    { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, marginTop: 18, gap: 8 },
  statusFullText:     { fontSize: 15, fontWeight: '800', flex: 1 },
  statusDate:         { fontSize: 12, opacity: 0.7 },

  sectionTitle:       { fontSize: 13, fontWeight: '800', color: '#333', marginTop: 22, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },

  itemsCard:          { backgroundColor: '#F9FAFB', borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: '#F0F0F0' },
  itemRow:            { flexDirection: 'row', alignItems: 'center', padding: 14 },
  itemBorder:         { borderTopWidth: 1, borderColor: '#F0F0F0' },
  itemImg:            { width: 55, height: 55, borderRadius: 12, backgroundColor: '#FFF', resizeMode: 'contain' },
  itemDetails:        { flex: 1, marginHorizontal: 12 },
  itemName:           { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  itemQty:            { fontSize: 12, color: '#888', marginTop: 3 },
  itemPrice:          { fontSize: 15, fontWeight: '800', color: '#1A1A1A' },

  summaryCard:        { backgroundColor: '#F9FAFB', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#F0F0F0' },
  summaryRow:         { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel:       { fontSize: 14, color: '#666' },
  summaryValue:       { fontSize: 14, fontWeight: '600', color: '#333' },
  divider:            { height: 1, backgroundColor: '#EFEFEF', marginBottom: 10 },
  totalLabel:         { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
  totalValue:         { fontSize: 18, fontWeight: '900', color: theme.colors.primary },

  infoCard:           { backgroundColor: '#F9FAFB', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#F0F0F0' },
  infoRow:            { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  infoIconBox:        { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  infoLabelRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  infoLabel:          { fontSize: 11, color: '#AAA', fontWeight: '600', textTransform: 'uppercase' },
  infoValue:          { fontSize: 14, color: '#333', fontWeight: '600', lineHeight: 20 },

  editAddressBtn:     { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  editAddressText:    { fontSize: 12, color: '#4F46E5', fontWeight: '700' },

  editAddressContainer: { marginTop: 8 },
  addressInput:       { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#4F46E5', borderRadius: 14, padding: 14, fontSize: 14, color: '#1A1A1A', minHeight: 80, lineHeight: 20 },
  editBtnRow:         { flexDirection: 'row', gap: 10, marginTop: 10 },
  cancelEditBtn:      { flex: 1, backgroundColor: '#F5F5F5', borderRadius: 12, paddingVertical: 11, alignItems: 'center' },
  cancelEditText:     { fontSize: 14, fontWeight: '700', color: '#666' },
  saveEditBtn:        { flex: 2, backgroundColor: theme.colors.primary, borderRadius: 12, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  saveEditText:       { fontSize: 14, fontWeight: '800', color: '#FFF' },

  preparingNote:      { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8, backgroundColor: '#EEF2FF', padding: 8, borderRadius: 10 },
  preparingNoteText:  { fontSize: 11, color: '#4F46E5', fontWeight: '600', flex: 1 },

  closeModalBtn:      { marginHorizontal: 22, marginTop: 10, marginBottom: 24, backgroundColor: theme.colors.primary, borderRadius: 18, height: 54, justifyContent: 'center', alignItems: 'center' },
  closeModalBtnText:  { color: '#FFF', fontWeight: '800', fontSize: 16 },

  cancelOrderBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16, borderWidth: 1.5, borderColor: '#FEE2E2', backgroundColor: '#FEF2F2' },
  cancelOrderBtnText: { fontSize: 15, fontWeight: '700', color: '#DC2626' },
});

export default OrdersScreen;
