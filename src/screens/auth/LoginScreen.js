import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity, 
  ImageBackground,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../store/slices/authSlice';
import { theme } from '../../utils/theme';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const handleLogin = () => {
    if (phone && password) {
      dispatch(loginUser({ email: phone, password })); // we use email/phone field
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1000&auto=format&fit=crop' }}
        style={styles.background}
        blurRadius={2}
      >
        <View style={styles.overlay} />
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <View style={styles.content}>
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <Ionicons name="leaf" size={40} color={theme.colors.surface} />
                </View>
                <Text style={styles.title}>GreenFresh</Text>
                <Text style={styles.subtitle}>Organic Vegetables Delivered to Your Door</Text>
              </View>

              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Welcome Back</Text>
                <Input 
                  label="Email or Phone"
                  icon="person-outline"
                  placeholder="Enter email or phone"
                  value={phone}
                  onChangeText={setPhone}
                />

                <Input 
                  label="Password"
                  icon="lock-closed-outline"
                  placeholder="Enter password"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />

                <TouchableOpacity 
                  style={styles.forgotPassword}
                  onPress={() => navigation.navigate('ForgotPassword')}
                >
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>

                <Button 
                  title={loading ? "Logging in..." : "Login"} 
                  onPress={handleLogin} 
                  style={styles.loginButton}
                  disabled={loading}
                />

                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>OR LOGIN WITH</Text>
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
                  <Text style={styles.footerText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                    <Text style={styles.signupText}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
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
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
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
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.l,
  },
  forgotText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  loginButton: {
    borderRadius: 15,
    height: 55,
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
  signupText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
