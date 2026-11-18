import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, View } from 'react-native';
import { Button, Input, Label, TextField } from 'heroui-native';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import MapView from '@/components/MapView';
import type { LatLng, MapViewHandle } from '@/components/MapView.types';
import { Copy, RunLoading, RunPage, Title } from '@/components/RunUI';
import { useRun } from '@/lib/run-profile';
import { palette as c, sample, type Profile } from '@/lib/sunset';

const fields = [
  ['name', 'Run name'],
  ['run', 'Run length (minutes)'],
  ['travel', 'Travel time (minutes)'],
] as const;
const region = (point: LatLng) => ({
  latitude: point.latitude,
  longitude: point.longitude,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
});
export default function MyRuns() {
  const { runs, nearbyRuns, loading } = useRun();
  const [editing, setEditing] = useState<number | 'new' | null>(null);
  if (loading) return <RunLoading />;
  if (editing !== null)
    return (
      <Form
        initial={editing === 'new' ? undefined : runs[editing]}
        index={editing === 'new' ? undefined : editing}
        close={() => setEditing(null)}
      />
    );
  return (
    <FlatList
      className="flex-1"
      contentContainerStyle={{ padding: 20, gap: 12 }}
      data={nearbyRuns}
      keyExtractor={({ index }) => String(index)}
      ListHeaderComponent={
        <View className="gap-4 pb-2">
          <Title>My runs</Title>
          <Button onPress={() => setEditing('new')}>Add run</Button>
        </View>
      }
      renderItem={({ item: { run: item, index } }) => (
        <Button variant="secondary" onPress={() => setEditing(index)}>
          <Button.Label numberOfLines={1}>{item.name}</Button.Label>
        </Button>
      )}
    />
  );
}

function Form({ initial, index, close }: { initial?: Profile; index?: number; close: () => void }) {
  const { save } = useRun();
  const [draft, setDraft] = useState({
    name: initial?.name ?? '',
    run: String(initial?.run ?? 40),
    travel: String(initial?.travel ?? 10),
  });
  const [pin, setPin] = useState<LatLng | undefined>(initial);
  const pinVersion = useRef(0);
  const locationRequest = useRef(0);
  const invalidateLocation = useCallback(() => {
    locationRequest.current++;
  }, []);
  const map = useRef<MapViewHandle>(null);
  const [locationError, setLocationError] = useState('');
  const [locating, setLocating] = useState(!initial);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const locate = () => {
    setLocating(true);
    setLocationError('');
    void requestLocation();
  };
  const requestLocation = async () => {
    const request = ++locationRequest.current;
    const version = pinVersion.current;
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) throw new Error('Location permission denied');
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      if (request !== locationRequest.current || version !== pinVersion.current) return;
      const point = { latitude: coords.latitude, longitude: coords.longitude };
      setPin(point);
      map.current?.animateToRegion(region(point));
      setError('');
    } catch {
      if (request === locationRequest.current && version === pinVersion.current) {
        setLocationError('Couldn’t get your location. You can still drop a pin on the map.');
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      if (request === locationRequest.current) setLocating(false);
    }
  };
  const requestInitialLocation = useEffectEvent(() => void requestLocation());
  useEffect(() => {
    if (!initial) requestInitialLocation();
    return invalidateLocation;
  }, [initial, invalidateLocation]);
  const submit = async () => {
    const name = draft.name.trim();
    const run = Number(draft.run);
    const travel = Number(draft.travel);
    const issue = !name
      ? 'Enter a run name.'
      : !pin
        ? 'Drop a pin to choose where you’ll run.'
        : !Number.isFinite(run) || run <= 0
          ? 'Enter a run length greater than zero.'
          : !draft.travel.trim() || !Number.isFinite(travel) || travel < 0
            ? 'Enter a travel time of zero or more.'
            : '';
    setError(issue);
    if (issue || !pin) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setPending(true);
    try {
      await save(
        {
          name,
          latitude: pin.latitude,
          longitude: pin.longitude,
          run,
          travel,
        },
        index,
      );
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      close();
    } catch {
      setError('Your run couldn’t be saved. Try again.');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setPending(false);
    }
  };
  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <RunPage>
        <Title>{initial ? 'Edit run' : 'Add run'}</Title>
        <View className="gap-4 py-5">
          {fields.map(([key, label]) => (
            <TextField key={key} isDisabled={pending}>
              <Label>{label}</Label>
              <Input
                accessibilityLabel={label}
                value={draft[key]}
                keyboardType={key === 'name' ? 'default' : 'numeric'}
                onChangeText={(value) => setDraft((prev) => ({ ...prev, [key]: value }))}
              />
            </TextField>
          ))}
          <Copy>Run location · Tap the map to place a pin.</Copy>
          <View className="h-64 overflow-hidden rounded-2xl">
            <MapView
              ref={map}
              style={{ height: 256, width: '100%' }}
              initialRegion={region(initial ?? sample)}
              markers={pin ? [{ coordinate: pin }] : []}
              onPress={({ coordinate }) => {
                if (pending) return;
                pinVersion.current++;
                setPin(coordinate);
                setError('');
                void Haptics.selectionAsync();
              }}
            />
          </View>
          <Button variant="secondary" isDisabled={locating || pending} onPress={() => locate()}>
            {locating ? 'Finding your location…' : 'Use my location'}
          </Button>
          {locationError ? <Copy style={{ color: c.red }}>{locationError}</Copy> : null}
          {error ? <Copy style={{ color: c.red }}>{error}</Copy> : null}
          <Button isDisabled={pending} onPress={() => void submit()}>
            {pending ? 'Saving…' : 'Save run'}
          </Button>
          <Button variant="secondary" isDisabled={pending} onPress={close}>
            Cancel
          </Button>
        </View>
      </RunPage>
    </KeyboardAvoidingView>
  );
}
