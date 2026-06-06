import type { CSSProperties } from 'react';
import { escapeHatchLabels } from '../a11y/rules';
import { themes, type ThemeName } from '../tokens/colors';

interface PauseButtonProps {
  onPause?: () => void;
  onNotNow?: () => void;
  onDelay?: () => void;
  theme?: ThemeName;
  style?: CSSProperties;
}

export function PauseButton({
  onPause,
  onNotNow,
  onDelay,
  theme = 'mutedDark',
  style,
}: PauseButtonProps) {
  const colors = themes[theme];

  const buttonStyle: CSSProperties = {
    backgroundColor: 'transparent',
    border: `1px solid ${colors.border}`,
    color: colors.textMuted,
    padding: '8px 16px',
    borderRadius: 8,
    fontSize: 14,
    cursor: 'pointer',
  };

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', ...style }}>
      {onPause && (
        <button type="button" style={buttonStyle} onClick={onPause}>
          {escapeHatchLabels.pause}
        </button>
      )}
      {onNotNow && (
        <button type="button" style={buttonStyle} onClick={onNotNow}>
          {escapeHatchLabels.notNow}
        </button>
      )}
      {onDelay && (
        <button type="button" style={buttonStyle} onClick={onDelay}>
          {escapeHatchLabels.delay5m}
        </button>
      )}
    </div>
  );
}
