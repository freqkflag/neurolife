import { View, Text, StyleSheet } from 'react-native';
import { themes } from '@neurolife/design-system';
import { capacityLabel } from '@neurolife/shared';

interface Props {
  score: number;
  theme?: 'mutedDark' | 'softCream';
}

export function CapacityBattery({ score, theme = 'mutedDark' }: Props) {
  const colors = themes[theme];
  const clamped = Math.max(0, Math.min(100, score));
  return (
    <View>
      <View style={styles.row}>
        <Text style={{ color: colors.text, fontSize: 14 }}>Capacity</Text>
        <Text style={{ color: colors.textMuted, fontSize: 14 }}>{clamped}%</Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.surfaceRaised }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${clamped}%`,
              backgroundColor: clamped < 30 ? colors.warning : colors.accent,
            },
          ]}
        />
      </View>
      <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 6 }}>
        {capacityLabel(clamped)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  track: { height: 12, borderRadius: 6, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 6 },
});
