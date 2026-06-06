import type { CSSProperties } from 'react';
import { sensoryLabel, SENSORY_HIGH_THRESHOLD } from '@neurolife/shared';
import { themes, type ThemeName } from '../tokens/colors';

interface SensoryLoadIndicatorProps {
  load: number;
  theme?: ThemeName;
  onDelay?: () => void;
  style?: CSSProperties;
}

export function SensoryLoadIndicator({
  load,
  theme = 'mutedDark',
  onDelay,
  style,
}: SensoryLoadIndicatorProps) {
  const colors = themes[theme];
  const clamped = Math.max(0, Math.min(100, load));
  const isHigh = clamped >= SENSORY_HIGH_THRESHOLD;

  return (
    <div style={{ ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ color: colors.text, fontSize: 14 }}>Sensory load</span>
        <span style={{ color: colors.textMuted, fontSize: 14 }}>{clamped}%</span>
      </div>
      <div
        style={{
          height: 8,
          backgroundColor: colors.surfaceRaised,
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${clamped}%`,
            backgroundColor: isHigh ? colors.warning : colors.accentSoft,
            borderRadius: 4,
          }}
        />
      </div>
      <p style={{ color: colors.textMuted, fontSize: 12, marginTop: 6 }}>{sensoryLabel(clamped)}</p>
      {isHigh && onDelay && (
        <button
          type="button"
          onClick={onDelay}
          style={{
            marginTop: 8,
            background: 'transparent',
            border: `1px solid ${colors.border}`,
            color: colors.textMuted,
            padding: '6px 12px',
            borderRadius: 6,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Delay by 5m
        </button>
      )}
    </div>
  );
}
