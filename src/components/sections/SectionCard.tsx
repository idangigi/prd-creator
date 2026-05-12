import type { ReactNode } from 'react';
import { C } from '../../constants/designTokens';

interface SectionCardProps {
  index: number;
  title: string;
  note?: string;
  mob: boolean;
  children: ReactNode;
}

export function SectionCard({ index, title, note, mob, children }: SectionCardProps) {
  return (
    <section style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 6,
      padding: mob ? '20px 16px' : '36px 40px',
    }}>
      <div style={{ marginBottom: 26, paddingBottom: 18, borderBottom: `1px solid ${C.borderSubtle}` }}>
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 12,
          marginBottom: note ? 8 : 0,
        }}>
          <span style={{
            fontSize: 11,
            fontWeight: 500,
            color: C.textFaint,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.04em',
          }}>
            0{index + 1}
          </span>
          <h1 style={{
            margin: 0,
            fontSize: mob ? 18 : 22,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: C.text,
          }}>
            {title}
          </h1>
        </div>
        {note && (
          <p style={{ margin: '6px 0 0 28px', fontSize: 13, color: C.textSubtle, lineHeight: 1.5 }}>
            {note}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}
