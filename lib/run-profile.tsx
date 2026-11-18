import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAsyncStorage } from '@/hooks/useAsyncStorage';
import { sample, type Profile } from './sunset';
const RunContext = createContext({
  profile: sample,
  isSample: true,
  loading: true,
  runs: [sample],
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
  return <RunContext.Provider value={value}>{children}</RunContext.Provider>;
}
export const useRun = () => useContext(RunContext);
