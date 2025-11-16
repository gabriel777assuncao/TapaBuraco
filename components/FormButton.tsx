import React from 'react';
import { Button } from 'react-native-paper';
import { StyleSheet } from 'react-native';

interface FormButtonProps {
  title: string;
  onPress: () => void;
  mode?: 'text' | 'outlined' | 'contained';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
}

export default function FormButton({
  title,
  onPress,
  mode = 'contained',
  loading = false,
  disabled = false,
  icon,
}: FormButtonProps) {
  return (
    <Button
      mode={mode}
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      icon={icon}
      style={styles.button}
      labelStyle={styles.label}
    >
      {title}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    marginVertical: 8,
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    paddingVertical: 6,
  },
});
