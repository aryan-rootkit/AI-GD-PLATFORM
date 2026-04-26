import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenScroll } from '../../components/ScreenScroll';
import { apiCreateSession } from '../../api/session';
import type { AppStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<AppStackParamList, 'CreateSession'>;

export function CreateSessionScreen({ navigation }: Props) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Validation', 'Please enter a title');
      return;
    }
    setLoading(true);
    try {
      const session = await apiCreateSession(title.trim());
      navigation.replace('Room', {
        sessionId: session.id,
        title: session.title,
        hostId: session.hostId,
      });
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? String((e as { response?: { data?: { error?: string } } }).response?.data?.error)
          : 'Could not create session';
      Alert.alert('Error', msg || 'Could not create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenScroll>
      <Text style={styles.label}>Topic / title</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Climate policy GD"
        placeholderTextColor="#64748b"
        value={title}
        onChangeText={setTitle}
      />
      <PrimaryButton title="Create & enter room" onPress={onSubmit} loading={loading} />
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
