import { CheckIcon } from '../icons/CheckIcon';
import { C } from '../../constants/designTokens';
import type { SectionDef } from '../../types/prd';

interface MobileDrawerNavProps {
  sections: SectionDef[];
  activeSection: string;
  onSelect: (id: string) => void;
  hasErrors: (section: SectionDef) => boolean;
}

export function MobileDrawerNav({
  sections,
  activeSection,
  onSelect,
  hasErrors,
}: MobileDrawerNavProps) {
  return (
    <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
      {sections.map((s, i) => {
        const isActive = s.id === activeSection;
        const hasErr = hasErrors(s);
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '13px 18px',
              background: isActive ? C.hover : 'transparent',
              border: 'none',
              borderBottom: `1px solid ${C.borderSubtle}`,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <span style={{
              fontSize: 11,
              fontWeight: 500,
              color: isActive ? C.text : C.textFaint,
              fontFamily: "'JetBrains Mono', monospace",
              minWidth: 22,
            }}>
              0{i + 1}
            </span>
            <span style={{
              flex: 1,
              fontSize: 13,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? C.text : C.textMuted,
            }}>
              {s.title}
            </span>
            {hasErr && <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.danger }} />}
            {isActive && <span style={{ color: C.text, display: 'inline-flex' }}><CheckIcon /></span>}
          </button>
        );
      })}
    </div>
  );
}
