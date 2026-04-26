import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { SignupScreen } from '../screens/Auth/SignupScreen';
import { DashboardScreen } from '../screens/Home/DashboardScreen';
import { CreateSessionScreen } from '../screens/Session/CreateSessionScreen';
import { JoinSessionScreen } from '../screens/Session/JoinSessionScreen';
import { RoomScreen } from '../screens/Session/RoomScreen';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type AppStackParamList = {
  Dashboard: undefined;
  CreateSession: undefined;
  JoinSession: undefined;
  Room: { sessionId: string; title?: string; hostId: string };
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

const headerScreenOptions = {
  headerStyle: { backgroundColor: '#1a1a2e' },
  headerTintColor: '#e2e8f0',
  contentStyle: { backgroundColor: '#0f0f1a' },
};

function AuthStackNavigator() {
  return (
    <AuthStack.Navigator screenOptions={headerScreenOptions}>
      <AuthStack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign in' }} />
      <AuthStack.Screen name="Signup" component={SignupScreen} options={{ title: 'Create account' }} />
    </AuthStack.Navigator>
  );
}

function AppStackNavigator() {
  return (
    <AppStack.Navigator screenOptions={headerScreenOptions}>
      <AppStack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Discussions' }}
      />
      <AppStack.Screen
        name="CreateSession"
        component={CreateSessionScreen}
        options={{ title: 'New session' }}
      />
      <AppStack.Screen
        name="JoinSession"
        component={JoinSessionScreen}
        options={{ title: 'Join session' }}
      />
      <AppStack.Screen
        name="Room"
        component={RoomScreen}
        options={({ route }) => ({ title: route.params.title || 'Room' })}
      />
    </AppStack.Navigator>
  );
}

export default function AppNavigator() {
  const { token, authReady } = useAuth();

  if (!authReady) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return token ? <AppStackNavigator /> : <AuthStackNavigator />;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f1a',
  },
});
