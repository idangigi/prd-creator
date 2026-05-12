import { useState } from 'react';
import type { CSSProperties } from 'react';
import { C } from '../../constants/designTokens';

interface AcceptanceCriterionFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | boolean;
  mob?: boolean;
  errorText?: string;
}

export function AcceptanceCriterionField({
  label,
  placeholder,
  value,
  onChange,
  error,
  mob,
  errorText = 'Required',
}: AcceptanceCriterionFieldProps) {
  const [focused, setFocused] = useState(false);

  const base: CSSProperties = {
    width: '100%',
    padding: mob ? '8px 10px' : '7px 10px',
    fontSize: mob ? 13 : 12.5,
    border: `1px solid ${error ? C.danger : focused ? C.text : C.border}`,
    borderRadius: 4,
    outline: 'none',
    background: C.surface,
    color: C.text,
    transition: 'border-color 120ms ease, box-shadow 120ms ease',
    boxShadow: focused ? '0 0 0 2px rgba(10,10,10,0.05)' : 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    WebkitAppearance: 'none',
    appearance: 'none',
    lineHeight: 1.5,
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: mob ? '46px 1fr' : '52px 1fr', gap: 10, alignItems: 'start', marginBottom: 8 }}>
      <span style={{
        fontSize: 10.5,
        fontWeight: 600,
        color: C.textMuted,
        paddingTop: 8,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        {label}
      </span>
      <div>
        <textarea
          value={value}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          style={base}
        />
        {error && <div style={{ fontSize: 10.5, color: C.danger, marginTop: 4 }}>{errorText}</div>}
      </div>
    </div>
  );
}
