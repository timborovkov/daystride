import { CalendarDays, SlidersHorizontal } from 'lucide-react-native';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { palette as c } from '@/lib/sunset';
export default function TabLayout() {
  return (
    <>
      {/* Expo StatusBar uses `style` for the icon color, not a React Native style object. */}
      {/* eslint-disable-next-line react/style-prop-object */}
      <StatusBar style="dark" />
      <Tabs
        screenListeners={({ navigation }) => ({
          tabPress: () => {
            if (!navigation.isFocused()) void Haptics.selectionAsync();
          },
        })}
        screenOptions={{
          headerStyle: { backgroundColor: c.paper },
          headerTintColor: c.ink,
          headerShadowVisible: false,
          sceneStyle: { backgroundColor: c.paper },
          tabBarStyle: { backgroundColor: c.white, borderTopColor: c.line },
          tabBarActiveTintColor: c.orange,
          tabBarInactiveTintColor: c.muted,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'This week',
            headerTitle: 'Sunset Run',
            tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="my-run"
          options={{
            title: 'My run',
            headerTitle: 'Sunset Run',
            tabBarIcon: ({ color, size }) => <SlidersHorizontal color={color} size={size} />,
          }}
        />
      </Tabs>
    </>
  );
}
