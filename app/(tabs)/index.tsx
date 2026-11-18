import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Button, PressableFeedback } from 'heroui-native';
import { ChevronRight, Clock, Sunrise, Sunset } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import type { SolarMode } from '@/lib/sunset';
import { Badge, Copy, RunLoading, RunPage, Title } from '@/components/RunUI';
import { useRun } from '@/lib/run-profile';
import { calculate, dateLabel, dayKey, dayNoon, palette as c, routeZone, time } from '@/lib/sunset';
import { useState } from 'react';
export default function Week() {
  const [mode, setMode] = useState<SolarMode>('sunset');
  const EventIcon = mode === 'sunrise' ? Sunrise : Sunset;
  const { profile, nearbyRuns, loading, now } = useRun();
  if (loading) return <RunLoading />;
  const today = dayNoon(dayKey(new Date(now), profile));
  return (
    <RunPage>
      <View className="mb-3">
        <Title>This week</Title>
      </View>
      <View className="mb-3 flex-row gap-2" accessibilityRole="tablist">
        {(['sunrise', 'sunset'] as const).map((tab) => (
          <Button
            key={tab}
            className="flex-1"
            variant={mode === tab ? 'primary' : 'secondary'}
            accessibilityRole="tab"
            accessibilityState={{ selected: mode === tab }}
            onPress={() => {
              if (mode === tab) return;
              setMode(tab);
              void Haptics.selectionAsync();
            }}
          >
            {tab === 'sunrise' ? 'Sunrise' : 'Sunset'}
          </Button>
        ))}
      </View>
      {Array.from({ length: 7 }, (_, i) => {
        const date = today + i * 86400000;
        return (
          <PressableFeedback
            key={date}
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: '/day/[date]',
                params: { date: new Date(date).toISOString().slice(0, 10), mode },
              })
            }
            style={[s.row, i === 0 && s.today]}
          >
            <View style={s.rowTop}>
              <Text style={[s.date, i === 0 && { color: c.orange }]}>
                {i === 0 ? 'Today · ' : ''}
                {dateLabel(date)}
              </Text>
              <ChevronRight size={16} color={c.muted} />
            </View>
            {nearbyRuns.map(({ run, index }, position) => {
              const forecast = calculate(date, run, mode);
              const passed = date === dayNoon(dayKey(new Date(now), run)) && now >= forecast.event;
              return (
                <View
                  key={index}
                  className={position > 0 ? 'mt-2 gap-3 border-t pt-4' : 'gap-3 pt-2'}
                  style={{ borderColor: c.line }}
                >
                  <View className="gap-1">
                    <Text style={s.routeTitle}>{run.name}</Text>
                    <Copy style={{ fontSize: 11 }}>{routeZone(run).replaceAll('_', ' ')}</Copy>
                  </View>
                  <Badge verdict={forecast.verdict} />
                  <View
                    className="flex-row gap-3 rounded-xl p-3"
                    style={{ backgroundColor: c.paper }}
                  >
                    <View className="flex-1 gap-1">
                      <View className="flex-row items-center gap-1.5">
                        <Clock size={14} color={c.orange} />
                        <Copy style={{ flexShrink: 1 }}>Leave by</Copy>
                      </View>
                      <Text style={[s.time, { color: c.orange }]}>{time(forecast.leave, run)}</Text>
                    </View>
                    <View className="flex-1 gap-1 border-l pl-3" style={{ borderColor: c.line }}>
                      <View className="flex-row items-center gap-1.5">
                        <EventIcon size={14} color={c.muted} />
                        <Copy style={{ flexShrink: 1 }}>{forecast.eventLabel}</Copy>
                      </View>
                      <Text style={s.time}>{time(forecast.event, run)}</Text>
                    </View>
                  </View>
                  {passed && (
                    <Copy style={{ color: c.orange }}>
                      Today’s {forecast.eventLabel.toLowerCase()} has passed.
                    </Copy>
                  )}
                </View>
              );
            })}
          </PressableFeedback>
        );
      })}
    </RunPage>
  );
}
const s = StyleSheet.create({
  row: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 15,
    backgroundColor: c.white,
    borderWidth: 1,
    borderColor: c.line,
    marginBottom: 9,
    gap: 7,
  },
  today: { backgroundColor: c.peach, borderColor: '#e7b69f' },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 14, fontFamily: 'Inter_700Bold', color: c.ink },
  routeTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', color: c.ink },
  time: {
    fontSize: 25,
    fontFamily: 'Inter_700Bold',
    fontVariant: ['tabular-nums'],
    color: c.ink,
    letterSpacing: -0.8,
  },
});
