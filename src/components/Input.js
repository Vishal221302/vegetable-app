import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';

const Input = ({ label, icon, error, ...props }) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {icon && (
          <Ionicons name={icon} size={20} color={theme.colors.textLight} style={styles.icon} />
        )}
        <TextInput
          style={styles.input}
          placeholderTextColor={theme.colors.textLight}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.m,
    width: '100%',
  },
  label: {
    ...theme.typography.caption,
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.m,
    paddingHorizontal: theme.spacing.m,
    backgroundColor: theme.colors.surface,
    height: 50,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  icon: {
    marginRight: theme.spacing.s,
  },
  input: {
    flex: 1,
    ...theme.typography.body,
    height: '100%',
  },
  errorText: {
    ...theme.typography.small,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  }
});

export default Input;
