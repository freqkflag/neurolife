import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { themes } from '@neurolife/design-system';
import { useAppStore } from '../store/useAppStore';
import { createLeavingChecklist } from '../services/LocalAIService';
import { TinyNextActionCard } from '../components/TinyNextActionCard';
import { useState } from 'react';
import { router } from 'expo-router';

export function LeavingChecklistScreen() {
  const { theme } = useAppStore();
  const colors = themes[theme];
  const [destination, setDestination] = useState('');
  const [purpose, setPurpose] = useState('');
  const [action, setAction] = useState('');

  const generate = async () => {
    const result = await createLeavingChecklist(destination, purpose);
    setAction(result.tinyNextAction);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Leaving Checklist</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
        placeholder="Where are you going?"
        placeholderTextColor={colors.textMuted}
        value={destination}
        onChangeText={setDestination}
      />
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
        placeholder="Why?"
        placeholderTextColor={colors.textMuted}
        value={purpose}
        onChangeText={setPurpose}
      />
      <Pressable style={[styles.btn, { backgroundColor: colors.accent }]} onPress={generate}>
        <Text style={{ color: colors.background }}>Build checklist</Text>
      </Pressable>
      {action ? <TinyNextActionCard action={action} theme={theme} /> : null}
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={{ color: colors.textMuted }}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 16 },
  input: { borderWidth: 1, borderRadius: 10, padding: 14, marginBottom: 12, fontSize: 16 },
  btn: { padding: 16, borderRadius: 10, alignItems: 'center', marginBottom: 16 },
  back: { alignItems: 'center', padding: 20 },
});
