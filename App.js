import React from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import Toast from 'react-native-toast-message';
import { ThemeProvider } from './src/context/ThemeContext';

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppNavigator />
          <Toast position="top" topOffset={60} />
        </ThemeProvider>
      </SafeAreaProvider>
    </Provider>
  );
}
