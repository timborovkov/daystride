import { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { Button, Input, Label, TextField } from 'heroui-native';
import * as Haptics from 'expo-haptics';
import { Copy, RunLoading, RunPage, Title } from '@/components/RunUI';
import { useRun } from '@/lib/run-profile';
import { palette as c, type Profile } from '@/lib/sunset';
const fields = [
  ['name', 'Lake name'],
  ['latitude', 'Latitude'],
  ['longitude', 'Longitude'],
  ['run', 'Run length (minutes)'],
  ['travel', 'Travel time (minutes)'],
] as const;
export default function MyRun() {
  const { loading, profile } = useRun();
  if (loading) return <RunLoading />;
  return <Form initial={profile} />;
}
function Form({ initial }: { initial: Profile }) {
  const { save, isSample } = useRun();
  const [draft, setDraft] = useState({
    name: initial.name,
    latitude: String(initial.latitude),
    longitude: String(initial.longitude),
    run: String(initial.run),
    travel: String(initial.travel),
  });
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const submit = async () => {
    const n = (key: Exclude<keyof Profile, 'name'>) =>
      draft[key].trim() ? Number(draft[key]) : NaN;
    const p = {
      name: draft.name.trim(),
      latitude: n('latitude'),
      longitude: n('longitude'),
      run: n('run'),
      travel: n('travel'),
    };
    const issue = !p.name
      ? 'Enter a lake name.'
      : !(Math.abs(p.latitude) <= 90)
        ? 'Enter a latitude from −90 to 90.'
        : !(Math.abs(p.longitude) <= 180)
          ? 'Enter a longitude from −180 to 180.'
          : !Number.isFinite(p.run) || p.run <= 0
            ? 'Enter a run length greater than zero.'
            : !Number.isFinite(p.travel) || p.travel < 0
              ? 'Enter a travel time of zero or more.'
              : '';
    setError(issue);
    setSaved(false);
    if (issue) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setPending(true);
    try {
      await save(p);
      setSaved(true);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setError('Your run couldn’t be saved. Try again.');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setPending(false);
    }
  };
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <RunPage>
        <Title>My run</Title>
        {isSample && (
          <View style={{ padding: 12, borderRadius: 10, marginTop: 12, backgroundColor: c.peach }}>
            <Copy style={{ color: c.orange }}>
              Sample profile · Replace these values with your own.
            </Copy>
          </View>
        )}
        <View style={{ gap: 14, marginVertical: 20 }}>
          {fields.map(([key, label]) => (
            <TextField key={key} isDisabled={pending}>
              <Label>{label}</Label>
              <Input
                accessibilityLabel={label}
                value={draft[key]}
                keyboardType={
                  key === 'name'
                    ? 'default'
                    : Platform.OS === 'ios' && (key === 'latitude' || key === 'longitude')
                      ? 'numbers-and-punctuation'
                      : 'numeric'
                }
                onChangeText={(value) => {
                  setDraft((prev) => ({ ...prev, [key]: value }));
                  setSaved(false);
                  setError('');
                }}
                style={{
                  backgroundColor: c.white,
                  borderColor: c.line,
                  borderWidth: 1,
                  minHeight: 48,
                  color: c.ink,
                }}
              />
            </TextField>
          ))}
        </View>
        {error !== '' && <Copy style={{ color: c.red, marginBottom: 10 }}>{error}</Copy>}
        <Button
          onPress={() => void submit()}
          isDisabled={pending}
          style={{ backgroundColor: c.orange, minHeight: 48 }}
        >
          <Button.Label style={{ color: c.white }}>{pending ? 'Saving…' : 'Save run'}</Button.Label>
        </Button>
        {saved && <Copy style={{ color: c.green, marginTop: 12 }}>Run profile saved.</Copy>}
      </RunPage>
    </KeyboardAvoidingView>
  );
}
