import * as Haptics from 'expo-haptics';

export type HapticPattern = 'soft' | 'routine_complete' | 'transition' | 'alert' | 'success';

export async function triggerHaptic(pattern: HapticPattern): Promise<void> {
  switch (pattern) {
    case 'soft':
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      break;
    case 'routine_complete':
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      break;
    case 'transition':
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;
    case 'alert':
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      break;
    case 'success':
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      break;
  }
}

export async function startHyperfocusBridge(
  onTick?: () => void,
  durationMs = 300000,
): Promise<() => void> {
  let elapsed = 0;
  let interval = 30000;
  let cancelled = false;

  const run = async () => {
    while (!cancelled && elapsed < durationMs) {
      await new Promise((r) => setTimeout(r, interval));
      if (cancelled) break;
      elapsed += interval;
      const intensity =
        elapsed < durationMs * 0.3
          ? Haptics.ImpactFeedbackStyle.Soft
          : elapsed < durationMs * 0.7
            ? Haptics.ImpactFeedbackStyle.Light
            : Haptics.ImpactFeedbackStyle.Medium;
      await Haptics.impactAsync(intensity);
      interval = Math.max(5000, interval - 2000);
      onTick?.();
    }
  };

  run();
  return () => {
    cancelled = true;
  };
}

export async function gentleAlert(): Promise<void> {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
  await new Promise((r) => setTimeout(r, 200));
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
}
