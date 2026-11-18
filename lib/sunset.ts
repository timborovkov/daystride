import { getTimes } from 'suncalc';
export const sample = {
  name: 'My lake',
  latitude: 52.6369,
  longitude: -1.1398,
  run: 40,
  travel: 10,
};
export type Profile = typeof sample;
const timeZone = 'Europe/London';
const clock = new Intl.DateTimeFormat('en-GB', {
  timeZone,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});
const calendar = new Intl.DateTimeFormat('en-GB', {
  timeZone,
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});
const iso = new Intl.DateTimeFormat('en-CA', {
  timeZone,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
export const time = (ms: number) => (Number.isFinite(ms) ? clock.format(ms) : '—');
export const dateLabel = (ms: number) => calendar.format(ms);
export const dayKey = (date: Date) => {
  const parts = iso.formatToParts(date);
  return ['year', 'month', 'day']
    .map((key) => parts.find((part) => part.type === key)?.value)
    .join('-');
};
export const dayNoon = (key: string) => Date.parse(`${key}T12:00:00Z`);
export function calculate(date: number, p: Profile) {
  const sun = getTimes(new Date(date), p.latitude, p.longitude);
  const sunset = sun.sunset?.getTime() ?? NaN,
    golden = sun.goldenHour?.getTime() ?? NaN,
    last = sun.dusk?.getTime() ?? NaN;
  const start = sunset - p.run * 30000,
    leave = start - p.travel * 60000,
    finish = start + p.run * 60000;
  const minutes = (last - finish) / 60000;
  const verdict = !Number.isFinite(minutes)
    ? ({ tone: 'unknown', label: 'Sun times unavailable' } as const)
    : minutes < 0
      ? ({ tone: 'red', label: 'You’d finish after dark' } as const)
      : minutes < 10
        ? ({ tone: 'amber', label: 'Cutting it fine' } as const)
        : ({ tone: 'green', label: `Done ${Math.floor(minutes)} min before dark` } as const);
  return { sunset, golden, last, start, leave, finish, verdict };
}
export const palette = {
  paper: '#f8f4ef',
  white: '#fffdfa',
  ink: '#242b40',
  muted: '#555b6d',
  line: '#e8dfd6',
  orange: '#a63822',
  peach: '#fbe4d6',
  navy: '#292941',
  green: '#245841',
  greenBg: '#e5efe6',
  amber: '#784600',
  amberBg: '#ffebc6',
  red: '#8f302e',
  redBg: '#fae3e0',
};
