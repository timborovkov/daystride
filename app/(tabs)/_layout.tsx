import { CalendarDays, SlidersHorizontal } from 'lucide-react-native';
import { Image, Platform, View } from 'react-native';
import { SvgUri } from 'react-native-svg';
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
            headerTitle: 'Dayride',
            headerRight: () => (
              <View
                className="mr-4"
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              >
                {Platform.OS === 'web' ? (
                  <Image
                    source={{
                      uri: 'https://files.bilt.me/uploads/user_3Lxe2utqen0MTxRRmTsd2IMUyJB/fce2680a-11bc-4165-b23d-2fc8f83eb197.svg',
                    }}
                    style={{ width: 100, height: 44 }}
                    resizeMode="contain"
                  />
                ) : (
                  <SvgUri
                    uri={Image.resolveAssetSource(require('@/assets/dayride.svg'))?.uri ?? null}
                    width={100}
                    height={44}
                  />
                )}
              </View>
            ),
            tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="my-run"
          options={{
            title: 'My runs',
            headerTitle: 'Dayride',
            headerRight: () => (
              <View
                className="mr-4"
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              >
                {Platform.OS === 'web' ? (
                  <Image
                    source={{
                      uri: 'https://files.bilt.me/uploads/user_3Lxe2utqen0MTxRRmTsd2IMUyJB/fce2680a-11bc-4165-b23d-2fc8f83eb197.svg',
                    }}
                    style={{ width: 100, height: 44 }}
                    resizeMode="contain"
                  />
                ) : (
                  <SvgUri
                    uri={Image.resolveAssetSource(require('@/assets/dayride.svg'))?.uri ?? null}
                    width={100}
                    height={44}
                  />
                )}
              </View>
            ),
            tabBarIcon: ({ color, size }) => <SlidersHorizontal color={color} size={size} />,
          }}
        />
      </Tabs>
    </>
  );
}
