import React from 'react';
import { TextInput } from 'react-native-paper';
import { StyleSheet } from 'react-native';

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  left?: React.ComponentProps<typeof TextInput>['left'];
}

export default function FormInput({
  label,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  left,
}: FormInputProps) {
  return (
    <TextInput
      label={label}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      mode="outlined"
      style={styles.input}
      error={!!error}
      left={left}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
});
