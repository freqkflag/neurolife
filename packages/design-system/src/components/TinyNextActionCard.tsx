import type { CSSProperties } from 'react';
import { formatTinyAction } from '@neurolife/shared';
import { themes, type ThemeName } from '../tokens/colors';

interface TinyNextActionCardProps {
  action: string;
  label?: string;
  theme?: ThemeName;
  style?: CSSProperties;
}

export function TinyNextActionCard({
  action,
  label = 'Your next tiny action',
  theme = 'mutedDark',
  style,
}: TinyNextActionCardProps) {
  const colors = themes[theme];

  return (
    <div
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
        padding: 20,
        ...style,
      }}
    >
      <p
        style={{
          color: colors.textMuted,
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: 8,
        }}
      >
        {label}
      </p>
      <p
        style={{
          color: colors.text,
          fontSize: 18,
          lineHeight: 1.6,
          fontWeight: 500,
          margin: 0,
        }}
      >
        {formatTinyAction(action)}
      </p>
    </div>
  );
}
