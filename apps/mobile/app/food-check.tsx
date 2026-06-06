import { View, Text, Pressable, StyleSheet } from 'react-native';
import { themes } from '@neurolife/design-system';
import { useAppStore } from '../src/store/useAppStore';
import { generateInteroceptivePing } from '../src/services/LocalAIService';
import { TinyNextActionCard } from '../src/components/TinyNextActionCard';
import { useState } from 'react';
import { router } from 'expo-router';

export default function FoodCheck() {
  const { theme, capacityScore, sensoryLoad } = useAppStore();
  const colors = themes[theme];
  const [action, setAction] = useState('Grab something easy within reach.');

  const check = async () => {
    const result = await generateInteroceptivePing({ capacityScore, sensoryLoad });
    setAction(result.tinyNextAction);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Food Check</Text>
      <TinyNextActionCard action={action} theme={theme} />
      <Pressable style={[styles.btn, { backgroundColor: colors.accent }]} onPress={check}>
        <Text style={{ color: colors.background }}>Check in</Text>
      </Pressable>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={{ color: colors.textMuted }}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 20 },
  btn: { padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  back: { alignItems: 'center', padding: 20 },
});
