import { View, Text, Pressable, StyleSheet, Switch } from 'react-native';
import { themes } from '@neurolife/design-system';
import { useAppStore } from '../store/useAppStore';
import { router } from 'expo-router';

export function SettingsScreen() {
  const { theme, setTheme, privacyMode, capacityScore, setCapacity } = useAppStore();
  const colors = themes[theme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

      <View style={styles.row}>
        <Text style={{ color: colors.text }}>Soft cream theme</Text>
        <Switch
          value={theme === 'softCream'}
          onValueChange={(v) => setTheme(v ? 'softCream' : 'mutedDark')}
        />
      </View>

      <Text style={{ color: colors.textMuted, marginTop: 16 }}>Privacy: {privacyMode}</Text>
      <Text style={{ color: colors.textMuted, marginTop: 8 }}>
        Rescue mode works offline without cloud AI.
      </Text>

      <Text style={[styles.section, { color: colors.text }]}>Manual capacity check-in</Text>
      {[20, 50, 80].map((score) => (
        <Pressable
          key={score}
          style={[styles.chip, { borderColor: colors.border, backgroundColor: capacityScore === score ? colors.accent : 'transparent' }]}
          onPress={() => setCapacity(score)}
        >
          <Text style={{ color: capacityScore === score ? colors.background : colors.text }}>
            {score}%
          </Text>
        </Pressable>
      ))}

      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={{ color: colors.textMuted }}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  section: { fontSize: 16, fontWeight: '600', marginTop: 24, marginBottom: 12 },
  chip: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 8, alignItems: 'center' },
  back: { alignItems: 'center', padding: 20, marginTop: 24 },
});
