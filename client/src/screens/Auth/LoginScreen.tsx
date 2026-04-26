import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenScroll } from '../../components/ScreenScroll';
import { useAuth } from '../../context/AuthContext';
import type { AuthStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'response' in e
        ? String((e as { response?: { data?: { error?: string } } }).response?.data?.error)
        : 'Login failed';
      Alert.alert('Error', msg || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenScroll>
      <Text style={styles.title}>AI Group Discussion</Text>
      <Text style={styles.sub}>Sign in to continue</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="you@example.com"
        placeholderTextColor="#64748b"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="••••••••"
        placeholderTextColor="#64748b"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <PrimaryButton title="Sign in" onPress={onSubmit} loading={loading} />

      <Pressable onPress={() => navigation.navigate('Signup')} style={styles.linkWrap}>
        <Text style={styles.link}>No account? Create one</Text>
      </Pressable>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '700', color: '#f8fafc' },
  sub: { fontSize: 15, color: '#94a3b8', marginBottom: 8 },
  label: { color: '#cbd5e1', fontSize: 14, fontWeight: '500' },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 14,
    color: '#f1f5f9',
    fontSize: 16,
  },
  linkWrap: { alignItems: 'center', marginTop: 8 },
  link: { color: '#a78bfa', fontSize: 15 },
});
