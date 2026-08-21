import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext.js';
import { AgentProvider } from './src/context/AgentContext.js';
import WelcomeScreen from './src/screens/WelcomeScreen.js';
import LoginScreen from './src/screens/LoginScreen.js';
import AgentsHomeScreen from './src/screens/AgentsHomeScreen.js';
import AddAgentScreen from './src/screens/AddAgentScreen.js';
import StatusScreen from './src/screens/StatusScreen.js';
import LiveFeedScreen from './src/screens/LiveFeedScreen.js';
import HistoryScreen from './src/screens/HistoryScreen.js';
import RunDetailScreen from './src/screens/RunDetailScreen.js';
import { colors } from './src/theme.js';

const Stack = createNativeStackNavigator();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bg,
    text: colors.text,
    border: colors.border,
    primary: colors.accent,
  },
};

function RootNavigator() {
  const { ready, user } = useAuth();

  if (!ready) {
    return null;
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="AgentsHome" component={AgentsHomeScreen} />
            <Stack.Screen name="Status" component={StatusScreen} />
            <Stack.Screen name="LiveFeed" component={LiveFeedScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
            <Stack.Screen name="RunDetail" component={RunDetailScreen} />
            <Stack.Screen name="AddAgent" component={AddAgentScreen} options={{ presentation: 'modal' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AgentProvider>
          <RootNavigator />
          <StatusBar style="light" />
        </AgentProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
