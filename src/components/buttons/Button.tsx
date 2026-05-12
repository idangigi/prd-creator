import type { ButtonHTMLAttributes, CSSProperties, MouseEventHandler, ReactNode } from 'react';
import { C } from '../../constants/designTokens';

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'subtle' | 'dashed';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style' | 'onClick'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  style?: CSSProperties;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

const SIZES: Record<ButtonSize, CSSProperties> = {
  sm: { padding: '5px 10px', fontSize: 12, height: 28 },
  md: { padding: '7px 13px', fontSize: 13, height: 32 },
  lg: { padding: '9px 15px', fontSize: 13, height: 36 },
};

const VARIANTS: Record<ButtonVariant, CSSProperties> = {
  primary: { background: C.accent, color: C.accentText, border: `1px solid ${C.accent}` },
  outline: { background: C.surface, color: C.text, border: `1px solid ${C.border}` },
  ghost: { background: 'transparent', color: C.textMuted, border: '1px solid transparent' },
  subtle: { background: C.surface, color: C.textMuted, border: `1px solid ${C.border}` },
  dashed: { background: 'transparent', color: C.textMuted, border: `1px dashed ${C.borderStrong}` },
};

const BASE: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  borderRadius: 5,
  fontWeight: 500,
  transition: 'background 120ms ease, border-color 120ms ease, color 120ms ease',
  whiteSpace: 'nowrap',
  letterSpacing: '-0.005em',
};

export function Button({
  variant = 'ghost',
  size = 'md',
  children,
  style = {},
  disabled,
  onClick,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        ...BASE,
        ...SIZES[size],
        ...VARIANTS[variant],
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
      onMouseEnter={e => {
        if (disabled) return;
        const el = e.currentTarget;
        if (variant === 'ghost' || variant === 'outline' || variant === 'subtle') el.style.background = C.hover;
        if (variant === 'dashed') { el.style.borderColor = C.text; el.style.color = C.text; }
        if (variant === 'primary') el.style.background = '#262626';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget;
        if (variant === 'ghost') el.style.background = 'transparent';
        if (variant === 'outline' || variant === 'subtle') el.style.background = C.surface;
        if (variant === 'dashed') { el.style.borderColor = C.borderStrong; el.style.color = C.textMuted; }
        if (variant === 'primary') el.style.background = C.accent;
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
