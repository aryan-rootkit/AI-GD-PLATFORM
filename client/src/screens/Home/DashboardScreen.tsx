import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenScroll } from '../../components/ScreenScroll';
import { useAuth } from '../../context/AuthContext';
import type { AppStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<AppStackParamList, 'Dashboard'>;

export function DashboardScreen({ navigation }: Props) {
  const { user, logout } = useAuth();

  return (
    <ScreenScroll>
      <Text style={styles.greeting}>Hello{user?.name ? `, ${user.name}` : ''}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <PrimaryButton title="Create session" onPress={() => navigation.navigate('CreateSession')} />

      <Pressable
        style={styles.secondary}
        onPress={() => navigation.navigate('JoinSession')}
      >
        <Text style={styles.secondaryText}>Join with session ID</Text>
      </Pressable>

      <View style={styles.spacer} />

      <Pressable onPress={() => logout()}>
        <Text style={styles.logout}>Sign out</Text>
      </Pressable>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  greeting: { fontSize: 24, fontWeight: '700', color: '#f8fafc' },
  email: { fontSize: 15, color: '#94a3b8', marginBottom: 12 },
  secondary: {
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryText: { color: '#e2e8f0', fontSize: 16, fontWeight: '600' },
  spacer: { height: 24 },
  logout: { color: '#f87171', textAlign: 'center', fontSize: 15 },
});
