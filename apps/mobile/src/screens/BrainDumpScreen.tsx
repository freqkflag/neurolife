import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { themes } from '@neurolife/design-system';
import { useAppStore } from '../store/useAppStore';
import { processBrainDump } from '../services/LocalAIService';
import { saveBrainDump } from '../db/offlineDb';
import { TinyNextActionCard } from '../components/TinyNextActionCard';
import { useState } from 'react';
import { router } from 'expo-router';

export function BrainDumpScreen() {
  const { theme, addBrainDump } = useAppStore();
  const colors = themes[theme];
  const [text, setText] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const submit = async () => {
    if (!text.trim()) return;
    addBrainDump(text);
    await saveBrainDump(text);
    const output = await processBrainDump(text);
    setResult(output.tinyNextAction);
    setText('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Brain Dump</Text>
      <Text style={{ color: colors.textMuted, marginBottom: 16 }}>
        Pour it out. No organizing required.
      </Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
        multiline
        placeholder="What's swirling in your head?"
        placeholderTextColor={colors.textMuted}
        value={text}
        onChangeText={setText}
      />
      <Pressable style={[styles.btn, { backgroundColor: colors.accent }]} onPress={submit}>
        <Text style={{ color: colors.background }}>Capture</Text>
      </Pressable>
      {result && (
        <View style={{ marginTop: 20 }}>
          <TinyNextActionCard action={result} theme={theme} />
        </View>
      )}
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={{ color: colors.textMuted }}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 10, padding: 16, minHeight: 150, textAlignVertical: 'top', fontSize: 16 },
  btn: { padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  back: { alignItems: 'center', padding: 20 },
});
