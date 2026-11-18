import { Text, View, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from 'heroui-native';
import { Footprints, House, Moon, Sun, Sunset, Flag } from 'lucide-react-native';
import { Badge, Copy, RunLoading, RunPage, Title } from '@/components/RunUI';
import { useRun } from '@/lib/run-profile';
import { calculate, dateLabel, dayNoon, palette as c, time } from '@/lib/sunset';
export default function Day() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const { profile, loading } = useRun();
  const noon = dayNoon(date);
  if (loading) return <RunLoading />;
  if (!Number.isFinite(noon))
    return (
      <RunPage>
        <Title>Date unavailable</Title>
        <Button onPress={() => router.replace('/')}>Back to this week</Button>
      </RunPage>
    );
  const d = calculate(noon, profile);
  const events = [
    { label: 'Leave home', at: d.leave, Icon: House },
    { label: 'Start running', at: d.start, Icon: Footprints },
    { label: 'Golden hour', at: d.golden, Icon: Sun },
    { label: 'Sunset', at: d.sunset, Icon: Sunset },
    { label: 'Finish', at: d.finish, Icon: Flag },
    { label: 'Last light', at: d.last, Icon: Moon },
  ].sort((a, b) => a.at - b.at);
  return (
    <RunPage>
      <Title>{dateLabel(noon)}</Title>
      <Copy style={{ marginTop: 5 }}>{profile.name} · UK local time</Copy>
      <View style={s.timeline}>
        {events.map(({ label, at, Icon }, i) => (
          <View key={label} style={[s.event, label === 'Sunset' && s.sunset]}>
            <View style={s.rail}>
              {i > 0 && <View style={s.before} />}
              <View style={[s.dot, label === 'Sunset' && { backgroundColor: c.peach }]}>
                <Icon size={18} color={label === 'Sunset' ? c.orange : c.ink} />
              </View>
              {i < events.length - 1 && <View style={s.after} />}
            </View>
            <Text style={s.label}>{label}</Text>
            <Text style={s.time}>{time(at)}</Text>
          </View>
        ))}
      </View>
      <View style={s.verdict}>
        <Text style={s.verdictTitle}>Safety verdict</Text>
        <Badge verdict={d.verdict} />
        <Copy style={{ color: '#eee5f2' }}>Last light is the end of civil twilight.</Copy>
      </View>
    </RunPage>
  );
}
const s = StyleSheet.create({
  timeline: {
    marginTop: 22,
    backgroundColor: c.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.line,
    overflow: 'hidden',
  },
  event: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    paddingHorizontal: 12,
    gap: 10,
  },
  sunset: { backgroundColor: '#fff0e5' },
  rail: { width: 36, alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center' },
  dot: {
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.paper,
    zIndex: 1,
  },
  before: { position: 'absolute', width: 2, top: 0, bottom: '50%', backgroundColor: c.line },
  after: { position: 'absolute', width: 2, top: '50%', bottom: 0, backgroundColor: c.line },
  label: { flex: 1, color: c.ink, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  time: { color: c.ink, fontFamily: 'Inter_700Bold', fontSize: 25, fontVariant: ['tabular-nums'] },
  verdict: { backgroundColor: c.navy, padding: 16, borderRadius: 17, marginTop: 16, gap: 8 },
  verdictTitle: { color: c.white, fontSize: 18, fontFamily: 'Inter_700Bold' },
});
