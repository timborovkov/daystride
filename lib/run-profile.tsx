import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAsyncStorage } from '@/hooks/useAsyncStorage';
import { sample, type Profile } from './sunset';
const RunContext = createContext({
  profile: sample,
  isSample: true,
  loading: true,
  save: async (_profile: Profile) => {},
  now: Date.now(),
});
export function RunProvider({ children }: { children: ReactNode }) {
  const [saved, save, , loading] = useAsyncStorage<Profile>('sunset-run-profile');
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(id);
  }, []);
  const value = useMemo(
    () => ({ profile: saved ?? sample, isSample: !saved, loading, save, now }),
    [saved, loading, save, now],
  );
  return <RunContext.Provider value={value}>{children}</RunContext.Provider>;
}
export const useRun = () => useContext(RunContext);
