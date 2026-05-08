import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import Toast from 'react-native-toast-message';

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <AppNavigator />
        <Toast position="top" topOffset={60} />
      </SafeAreaProvider>
    </Provider>
  );
}
