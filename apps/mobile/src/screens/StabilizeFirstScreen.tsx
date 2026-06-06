import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { themes } from '@neurolife/design-system';
import { useAppStore } from '../store/useAppStore';
import { startStabilizeFirstFlow } from '../services/LocalAIService';
import { TinyNextActionCard } from '../components/TinyNextActionCard';
import { useState } from 'react';
import { router } from 'expo-router';

const BASIC_NEEDS = ['Food', 'Water', 'Meds', 'Sleep', 'Safe space'];

export function StabilizeFirstScreen() {
  const { theme, capacityScore, sensoryLoad } = useAppStore();
  const colors = themes[theme];
  const [action, setAction] = useState('Pause. Put both feet on the floor.');

  const start = async () => {
    const result = await startStabilizeFirstFlow({ capacityScore, sensoryLoad });
    setAction(result.tinyNextAction);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Stabilize First</Text>
      <Text style={{ color: colors.textMuted, marginBottom: 20, lineHeight: 22 }}>
        Pause. No big decisions right now.
      </Text>

      <TinyNextActionCard action={action} theme={theme} />

      <Pressable style={[styles.btn, { backgroundColor: colors.accent }]} onPress={start}>
        <Text style={{ color: colors.background }}>Start grounding</Text>
      </Pressable>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Basic needs</Text>
      {BASIC_NEEDS.map((need) => (
        <Text key={need} style={{ color: colors.textMuted, fontSize: 15, marginBottom: 6 }}>
          · {need}
        </Text>
      ))}

      <View style={[styles.emergency, { borderColor: colors.border }]}>
        <Text style={{ color: colors.text, fontWeight: '600' }}>Emergency resources</Text>
        <Text style={{ color: colors.textMuted, marginTop: 8 }}>
          988 Suicide & Crisis Lifeline (US){'\n'}
          Not a replacement for emergency services.
        </Text>
      </View>

      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={{ color: colors.textMuted }}>Back</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 8 },
  btn: { padding: 16, borderRadius: 10, alignItems: 'center', marginVertical: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  emergency: { borderWidth: 1, borderRadius: 10, padding: 16, marginTop: 24 },
  back: { alignItems: 'center', padding: 20 },
});
