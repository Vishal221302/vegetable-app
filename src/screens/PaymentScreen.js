import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { theme } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../store/slices/cartSlice';
import api from '../utils/api';
import { ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../context/ThemeContext';

const PaymentScreen = ({ navigation, route }) => {
  const { shippingAddress } = route.params || {};
  const [selectedMethod, setSelectedMethod] = useState('cod');
  const { items, totalAmount } = useSelector(state => state.cart);
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { colors, isDark } = useTheme();

  const [paymentMethods, setPaymentMethods] = useState([
    { id: 'cod', name: 'Cash on Delivery', icon: 'cash-outline' },
  ]);
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  
  // Razorpay WebView state
  const [showWebView, setShowWebView] = useState(false);
  const [checkoutHtml, setCheckoutHtml] = useState('');
  const [currentOrderId, setCurrentOrderId] = useState('');

  useEffect(() => {
    const fetchPaymentConfig = async () => {
      try {
        const { data } = await api.get('/admin/config/razorpay');
        if (data.razorpayEnabled) {
          setPaymentMethods([
            { id: 'cod', name: 'Cash on Delivery', icon: 'cash-outline' },
            { id: 'upi', name: 'UPI (Razorpay)', icon: 'phone-portrait-outline' },
            { id: 'card', name: 'Card (Razorpay)', icon: 'card-outline' },
          ]);
          setRazorpayKeyId(data.razorpayKeyId);
        }
      } catch (err) {
        console.error('Failed to fetch payment config:', err);
      }
    };
    fetchPaymentConfig();
  }, []);

  const handlePlaceOrder = async () => {
    if (!shippingAddress) {
      alert('Please select a shipping address first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderData = {
        orderItems: items.map(item => ({
          name: item.name,
          qty: item.quantity,
          image: item.image,
          price: item.price,
          product: item.id
        })),
        shippingAddress: shippingAddress,
        paymentMethod: selectedMethod === 'cod' ? 'COD' : selectedMethod.toUpperCase(),
        totalPrice: totalAmount + 40,
        shippingPrice: 40,
      };

      const response = await api.post('/orders', orderData);

      if (response.status === 201) {
        const createdOrder = response.data;
        
        if (selectedMethod !== 'cod' && createdOrder.razorpayOrder) {
          // Razorpay flow
          setCurrentOrderId(createdOrder._id);
          generateRazorpayHtml(createdOrder.razorpayOrder);
          setShowWebView(true);
        } else {
          // Cash on delivery flow
          dispatch(clearCart());
          navigation.navigate('OrderSuccess');
        }
      }
    } catch (err) {
      console.error('Order Error:', err);
      setError(err.response?.data?.message || 'Something went wrong');
      alert(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const generateRazorpayHtml = (razorpayOrder) => {
    const userName = user?.name || 'Customer';
    const userEmail = user?.email || 'customer@example.com';
    const userPhone = user?.phone || '9999999999';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              background-color: ${isDark ? '#0D0F14' : '#F5F6FA'};
              color: ${isDark ? '#EAEDF5' : '#1C1C28'};
            }
            .loading {
              text-align: center;
            }
            .spinner {
              border: 4px solid rgba(0, 0, 0, 0.1);
              width: 36px;
              height: 36px;
              border-radius: 50%;
              border-left-color: #01B763;
              animation: spin 1s linear infinite;
              margin: 0 auto 15px;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
          <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        </head>
        <body>
          <div class="loading">
            <div class="spinner"></div>
            <p>Initializing Secure Payment...</p>
          </div>
          <script>
            var options = {
              "key": "${razorpayKeyId}",
              "amount": "${razorpayOrder.amount}",
              "currency": "${razorpayOrder.currency}",
              "name": "Organic Vegetables Shop",
              "description": "Payment for Order",
              "order_id": "${razorpayOrder.id}",
              "handler": function (response){
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  status: 'success',
                  payment_id: response.razorpay_payment_id,
                  order_id: response.razorpay_order_id,
                  signature: response.razorpay_signature
                }));
              },
              "prefill": {
                "name": "${userName}",
                "email": "${userEmail}",
                "contact": "${userPhone}"
              },
              "theme": {
                "color": "#01B763"
              },
              "modal": {
                "ondismiss": function(){
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    status: 'cancelled'
                  }));
                }
              }
            };
            var rzp1 = new Razorpay(options);
            rzp1.on('payment.failed', function (response){
              window.ReactNativeWebView.postMessage(JSON.stringify({
                status: 'failed',
                error_code: response.error.code,
                error_description: response.error.description
              }));
            });
            window.onload = function() {
              rzp1.open();
            }
          </script>
        </body>
      </html>
    `;
    setCheckoutHtml(html);
  };

  const handleWebViewMessage = async (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    setShowWebView(false);

    if (data.status === 'success') {
      setLoading(true);
      try {
        await api.put(`/orders/${currentOrderId}/pay`, {
          id: data.payment_id,
          status: 'SUCCESS',
          email_address: user?.email || 'paid@razorpay.com'
        });
        dispatch(clearCart());
        navigation.navigate('OrderSuccess');
      } catch (err) {
        alert('Payment verification failed. Please contact support.');
        navigation.navigate('OrdersTab');
      } finally {
        setLoading(false);
      }
    } else if (data.status === 'cancelled') {
      alert('Payment was cancelled.');
      navigation.navigate('OrdersTab');
    } else {
      alert(data.error_description || 'Payment failed.');
      navigation.navigate('OrdersTab');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Summary</Text>
        
        <View style={[styles.summaryContainer, { backgroundColor: colors.card }]}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textLight }]}>Subtotal</Text>
            <Text style={[styles.value, { color: colors.text }]}>₹{totalAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textLight }]}>Shipping Fee</Text>
            <Text style={[styles.value, { color: colors.text }]}>₹40.00</Text>
          </View>
          <View style={[styles.row, styles.totalRow, { borderColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
            <Text style={styles.totalValue}>₹{(totalAmount + 40).toFixed(2)}</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>

        {paymentMethods.map((method) => {
          const isSelected = selectedMethod === method.id;
          return (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                isSelected && [styles.selectedCard, { borderColor: colors.primary, backgroundColor: colors.primaryLight }]
              ]}
              onPress={() => setSelectedMethod(method.id)}
            >
              <View style={styles.methodInfo}>
                <Ionicons 
                  name={method.icon} 
                  size={24} 
                  color={isSelected ? colors.primary : colors.textLight} 
                />
                <Text style={[styles.methodName, { color: isSelected ? colors.primary : colors.text }]}>
                  {method.name}
                </Text>
              </View>
              <Ionicons 
                name={isSelected ? 'checkmark-circle' : 'ellipse-outline'} 
                size={20} 
                color={isSelected ? colors.primary : colors.border} 
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <Button 
          title={loading ? "Placing Order..." : (selectedMethod === 'cod' ? "Place COD Order" : "Proceed to Pay")} 
          onPress={handlePlaceOrder}
          disabled={loading}
        />
      </View>

      {/* Razorpay Secure Gateway Modal */}
      <Modal
        visible={showWebView}
        animationType="slide"
        onRequestClose={() => {
          setShowWebView(false);
          alert('Payment was cancelled.');
          navigation.navigate('OrdersTab');
        }}
      >
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <TouchableOpacity 
              onPress={() => {
                setShowWebView(false);
                alert('Payment was cancelled.');
                navigation.navigate('OrdersTab');
              }}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Secure Checkout</Text>
            <View style={{ width: 28 }} />
          </View>
          <WebView
            source={{ html: checkoutHtml }}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={['*']}
            style={{ flex: 1 }}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.m,
  },
  summaryContainer: {
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.xxl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.s,
  },
  label: {
    ...theme.typography.body,
  },
  value: {
    ...theme.typography.body,
  },
  totalRow: {
    borderTopWidth: 1,
    paddingTop: theme.spacing.m,
    marginTop: theme.spacing.s,
    marginBottom: 0,
  },
  totalLabel: {
    ...theme.typography.h3,
  },
  totalValue: {
    ...theme.typography.h2,
  },
  methodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    marginBottom: theme.spacing.m,
  },
  selectedCard: {
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodName: {
    ...theme.typography.body,
    marginLeft: theme.spacing.m,
  },
  footer: {
    padding: theme.spacing.xl,
    borderTopWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    borderBottomWidth: 1,
    paddingTop: theme.spacing.xxl,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  }
});

export default PaymentScreen;
