import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../utils/theme';
import { useTheme } from '../context/ThemeContext';

const Button = ({ title, onPress, type = 'primary', loading = false, style, textStyle, disabled }) => {
  const isPrimary = type === 'primary';
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        isPrimary ? [styles.primary, { backgroundColor: colors.primary }] : [styles.outline, { borderColor: colors.primary }],
        disabled && styles.disabled,
        style
      ]} 
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#FFFFFF' : colors.primary} />
      ) : (
        <Text style={[
          styles.text, 
          isPrimary ? styles.textPrimary : [styles.textOutline, { color: colors.primary }],
          textStyle
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  primary: {
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    ...theme.typography.h3,
  },
  textPrimary: {
    color: '#FFFFFF',
  },
  textOutline: {
  }
});

export default Button;
