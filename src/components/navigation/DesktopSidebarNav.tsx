import { C } from '../../constants/designTokens';
import type { SectionDef } from '../../types/prd';

interface DesktopSidebarNavProps {
  sections: SectionDef[];
  activeSection: string;
  onSelect: (id: string) => void;
  sectionsLabel: string;
  hasErrors: (section: SectionDef) => boolean;
}

export function DesktopSidebarNav({
  sections,
  activeSection,
  onSelect,
  sectionsLabel,
  hasErrors,
}: DesktopSidebarNavProps) {
  return (
    <aside style={{ width: 220, flexShrink: 0 }}>
      <div style={{ position: 'sticky', top: 80 }}>
        <div style={{
          fontSize: 11,
          fontWeight: 500,
          color: C.textFaint,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          padding: '0 10px',
          marginBottom: 10,
        }}>
          {sectionsLabel}
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
                  gap: 10,
                  padding: '7px 10px',
                  borderRadius: 5,
                  background: isActive ? C.hover : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 120ms ease',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = C.hover; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{
                  fontSize: 11,
                  color: isActive ? C.text : C.textFaint,
                  fontWeight: 500,
                  fontFamily: "'JetBrains Mono', monospace",
                  minWidth: 20,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  0{i + 1}
                </span>
                <span style={{
                  flex: 1,
                  fontSize: 13,
                  color: isActive ? C.text : C.textMuted,
                  fontWeight: isActive ? 500 : 400,
                  letterSpacing: '-0.005em',
                }}>
                  {s.title}
                </span>
                {hasErr && <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.danger }} />}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
