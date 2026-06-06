import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAppStore } from '../src/store/useAppStore';
import { themes } from '@neurolife/design-system';

export default function RootLayout() {
  const theme = useAppStore((s) => s.theme);
  const colors = themes[theme];

  return (
    <>
      <StatusBar style={theme === 'mutedDark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
          headerShown: false,
        }}
      />
    </>
  );
}
