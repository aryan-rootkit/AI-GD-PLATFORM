import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({ title, onPress, disabled, loading, style }: Props) {
  const busy = disabled || loading;
  return (
    <Pressable
      style={({ pressed }) => [
        styles.btn,
        busy && styles.disabled,
        pressed && !busy && styles.pressed,
        style,
      ]}
      onPress={onPress}
      disabled={busy}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: '#7c3aed',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  pressed: { opacity: 0.9 },
  disabled: { opacity: 0.5 },
  text: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
