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

const PaymentScreen = ({ navigation, route }) => {
  const { shippingAddress } = route.params || {};
  const [selectedMethod, setSelectedMethod] = useState('cod');
  const { items, totalAmount } = useSelector(state => state.cart);
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
            background-color: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            padding: 20px;
          }
          .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border-left-color: #10B981;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          h3 { color: #1A1A1A; margin: 0 0 10px 0; font-weight: 600; }
          p { color: #666666; font-size: 14px; margin: 0; text-align: center; }
        </style>
      </head>
      <body>
        <div class="spinner"></div>
        <h3>Processing Payment</h3>
        <p>Please complete your payment on the Razorpay interface.</p>
        
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <script>
          const options = {
            "key": "${razorpayOrder.keyId}",
            "amount": "${razorpayOrder.amount}",
            "currency": "INR",
            "name": "GreenFresh",
            "description": "Organic Vegetables Order Payment",
            "order_id": "${razorpayOrder.id}",
            "handler": function (response){
              window.ReactNativeWebView.postMessage(JSON.stringify({
                status: 'success',
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              }));
            },
            "prefill": {
              "name": "${userName}",
              "email": "${userEmail}",
              "contact": "${userPhone}"
            },
            "theme": {
              "color": "#10B981"
            },
            "modal": {
              "ondismiss": function() {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  status: 'cancel'
                }));
              }
            }
          };
          const rzp1 = new Razorpay(options);
          rzp1.open();
        </script>
      </body>
      </html>
    `;
    setCheckoutHtml(html);
  };

  const handleNavigationStateChange = async (event) => {
    // We catch messages using onMessage, but we also can check URL or other triggers if needed
  };

  const handleWebViewMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      setShowWebView(false);

      if (data.status === 'success') {
        setLoading(true);
        try {
          const response = await api.post(`/orders/${currentOrderId}/verify`, {
            razorpayPaymentId: data.razorpayPaymentId,
            razorpaySignature: data.razorpaySignature
          });

          if (response.data.success) {
            dispatch(clearCart());
            navigation.navigate('OrderSuccess');
          } else {
            alert('Payment verification failed. Please contact support.');
          }
        } catch (err) {
          console.error('Verify error:', err);
          alert('Payment verification failed. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
        alert('Payment cancelled or failed');
      }
    } catch (err) {
      console.error('Error parsing WebView message:', err);
    }
  };

  const renderPaymentMethod = (item) => (
    <TouchableOpacity 
      key={item.id}
      style={[
        styles.methodCard,
        selectedMethod === item.id && styles.selectedCard
      ]}
      onPress={() => setSelectedMethod(item.id)}
    >
      <View style={styles.methodInfo}>
        <Ionicons 
          name={item.icon} 
          size={24} 
          color={selectedMethod === item.id ? theme.colors.primary : theme.colors.textLight} 
        />
        <Text style={[
          styles.methodName,
          selectedMethod === item.id && { color: theme.colors.primary }
        ]}>{item.name}</Text>
      </View>
      <Ionicons 
        name={selectedMethod === item.id ? "radio-button-on" : "radio-button-off"} 
        size={24} 
        color={selectedMethod === item.id ? theme.colors.primary : theme.colors.border} 
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Items Total</Text>
            <Text style={styles.value}>₹{totalAmount}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Delivery</Text>
            <Text style={styles.value}>₹40</Text>
          </View>
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalValue}>₹{totalAmount + 40}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Payment Method</Text>
        {paymentMethods.map(renderPaymentMethod)}

      </ScrollView>

      <View style={styles.footer}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : (
          <Button 
            title={selectedMethod === 'cod' ? "Place Order (COD)" : "Pay Now with Razorpay"} 
            onPress={handlePlaceOrder} 
          />
        )}
      </View>

      {/* Razorpay Checkout WebView Modal */}
      <Modal
        visible={showWebView}
        animationType="slide"
        onRequestClose={() => {
          setShowWebView(false);
          alert('Payment cancelled');
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => {
                setShowWebView(false);
                alert('Payment cancelled');
              }}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={28} color="#1A1A1A" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Secure Checkout</Text>
            <View style={{ width: 28 }} /> {/* Spacer */}
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
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.m,
  },
  summaryContainer: {
    backgroundColor: theme.colors.surface,
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
    color: theme.colors.textLight,
  },
  value: {
    ...theme.typography.body,
  },
  totalRow: {
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    paddingTop: theme.spacing.m,
    marginTop: theme.spacing.s,
    marginBottom: 0,
  },
  totalLabel: {
    ...theme.typography.h3,
  },
  totalValue: {
    ...theme.typography.h2,
    color: theme.colors.primary,
  },
  methodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.m,
  },
  selectedCard: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
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
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: '#ffffff',
    paddingTop: theme.spacing.xxl, // Account for notch
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  }
});

export default PaymentScreen;
