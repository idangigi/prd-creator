import { C } from '../../constants/designTokens';
import type { SectionDef } from '../../types/prd';

interface MobilePillNavProps {
  sections: SectionDef[];
  activeSection: string;
  onSelect: (id: string) => void;
  hasErrors: (section: SectionDef) => boolean;
}

export function MobilePillNav({
  sections,
  activeSection,
  onSelect,
  hasErrors,
}: MobilePillNavProps) {
  return (
    <div style={{
      display: 'flex',
      gap: 6,
      marginBottom: 14,
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
      paddingBottom: 4,
    }}>
      {sections.map((s, i) => {
        const isActive = s.id === activeSection;
        const hasErr = hasErrors(s);
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            style={{
              flexShrink: 0,
              padding: '6px 11px',
              borderRadius: 5,
              border: `1px solid ${isActive ? C.text : C.border}`,
              background: isActive ? C.text : C.surface,
              color: isActive ? '#fff' : C.textMuted,
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ fontFamily: "'JetBrains Mono', monospace", opacity: 0.7 }}>0{i + 1}</span>
            <span>{s.title}</span>
            {hasErr && <span style={{ width: 5, height: 5, borderRadius: '50%', background: isActive ? '#fff' : C.danger }} />}
          </button>
        );
      })}
    </div>
  );
}
