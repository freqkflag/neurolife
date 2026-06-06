import { View, Text, Pressable, StyleSheet } from 'react-native';
import { themes } from '@neurolife/design-system';
import { useAppStore } from '../store/useAppStore';
import { startBassBodyDouble } from '../services/AudioSomaticService';
import { triggerHaptic } from '../services/HapticBridgeService';
import { useState } from 'react';
import { router } from 'expo-router';

const STEPS = [
  'Pick up one item',
  'Put it where it belongs',
  'Take one step to the next spot',
  'Repeat with one more item',
];

export function RoomRescueScreen() {
  const { theme } = useAppStore();
  const colors = themes[theme];
  const [step, setStep] = useState(0);

  const start = async () => {
    await startBassBodyDouble('room_rescue');
    await triggerHaptic('soft');
    setStep(0);
  };

  const nextStep = async () => {
    await triggerHaptic('routine_complete');
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Room Rescue</Text>
      <Text style={{ color: colors.textMuted, marginBottom: 20 }}>One item at a time. Bass-line body double on.</Text>
      <Pressable style={[styles.btn, { backgroundColor: colors.accent }]} onPress={start}>
        <Text style={{ color: colors.background }}>Start rescue</Text>
      </Pressable>
      <View style={[styles.stepCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>Step {step + 1}</Text>
        <Text style={{ color: colors.text, fontSize: 18, marginTop: 8 }}>{STEPS[step]}</Text>
      </View>
      <Pressable style={[styles.btn, { backgroundColor: colors.accentSoft }]} onPress={nextStep}>
        <Text style={{ color: colors.background }}>Done — next</Text>
      </Pressable>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={{ color: colors.textMuted }}>Save my spot & back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 8 },
  btn: { padding: 16, borderRadius: 10, alignItems: 'center', marginBottom: 16 },
  stepCard: { borderWidth: 1, borderRadius: 12, padding: 20, marginBottom: 16 },
  back: { alignItems: 'center', padding: 20 },
});
