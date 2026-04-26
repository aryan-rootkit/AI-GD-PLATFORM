import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { SocketProvider } from './src/context/SocketContext';
import AppNavigator from './src/navigation/AppNavigator';

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#0f0f1a',
    card: '#1a1a2e',
    text: '#f1f5f9',
    border: '#334155',
    primary: '#7c3aed',
  },
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <SocketProvider>
          <NavigationContainer theme={navTheme}>
            <AppNavigator />
          </NavigationContainer>
          <StatusBar style="light" />
        </SocketProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
