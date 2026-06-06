import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { themes } from '@neurolife/design-system';
import { useAppStore } from '../store/useAppStore';
import { translateRSDMessage } from '../services/LocalAIService';
import { TinyNextActionCard } from '../components/TinyNextActionCard';
import { useState } from 'react';
import { router } from 'expo-router';

export function RSDQuickReframeScreen() {
  const { theme } = useAppStore();
  const colors = themes[theme];
  const [message, setMessage] = useState('');
  const [summary, setSummary] = useState('');
  const [action, setAction] = useState('');

  const reframe = async () => {
    const result = await translateRSDMessage(message);
    setSummary(result.summary);
    setAction(result.tinyNextAction);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>RSD Quick Reframe</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
        multiline
        placeholder="Paste or type the message that hurts"
        placeholderTextColor={colors.textMuted}
        value={message}
        onChangeText={setMessage}
      />
      <Pressable style={[styles.btn, { backgroundColor: colors.accent }]} onPress={reframe}>
        <Text style={{ color: colors.background }}>Reframe</Text>
      </Pressable>
      {summary ? (
        <View style={{ marginTop: 20 }}>
          <Text style={{ color: colors.textMuted, marginBottom: 8 }}>{summary}</Text>
          <TinyNextActionCard action={action} theme={theme} />
        </View>
      ) : null}
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={{ color: colors.textMuted }}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 16 },
  input: { borderWidth: 1, borderRadius: 10, padding: 16, minHeight: 120, textAlignVertical: 'top' },
  btn: { padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  back: { alignItems: 'center', padding: 20 },
});
