import { ScrollView, Text, View, StyleSheet, type TextStyle } from 'react-native';
import { Skeleton } from 'heroui-native';
import { CircleCheck, CircleAlert, CircleHelp } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { calculate, palette as c } from '@/lib/sunset';
export function RunPage({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      style={{ backgroundColor: c.paper }}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.page}
    >
      {children}
    </ScrollView>
  );
}
export function Copy({ children, style }: { children: ReactNode; style?: TextStyle }) {
  return <Text style={[styles.copy, style]}>{children}</Text>;
}
export function Title({ children }: { children: ReactNode }) {
  return (
    <Text accessibilityRole="header" style={styles.title}>
      {children}
    </Text>
  );
}
export function Badge({ verdict }: { verdict: ReturnType<typeof calculate>['verdict'] }) {
  const { tone, label } = verdict;
  const [color, backgroundColor, Icon] =
    tone === 'green'
      ? [c.green, c.greenBg, CircleCheck]
      : tone === 'amber'
        ? [c.amber, c.amberBg, CircleAlert]
        : tone === 'red'
          ? [c.red, c.redBg, CircleAlert]
          : [c.muted, c.line, CircleHelp];
  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Icon size={13} color={color} />
      <Text numberOfLines={1} style={{ color, fontFamily: 'Inter_600SemiBold', fontSize: 11 }}>
        {label}
      </Text>
    </View>
  );
}
export function RunLoading() {
  return (
    <RunPage>
      {[0, 1, 2, 3].map((i) => (
        <Skeleton
          key={i}
          style={{ height: i === 0 ? 160 : 76, borderRadius: 16, marginBottom: 12 }}
        />
      ))}
    </RunPage>
  );
}
const styles = StyleSheet.create({
  page: {
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  copy: { color: c.muted, fontFamily: 'Inter_400Regular', fontSize: 13 },
  title: { color: c.ink, fontFamily: 'Inter_700Bold', fontSize: 32, letterSpacing: -1.3 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 30,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
});
