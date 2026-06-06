import { View, Text, StyleSheet } from 'react-native';
import { themes } from '@neurolife/design-system';
import { formatTinyAction } from '@neurolife/shared';

interface Props {
  action: string;
  theme?: 'mutedDark' | 'softCream';
}

export function TinyNextActionCard({ action, theme = 'mutedDark' }: Props) {
  const colors = themes[theme];
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.textMuted }]}>Your next tiny action</Text>
      <Text style={[styles.action, { color: colors.text }]}>{formatTinyAction(action)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, padding: 20 },
  label: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  action: { fontSize: 18, lineHeight: 28, fontWeight: '500' },
});
