import { Image, View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { PressableFeedback } from 'heroui-native';
import { ChevronRight, MapPin, Sunset } from 'lucide-react-native';
import { Badge, Copy, RunLoading, RunPage, Title } from '@/components/RunUI';
import { useRun } from '@/lib/run-profile';
import { calculate, dateLabel, dayKey, dayNoon, palette as c, routeZone, time } from '@/lib/sunset';
export default function Week() {
  const { profile, runs, isSample, loading, now } = useRun();
  if (loading) return <RunLoading />;
  const today = dayNoon(dayKey(new Date(now), profile));
  return (
    <RunPage>
      <View style={s.hero}>
        <Image
          source={require('@/assets/lake.png')}
          style={{ width: '100%', height: '100%', position: 'absolute' }}
          resizeMode="cover"
        />
        <View style={s.scrim} />
        <View style={s.heroContent}>
          <Sunset color="#ffd9ba" size={27} />
          <Text style={s.heroTitle}>Sunset Run</Text>
          <View style={s.location}>
            <MapPin size={14} color="#ffdfc8" />
            <Copy style={{ color: '#ffdfc8', flexShrink: 1 }}>
              {runs.length > 1 ? `${runs.length} runs` : profile.name}
              {isSample ? ' · Sample profile' : ''}
            </Copy>
          </View>
        </View>
      </View>
      <View style={s.heading}>
        <Title>This week</Title>
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
                params: { date: new Date(date).toISOString().slice(0, 10) },
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
            {runs.map((run, index) => {
              const forecast = calculate(date, run);
              const passed = date === dayNoon(dayKey(new Date(now), run)) && now >= forecast.sunset;
              return (
                <View
                  key={index}
                  className={index > 0 ? 'mt-1 gap-2 border-t pt-3' : 'gap-2'}
                  style={{ borderColor: c.line }}
                >
                  {runs.length > 1 && <Text style={s.date}>{run.name}</Text>}
                  <Copy>{routeZone(run).replaceAll('_', ' ')}</Copy>
                  <View style={s.times}>
                    <View style={s.cell}>
                      <Copy>Sunset</Copy>
                      <Text style={s.time}>{time(forecast.sunset, run)}</Text>
                    </View>
                    <View style={s.cell}>
                      <Copy>Leave home by</Copy>
                      <Text style={s.time}>{time(forecast.leave, run)}</Text>
                    </View>
                  </View>
                  <Badge verdict={forecast.verdict} />
                  {passed && <Copy style={{ color: c.orange }}>Today’s sunset has passed.</Copy>}
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
  hero: {
    height: 176,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: c.navy,
    justifyContent: 'flex-end',
  },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(24,23,43,0.43)' },
  heroContent: { padding: 20, gap: 5 },
  heroTitle: { color: '#fffdfa', fontFamily: 'Inter_700Bold', fontSize: 36, letterSpacing: -1.6 },
  location: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heading: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 22,
    marginBottom: 12,
  },
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
  times: { flexDirection: 'row', gap: 10 },
  cell: { flex: 1 },
  time: {
    fontSize: 25,
    fontFamily: 'Inter_700Bold',
    fontVariant: ['tabular-nums'],
    color: c.ink,
    letterSpacing: -0.8,
  },
});
