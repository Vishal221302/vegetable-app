import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity, 
  ImageBackground,
  Dimensions,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPasswordAction } from '../../store/slices/authSlice';
import { theme } from '../../utils/theme';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const handleForgotPassword = () => {
    if (email) {
      dispatch(forgotPasswordAction({ email }))
        .unwrap()
        .then((res) => {
          Alert.alert('Success', 'Password reset instructions have been sent to your email.');
          navigation.navigate('Login');
        })
        .catch((err) => {
          Alert.alert('Error', err);
        });
    } else {
      Alert.alert('Error', 'Please enter your email or phone number');
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
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={24} color={theme.colors.surface} />
                </TouchableOpacity>
                <View style={styles.logoContainer}>
                  <Ionicons name="lock-closed" size={40} color={theme.colors.primary} />
                </View>
                <Text style={styles.title}>Forgot Password</Text>
                <Text style={styles.subtitle}>Enter your email or phone number to reset your password</Text>
              </View>

              <View style={styles.formCard}>
                <Input 
                  label="Email or Phone"
                  icon="mail-outline"
                  placeholder="Enter email or phone"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />

                <Button 
                  title={loading ? "Sending..." : "Reset Password"} 
                  onPress={handleForgotPassword} 
                  style={styles.resetButton}
                  disabled={loading}
                />

                <View style={styles.footer}>
                  <Text style={styles.footerText}>Remember your password? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.loginText}>Login</Text>
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
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: theme.spacing.s,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surface,
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
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.surface,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.surface,
    textAlign: 'center',
    opacity: 0.9,
    paddingHorizontal: theme.spacing.l,
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
  resetButton: {
    borderRadius: 15,
    height: 55,
    marginTop: theme.spacing.m,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
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

export default ForgotPasswordScreen;
