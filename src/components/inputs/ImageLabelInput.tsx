import { C } from '../../constants/designTokens';

interface ImageLabelInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength?: number;
}

export function ImageLabelInput({ value, onChange, placeholder, maxLength = 80 }: ImageLabelInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      style={{
        width: '100%',
        border: 'none',
        outline: 'none',
        background: 'transparent',
        fontSize: 11,
        color: C.textMuted,
        padding: 0,
        fontFamily: 'inherit',
        boxSizing: 'border-box',
      }}
    />
  );
}
