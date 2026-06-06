import { View, Text, Pressable, StyleSheet } from 'react-native';
import { themes } from '@neurolife/design-system';

interface Props {
  message: string;
  suggestions: string[];
  onDelay: () => void;
  theme?: 'mutedDark' | 'softCream';
}

export function SensoryAlert({ message, suggestions, onDelay, theme = 'mutedDark' }: Props) {
  const colors = themes[theme];
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.warning }]}>
      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
      {suggestions.slice(0, 2).map((s) => (
        <Text key={s} style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>
          · {s}
        </Text>
      ))}
      <Pressable
        style={[styles.delayBtn, { borderColor: colors.border }]}
        onPress={onDelay}
      >
        <Text style={{ color: colors.textMuted }}>Delay by 5m</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 10, borderWidth: 1, padding: 16 },
  message: { fontSize: 15, lineHeight: 22 },
  delayBtn: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
});
