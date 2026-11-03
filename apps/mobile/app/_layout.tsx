import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { colors } from '../src/theme';

const items = [
  { name: 'index', title: 'Home', symbol: '⌂' },
  { name: 'accounts', title: 'Accounts', symbol: '▦' },
  { name: 'goals', title: 'Goals', symbol: '◎' },
  { name: 'activity', title: 'Activity', symbol: '↔' },
  { name: 'settings', title: 'More', symbol: '⚙' },
] as const;

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.faint,
          tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 70, paddingTop: 6, paddingBottom: 8 },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}
      >
        {items.map(item => (
          <Tabs.Screen
            key={item.name}
            name={item.name}
            options={{
              title: item.title,
              tabBarAccessibilityLabel: `${item.title} tab`,
              tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22, fontWeight: '600' }}>{item.symbol}</Text>,
            }}
          />
        ))}
      </Tabs>
    </>
  );
}
