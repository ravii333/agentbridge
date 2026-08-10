import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AgentProvider } from './src/context/AgentContext.js';
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

export default function App() {
  return (
    <SafeAreaProvider>
      <AgentProvider>
        <NavigationContainer theme={navTheme}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Status" component={StatusScreen} />
            <Stack.Screen name="LiveFeed" component={LiveFeedScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
            <Stack.Screen name="RunDetail" component={RunDetailScreen} />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="light" />
      </AgentProvider>
    </SafeAreaProvider>
  );
}
