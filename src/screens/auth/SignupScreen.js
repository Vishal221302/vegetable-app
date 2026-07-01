import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity, 
  ImageBackground,
  Dimensions,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../utils/theme';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../store/slices/authSlice';
import { syncCartWithServer } from '../../store/slices/cartSlice';

const { width, height } = Dimensions.get('window');

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const { loading, isAuthenticated } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);

  // After signup success, sync guest cart with server and go back
  useEffect(() => {
    if (isAuthenticated) {
      if (cartItems.length > 0) {
        const itemsToSync = cartItems.map(i => ({
          productId: i.id || i.productId,
          quantity: i.quantity
        }));
        dispatch(syncCartWithServer(itemsToSync));
      }

      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.replace('Main');
      }
    }
  }, [isAuthenticated]);

  const handleSignup = () => {
    if (name && (phone || email) && password) {
      dispatch(registerUser({ name, email: email || phone, phone, password }));
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=1000&auto=format&fit=crop' }}
        style={styles.background}
        blurRadius={2}
      >
        <View style={styles.overlay} />
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardView}
          >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.content}>
                <View style={styles.header}>
                  <View style={styles.logoContainer}>
                    <Ionicons name="leaf" size={40} color={theme.colors.surface} />
                  </View>
                  <Text style={styles.title}>Create Account</Text>
                  <Text style={styles.subtitle}>Join our community of fresh food lovers</Text>
                </View>

                <View style={styles.formCard}>
                  <Input 
                    label="Full Name"
                    icon="person-outline"
                    placeholder="Enter your full name"
                    value={name}
                    onChangeText={setName}
                  />

                  <Input 
                    label="Phone Number"
                    icon="call-outline"
                    placeholder="Enter phone number"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />

                  <Input 
                    label="Email"
                    icon="mail-outline"
                    placeholder="Enter email address"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <Input 
                    label="Password"
                    icon="lock-closed-outline"
                    placeholder="Create a strong password"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />

                  <Button 
                    title={loading ? "Signing up..." : "Sign Up"} 
                    onPress={handleSignup} 
                    style={styles.signupButton}
                    disabled={loading}
                  />

                  <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>OR SIGN UP WITH</Text>
                    <View style={styles.divider} />
                  </View>

                  <View style={styles.socialContainer}>
                    <TouchableOpacity style={[styles.socialButton, styles.googleButton]}>
                      <Ionicons name="logo-google" size={24} color="#DB4437" />
                      <Text style={styles.socialButtonText}>Google</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={[styles.socialButton, styles.facebookButton]}>
                      <Ionicons name="logo-facebook" size={24} color="#4267B2" />
                      <Text style={styles.socialButtonText}>Facebook</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                      <Text style={styles.loginText}>Login</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    width: width,
    height: height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.surface,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.surface,
    textAlign: 'center',
    opacity: 0.9,
  },
  formCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 30,
    padding: theme.spacing.xl,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  signupButton: {
    borderRadius: 15,
    height: 55,
    marginTop: theme.spacing.m,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    marginHorizontal: theme.spacing.m,
    color: theme.colors.textLight,
    fontSize: 12,
    fontWeight: '600',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  socialButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.m,
  },
  footerText: {
    color: theme.colors.textLight,
    fontSize: 14,
  },
  loginText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SignupScreen;
