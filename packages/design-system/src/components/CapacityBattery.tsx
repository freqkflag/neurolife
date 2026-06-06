import type { CSSProperties } from 'react';
import { capacityLabel } from '@neurolife/shared';
import { themes, type ThemeName } from '../tokens/colors';

interface CapacityBatteryProps {
  score: number;
  theme?: ThemeName;
  style?: CSSProperties;
}

export function CapacityBattery({ score, theme = 'mutedDark', style }: CapacityBatteryProps) {
  const colors = themes[theme];
  const clamped = Math.max(0, Math.min(100, score));

  return (
    <div style={{ ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ color: colors.text, fontSize: 14, fontWeight: 500 }}>Capacity</span>
        <span style={{ color: colors.textMuted, fontSize: 14 }}>{clamped}%</span>
      </div>
      <div
        style={{
          height: 12,
          backgroundColor: colors.surfaceRaised,
          borderRadius: 6,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${clamped}%`,
            backgroundColor: clamped < 30 ? colors.warning : colors.accent,
            borderRadius: 6,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <p style={{ color: colors.textMuted, fontSize: 12, marginTop: 6, lineHeight: 1.6 }}>
        {capacityLabel(clamped)}
      </p>
    </div>
  );
}
