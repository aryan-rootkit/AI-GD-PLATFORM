import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenScroll } from '../../components/ScreenScroll';
import { useAuth } from '../../context/AuthContext';
import type { AuthStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

export function SignupScreen({ navigation }: Props) {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    try {
      await signup(name.trim(), email.trim(), password);
      Alert.alert('Account created', 'You can sign in now.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? String((e as { response?: { data?: { error?: string } } }).response?.data?.error)
          : 'Signup failed';
      Alert.alert('Error', msg || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenScroll>
      <Text style={styles.title}>Create your account</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Display name"
        placeholderTextColor="#64748b"
        value={name}
        onChangeText={setName}
      />

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

      <Text style={styles.label}>Password (min 6)</Text>
      <TextInput
        style={styles.input}
        placeholder="••••••••"
        placeholderTextColor="#64748b"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <PrimaryButton title="Sign up" onPress={onSubmit} loading={loading} />
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', color: '#f8fafc', marginBottom: 8 },
  label: { color: '#cbd5e1', fontSize: 14, fontWeight: '500' },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 14,
    color: '#f1f5f9',
    fontSize: 16,
  },
});
