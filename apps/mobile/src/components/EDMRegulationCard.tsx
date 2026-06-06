import { View, Text, Pressable, StyleSheet, Switch } from 'react-native';
import { themes } from '@neurolife/design-system';
import { getMutedHighs, setMutedHighs, startDeescalationRamp, triggerDopamineDrop, stopAudio } from '../services/AudioSomaticService';
import { useState } from 'react';

interface Props {
  theme?: 'mutedDark' | 'softCream';
}

export function EDMRegulationCard({ theme = 'mutedDark' }: Props) {
  const colors = themes[theme];
  const [muted, setMuted] = useState(getMutedHighs());

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>Audio Regulation</Text>
      <View style={styles.row}>
        <Text style={{ color: colors.textMuted }}>Muted highs</Text>
        <Switch
          value={muted}
          onValueChange={(v) => {
            setMuted(v);
            setMutedHighs(v);
          }}
        />
      </View>
      <Pressable
        style={[styles.btn, { backgroundColor: colors.accentSoft }]}
        onPress={() => startDeescalationRamp(140)}
      >
        <Text style={{ color: colors.background }}>Anxiety ramp-down</Text>
      </Pressable>
      <Pressable
        style={[styles.btn, { backgroundColor: colors.accent }]}
        onPress={() => triggerDopamineDrop()}
      >
        <Text style={{ color: colors.background }}>Dopamine jumpstart</Text>
      </Pressable>
      <Pressable style={styles.stopBtn} onPress={() => stopAudio()}>
        <Text style={{ color: colors.textMuted }}>Stop audio</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, padding: 16, gap: 10 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  btn: { padding: 12, borderRadius: 8, alignItems: 'center' },
  stopBtn: { alignItems: 'center', padding: 8 },
});
