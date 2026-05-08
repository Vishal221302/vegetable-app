import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../utils/theme';

const Button = ({ title, onPress, type = 'primary', loading = false, style, textStyle, disabled }) => {
  const isPrimary = type === 'primary';
  
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        isPrimary ? styles.primary : styles.outline,
        disabled && styles.disabled,
        style
      ]} 
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? theme.colors.surface : theme.colors.primary} />
      ) : (
        <Text style={[
          styles.text, 
          isPrimary ? styles.textPrimary : styles.textOutline,
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
    backgroundColor: theme.colors.primary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    ...theme.typography.h3,
  },
  textPrimary: {
    color: theme.colors.surface,
  },
  textOutline: {
    color: theme.colors.primary,
  }
});

export default Button;
