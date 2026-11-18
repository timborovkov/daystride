import { Label, Select } from 'heroui-native';
import { ScrollView } from 'react-native';
import { selectionAsync } from 'expo-haptics';
import type { Profile } from '@/lib/sunset';

export function RunFilter({
  runs,
  selected,
  onChange,
}: {
  runs: { run: Profile; index: number }[];
  selected: string;
  onChange: (value: string) => void;
}) {
  if (runs.length < 2) return null;
  const options = [
    { value: '', label: 'All runs' },
    ...runs.map(({ run, index }) => ({ value: String(index), label: run.name })),
  ];
  return (
    <Select
      className="gap-2"
      value={options.find(({ value }) => value === selected) ?? options[0]}
      onValueChange={(option) => {
        if (!option || Array.isArray(option) || option.value === selected) return;
        void selectionAsync();
        onChange(option.value);
      }}
    >
      <Label>Filter by run</Label>
      <Select.Trigger accessibilityLabel="Filter by run">
        <Select.Value className="flex-1" numberOfLines={1} placeholder="All runs" />
        <Select.TriggerIndicator />
      </Select.Trigger>
      <Select.Portal>
        <Select.Overlay />
        <Select.Content presentation="popover" width="trigger">
          <ScrollView style={{ maxHeight: 220 }}>
            {options.map((option) => (
              <Select.Item key={option.value} {...option} />
            ))}
          </ScrollView>
        </Select.Content>
      </Select.Portal>
    </Select>
  );
}
