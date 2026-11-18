import { useState } from 'react';
import { setStringAsync } from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { FlatList, KeyboardAvoidingView, Platform, Text, View, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Input, Label, TextField } from 'heroui-native';
import type { Profile } from '@/lib/sunset';
import { Footprints, House, Moon, Sun, Sunset, Flag } from 'lucide-react-native';
import { Badge, Copy, RunLoading, RunPage, Title } from '@/components/RunUI';
import { useRun } from '@/lib/run-profile';
import { calculate, dateLabel, dayNoon, palette as c, routeZone, time } from '@/lib/sunset';
export default function Day() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const { runs, loading, isSample } = useRun();
  const [query, setQuery] = useState('');
  const noon = dayNoon(date);
  if (loading) return <RunLoading />;
  if (!Number.isFinite(noon))
    return (
      <RunPage>
        <Title>Date unavailable</Title>
        <Button onPress={() => router.replace('/')}>Back to this week</Button>
      </RunPage>
    );
  const matches = runs
    .map((profile, index) => ({ profile, index }))
    .filter(({ profile }) => profile.name.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        style={{ backgroundColor: c.paper }}
        contentContainerStyle={{
          width: '100%',
          maxWidth: 620,
          alignSelf: 'center',
          padding: 20,
          gap: 20,
        }}
        keyboardShouldPersistTaps="handled"
        data={matches}
        keyExtractor={({ index }) => String(index)}
        ListHeaderComponent={
          <View className="gap-3">
            <Title>{dateLabel(noon)}</Title>

            {runs.length > 1 && (
              <TextField>
                <Label>Filter by run name</Label>
                <Input
                  accessibilityLabel="Filter by run name"
                  placeholder="All runs"
                  value={query}
                  onChangeText={setQuery}
                />
              </TextField>
            )}
          </View>
        }
        ListEmptyComponent={
          <View className="items-start gap-3">
            <Footprints size={22} color={c.muted} />
            <Copy>No runs match that name.</Copy>
            <Button variant="secondary" onPress={() => setQuery('')}>
              Clear filter
            </Button>
          </View>
        }
        renderItem={({ item }) => (
          <RunTimeline profile={item.profile} noon={noon} isSample={isSample} />
        )}
      />
    </KeyboardAvoidingView>
  );
}
function RunTimeline({
  profile,
  noon,
  isSample,
}: {
  profile: Profile;
  noon: number;
  isSample: boolean;
}) {
  const d = calculate(noon, profile);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'copied' | 'failed'>('idle');
  async function copyRun() {
    setCopyStatus('copying');
    try {
      const copied = await setStringAsync(
        `Running at ${profile.name}, leaving ${time(d.leave, profile)}, back by ${time(d.finish, profile)}`,
      );
      setCopyStatus(copied ? 'copied' : 'failed');
      if (!copied) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {
      setCopyStatus('failed');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }
  const events = [
    { label: 'Leave home', at: d.leave, Icon: House },
    { label: 'Start running', at: d.start, Icon: Footprints },
    { label: 'Golden hour', at: d.golden, Icon: Sun },
    { label: 'Sunset', at: d.sunset, Icon: Sunset },
    { label: 'Finish', at: d.finish, Icon: Flag },
    { label: 'Last light', at: d.last, Icon: Moon },
  ].sort((a, b) => a.at - b.at);
  return (
    <View>
      <Text accessibilityRole="header" style={s.runName}>
        {profile.name}
        {isSample ? ' · Sample' : ''}
      </Text>
      <Copy>{routeZone(profile).replaceAll('_', ' ')}</Copy>
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
            <Text style={s.time}>{time(at, profile)}</Text>
          </View>
        ))}
      </View>
      <View className="mt-3 gap-2">
        <Button variant="secondary" isDisabled={copyStatus === 'copying'} onPress={copyRun}>
          {copyStatus === 'copying' ? 'Copying…' : 'Tell someone'}
        </Button>
        <View accessibilityLiveRegion="polite">
          {copyStatus === 'copied' && <Copy>Copied to clipboard.</Copy>}
          {copyStatus === 'failed' && <Copy>Couldn’t copy the message. Try again.</Copy>}
        </View>
      </View>
      <View style={s.verdict}>
        <Text style={s.verdictTitle}>Safety verdict</Text>
        <Badge verdict={d.verdict} />
        <Copy style={{ color: '#eee5f2' }}>Last light is the end of civil twilight.</Copy>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  runName: { color: c.ink, fontFamily: 'Inter_700Bold', fontSize: 22 },
  timeline: {
    marginTop: 8,
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
