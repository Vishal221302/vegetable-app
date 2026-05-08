import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import { theme } from '../../utils/theme';
import Input from '../../components/Input';
import Button from '../../components/Button';

const OtpScreen = ({ route }) => {
  const { phone } = route.params || { phone: '' };
  const [otp, setOtp] = useState('');
  const dispatch = useDispatch();

  const handleVerify = () => {
    // Dummy verification
    if (otp) {
      dispatch(login({ phone }));
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Verification</Text>
          <Text style={styles.subtitle}>Enter the 4-digit code sent to {phone}</Text>
        </View>

        <Input 
          label="OTP"
          icon="keypad-outline"
          placeholder="Enter OTP"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={4}
          style={{ textAlign: 'center', letterSpacing: 10, fontSize: 24 }}
        />

        <Button 
          title="Verify & Proceed" 
          onPress={handleVerify} 
          style={styles.verifyButton}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Didn't receive code? </Text>
          <TouchableOpacity>
            <Text style={styles.resendText}>Resend</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'center',
  },
  header: {
    marginBottom: theme.spacing.xxl,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    marginBottom: theme.spacing.s,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textLight,
  },
  verifyButton: {
    marginTop: theme.spacing.l,
    marginBottom: theme.spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    ...theme.typography.body,
    color: theme.colors.textLight,
  },
  resendText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: 'bold',
  }
});

export default OtpScreen;
