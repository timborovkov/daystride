import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as Location from 'expo-location';
import { AppState } from 'react-native';
import { useAsyncStorage } from '@/hooks/useAsyncStorage';
import { sample, type Profile } from './sunset';
const RunContext = createContext({
  profile: sample,
  isSample: true,
  loading: true,
  runs: [sample],
  nearbyRuns: [{ run: sample, index: 0, distance: 0 }],
  save: async (_profile: Profile, _index?: number) => {},
  now: Date.now(),
});
export function RunProvider({ children }: { children: ReactNode }) {
  const [saved, persist, , loading] = useAsyncStorage<Profile | Profile[]>('sunset-run-profile');
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(id);
  }, []);
  const value = useMemo(() => {
    const runs = Array.isArray(saved) ? saved : [saved ?? sample];
    return {
      profile: runs[0] ?? sample,
      runs,
      isSample: !saved,
      loading,
      now,
      save: async (profile: Profile, index?: number) => {
        const next = saved ? [...runs] : [];
        if (index === undefined) next.push(profile);
        else next[index] = profile;
        await persist(next);
      },
    };
  }, [saved, loading, persist, now]);
  const nearbyRuns = useNearbyOrder(value.runs);
  const contextValue = useMemo(() => ({ ...value, nearbyRuns }), [value, nearbyRuns]);
  return <RunContext.Provider value={contextValue}>{children}</RunContext.Provider>;
}
export const useRun = () => useContext(RunContext);

export function useNearbyOrder(runs: Profile[]) {
  const [coords, setCoords] = useState<Location.LocationObjectCoords>();
  const multiple = runs.length > 1;
  useEffect(() => {
    if (!multiple) return undefined;
    let active = true;
    let pending = false;
    let subscription: Location.LocationSubscription | undefined;
    const start = async () => {
      if (subscription || pending) return;
      pending = true;
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!active || !permission.granted) return;
        const watcher = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, distanceInterval: 250 },
          ({ coords: positionCoords }) => {
            if (active) setCoords(positionCoords);
          },
        );
        if (active) subscription = watcher;
        else watcher.remove();
      } catch {
        if (active) setCoords(undefined);
      } finally {
        pending = false;
      }
    };
    void start();
    const listener = AppState.addEventListener('change', (state) => {
      if (state === 'active') void start();
      else {
        subscription?.remove();
        subscription = undefined;
      }
    });
    return () => {
      active = false;
      listener.remove();
      subscription?.remove();
    };
  }, [multiple]);
  return useMemo(() => {
    const radians = Math.PI / 180;
    return runs
      .map((run, index) => ({
        run,
        index,
        distance: coords
          ? Math.sin(((run.latitude - coords.latitude) * radians) / 2) ** 2 +
            Math.cos(coords.latitude * radians) *
              Math.cos(run.latitude * radians) *
              Math.sin(((run.longitude - coords.longitude) * radians) / 2) ** 2
          : 0,
      }))
      .sort((a, b) => a.distance - b.distance || a.index - b.index);
  }, [runs, coords]);
}
