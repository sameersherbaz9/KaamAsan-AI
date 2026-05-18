import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import UnderstandingScreen from './src/screens/UnderstandingScreen';
import ProvidersScreen from './src/screens/ProvidersScreen';
import PricingScreen from './src/screens/PricingScreen';
import BookingScreen from './src/screens/BookingScreen';
import TrackingScreen from './src/screens/TrackingScreen';
import FeedbackScreen from './src/screens/FeedbackScreen';
import DisputeScreen from './src/screens/DisputeScreen';
import BaselineScreen from './src/screens/BaselineScreen';

const Stack = createNativeStackNavigator();

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1a73e8',
    primaryContainer: '#e8f0fe',
    secondary: '#34a853',
    secondaryContainer: '#e6f4ea',
    tertiary: '#fbbc04',
    error: '#ea4335',
    background: '#f8f9fa',
    surface: '#ffffff',
    surfaceVariant: '#f1f3f4',
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    onBackground: '#202124',
    onSurface: '#202124',
    outline: '#dadce0',
  },
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#1a73e8',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 17,
            },
            contentStyle: { backgroundColor: '#f8f9fa' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: '🤖 KaamAsan AI', headerBackVisible: false }}
          />
          <Stack.Screen
            name="Understanding"
            component={UnderstandingScreen}
            options={{ title: '🧠 Understanding Request' }}
          />
          <Stack.Screen
            name="Providers"
            component={ProvidersScreen}
            options={{ title: '👷 Matched Providers' }}
          />
          <Stack.Screen
            name="Pricing"
            component={PricingScreen}
            options={{ title: '💰 Pricing Breakdown' }}
          />
          <Stack.Screen
            name="Booking"
            component={BookingScreen}
            options={{ title: '✅ Booking Confirmed', headerBackVisible: false }}
          />
          <Stack.Screen
            name="Tracking"
            component={TrackingScreen}
            options={{ title: '📍 Live Tracking' }}
          />
          <Stack.Screen
            name="Feedback"
            component={FeedbackScreen}
            options={{ title: '⭐ Leave Feedback' }}
          />
          <Stack.Screen
            name="Dispute"
            component={DisputeScreen}
            options={{ title: '⚠️ Report Issue' }}
          />
          <Stack.Screen
            name="Baseline"
            component={BaselineScreen}
            options={{ title: '📊 Why AI Orchestration?' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
