import { useState } from 'react';
import type { CSSProperties } from 'react';
import { C } from '../../constants/designTokens';
import type { FieldDef } from '../../types/prd';

interface FormFieldInputProps {
  field: FieldDef;
  value: string;
  onChange: (value: string) => void;
  error?: string | boolean;
  inputId?: string;
  mob?: boolean;
  errorText?: string;
}

export function FormFieldInput({
  field,
  value,
  onChange,
  error,
  inputId,
  mob,
  errorText = 'This field is required.',
}: FormFieldInputProps) {
  const id = inputId || field.id;
  const [focused, setFocused] = useState(false);

  const baseInput: CSSProperties = {
    width: '100%',
    padding: mob ? '10px 12px' : '8px 11px',
    fontSize: mob ? 14 : 13,
    border: `1px solid ${error ? C.danger : focused ? C.text : C.border}`,
    borderRadius: 5,
    outline: 'none',
    background: C.surface,
    color: C.text,
    transition: 'border-color 120ms ease, box-shadow 120ms ease',
    boxShadow: focused ? `0 0 0 3px ${error ? 'rgba(220,38,38,0.08)' : 'rgba(10,10,10,0.06)'}` : 'none',
    resize: field.type === 'textarea' ? 'vertical' : undefined,
    lineHeight: 1.55,
    fontFamily: 'inherit',
    WebkitAppearance: 'none',
    appearance: 'none',
    boxSizing: 'border-box',
  };

  const overLimit = field.maxLength && value.length > field.maxLength * 0.85;

  return (
    <div style={{ marginBottom: mob ? 14 : 18 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6, gap: 8 }}>
        <label htmlFor={id} style={{ fontSize: mob ? 12 : 14, fontWeight: 500, color: C.text, letterSpacing: '-0.005em' }}>
          {field.label}
          {field.required && <span style={{ color: C.textFaint, marginLeft: 4, fontWeight: 400 }}>*</span>}
        </label>
        {field.maxLength && !mob && (
          <span style={{ fontSize: 11, color: overLimit ? C.textMuted : C.textFaint, fontVariantNumeric: 'tabular-nums' }}>
            {value.length}/{field.maxLength}
          </span>
        )}
      </div>
      {field.type === 'textarea' ? (
        <textarea
          id={id}
          value={value}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          rows={mob ? Math.max(2, (field.rows || 3) - 1) : (field.rows || 3)}
          style={baseInput}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          style={baseInput}
        />
      )}
      {error && <div style={{ fontSize: 11, color: C.danger, marginTop: 5 }}>{errorText}</div>}
    </div>
  );
}
