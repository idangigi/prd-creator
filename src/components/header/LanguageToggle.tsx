import { C } from '../../constants/designTokens';
import type { Lang } from '../../types/prd';

interface LanguageToggleProps {
  lang: Lang;
  onChange: (lang: Lang) => void;
}

const LANGS: { value: Lang; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'he', label: 'עב' },
];

export function LanguageToggle({ lang, onChange }: LanguageToggleProps) {
  return (
    <div style={{
      display: 'flex',
      border: `1px solid ${C.border}`,
      borderRadius: 5,
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {LANGS.map(l => (
        <button
          key={l.value}
          onClick={() => onChange(l.value)}
          style={{
            padding: '5px 9px',
            fontSize: 11,
            fontWeight: 600,
            background: lang === l.value ? C.accent : 'transparent',
            color: lang === l.value ? C.accentText : C.textMuted,
            border: 'none',
            cursor: 'pointer',
            letterSpacing: '0.04em',
            transition: 'background 120ms ease, color 120ms ease',
          }}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
