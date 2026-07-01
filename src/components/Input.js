import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const Input = ({ label, icon, error, ...props }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
      <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }, error && styles.inputError]}>
        {icon && (
          <Ionicons name={icon} size={20} color={colors.textLight} style={styles.icon} />
        )}
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholderTextColor={colors.textLight}
          {...props}
        />
      </View>
      {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
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
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: theme.borderRadius.m,
    paddingHorizontal: theme.spacing.m,
    height: 50,
  },
  inputError: {
    borderColor: '#FF3B30',
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
    marginTop: theme.spacing.xs,
  }
});

export default Input;
