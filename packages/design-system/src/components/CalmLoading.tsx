import type { CSSProperties } from 'react';
import { themes, type ThemeName } from '../tokens/colors';

interface CalmLoadingProps {
  message?: string;
  theme?: ThemeName;
  style?: CSSProperties;
}

export function CalmLoading({
  message = 'Taking a moment…',
  theme = 'mutedDark',
  style,
}: CalmLoadingProps) {
  const colors = themes[theme];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        padding: 24,
        ...style,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          border: `2px solid ${colors.border}`,
          borderTopColor: colors.accent,
          borderRadius: '50%',
          animation: 'spin 1.2s linear infinite',
        }}
      />
      <p style={{ color: colors.textMuted, fontSize: 14, margin: 0 }}>{message}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
