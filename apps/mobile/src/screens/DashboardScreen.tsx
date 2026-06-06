import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { themes } from '@neurolife/design-system';
import { useAppStore } from '../store/useAppStore';
import { CapacityBattery } from '../components/CapacityBattery';
import { TinyNextActionCard } from '../components/TinyNextActionCard';
import { StuckButton } from '../components/StuckButton';
import { generateTinyNextAction } from '../services/LocalAIService';
import { saveTinyAction } from '../db/offlineDb';
import { triggerHaptic } from '../services/HapticBridgeService';
import { router } from 'expo-router';

export function DashboardScreen() {
  const { capacityScore, sensoryLoad, tinyNextAction, theme, setTinyNextAction } = useAppStore();
  const colors = themes[theme];

  const handleStuck = async () => {
    await triggerHaptic('soft');
    const result = await generateTinyNextAction("I'm stuck", {
      capacityScore,
      sensoryLoad,
    });
    setTinyNextAction(result.tinyNextAction);
    await saveTinyAction(result.tinyNextAction);
  };

  const shortcuts = [
    { label: 'Stabilize First', route: '/stabilize' },
    { label: 'Food Check', route: '/food-check' },
    { label: 'Room Rescue', route: '/room-rescue' },
    { label: 'Brain Dump', route: '/brain-dump' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.heading, { color: colors.text }]}>NeuroLife Pocket</Text>

      <View style={styles.section}>
        <CapacityBattery score={capacityScore} theme={theme} />
      </View>

      <View style={styles.section}>
        <Text style={{ color: colors.textMuted, fontSize: 14 }}>
          Sensory load: {sensoryLoad}%
        </Text>
      </View>

      <View style={styles.section}>
        <TinyNextActionCard action={tinyNextAction} theme={theme} />
      </View>

      <View style={styles.section}>
        <StuckButton onPress={handleStuck} theme={theme} />
      </View>

      <View style={styles.shortcuts}>
        {shortcuts.map((s) => (
          <Pressable
            key={s.route}
            style={[styles.shortcut, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push(s.route as never)}
          >
            <Text style={{ color: colors.text, fontSize: 14 }}>{s.label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={() => router.push('/settings' as never)} style={styles.settings}>
        <Text style={{ color: colors.textMuted }}>Settings</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 24, fontWeight: '600', marginBottom: 24 },
  section: { marginBottom: 20 },
  shortcuts: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  shortcut: { padding: 14, borderRadius: 10, borderWidth: 1, minWidth: '45%' },
  settings: { alignItems: 'center', padding: 20 },
});
