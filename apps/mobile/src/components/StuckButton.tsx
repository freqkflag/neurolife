import { Pressable, Text, StyleSheet } from 'react-native';
import { themes } from '@neurolife/design-system';

interface StuckButtonProps {
  onPress: () => void;
  theme?: 'mutedDark' | 'softCream';
}

export function StuckButton({ onPress, theme = 'mutedDark' }: StuckButtonProps) {
  const colors = themes[theme];
  return (
    <Pressable
      style={[styles.button, { backgroundColor: colors.accent }]}
      onPress={onPress}
    >
      <Text style={[styles.text, { color: colors.background }]}>I'm Stuck</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
  },
});
