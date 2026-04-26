import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenScroll } from '../../components/ScreenScroll';
import { apiJoinSession } from '../../api/session';
import type { AppStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<AppStackParamList, 'JoinSession'>;

export function JoinSessionScreen({ navigation }: Props) {
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const id = sessionId.trim();
    if (!id) {
      Alert.alert('Validation', 'Enter a session ID');
      return;
    }
    setLoading(true);
    try {
      const session = await apiJoinSession(id);
      navigation.replace('Room', {
        sessionId: session.id,
        title: session.title,
        hostId: session.hostId,
      });
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? String((e as { response?: { data?: { error?: string } } }).response?.data?.error)
          : 'Could not join session';
      Alert.alert('Error', msg || 'Could not join session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenScroll>
      <Text style={styles.label}>Session ID</Text>
      <TextInput
        style={styles.input}
        placeholder="Paste UUID from host"
        placeholderTextColor="#64748b"
        autoCapitalize="none"
        value={sessionId}
        onChangeText={setSessionId}
      />
      <PrimaryButton title="Join room" onPress={onSubmit} loading={loading} />
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  label: { color: '#cbd5e1', fontSize: 14, fontWeight: '500' },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 14,
    color: '#f1f5f9',
    fontSize: 16,
  },
});
