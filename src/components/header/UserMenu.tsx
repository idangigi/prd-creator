import { useRef, useState } from 'react';
import { DocIcon } from '../icons/DocIcon';
import { CheckIcon } from '../icons/CheckIcon';
import { C } from '../../constants/designTokens';
import { useAuth } from '../../contexts/AuthContext';
import { useClickOutside } from '../../hooks/useClickOutside';
import type { Translation } from '../../constants/translations';
import type { ExportFormat } from '../../types/prd';

interface UserMenuProps {
  ui: Translation;
  exporting: boolean;
  exportDone: boolean;
  onExport: (format: ExportFormat) => void;
}

export function UserMenu({ ui, exporting, exportDone, onExport }: UserMenuProps) {
  const { signOut, user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false));

  const initial = user?.email?.[0]?.toUpperCase() ?? '?';

  const exportOptions: { fmt: ExportFormat; label: string; sub: string }[] = [
    { fmt: 'docx', label: ui.exportDocx, sub: ui.microsoftWord },
    { fmt: 'txt', label: ui.exportTxt, sub: ui.plainText },
  ];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        title={user?.email}
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: open ? C.text : C.hover,
          color: open ? C.accentText : C.textMuted,
          border: `1px solid ${open ? C.text : C.border}`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 700,
          transition: 'background 120ms, color 120ms, border-color 120ms',
          flexShrink: 0,
        }}
      >
        {exportDone ? <CheckIcon /> : initial}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          insetInlineEnd: 0,
          top: 'calc(100% + 8px)',
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          minWidth: 200,
          zIndex: 200,
          overflow: 'hidden',
          padding: 4,
        }}>
          <div style={{
            padding: '8px 10px 10px',
            borderBottom: `1px solid ${C.borderSubtle}`,
            marginBottom: 4,
          }}>
            <div style={{ fontSize: 11, color: C.textFaint, marginBottom: 1 }}>Signed in as</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: C.textMuted, wordBreak: 'break-all' }}>{user?.email}</div>
          </div>

          {exportOptions.map(it => (
            <button
              key={it.fmt}
              disabled={exporting}
              onClick={() => { onExport(it.fmt); setOpen(false); }}
              style={{
                width: '100%',
                padding: '8px 10px',
                background: 'transparent',
                border: 'none',
                borderRadius: 4,
                textAlign: 'start',
                cursor: exporting ? 'not-allowed' : 'pointer',
                color: exporting ? C.textFaint : C.text,
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                fontSize: 13,
                fontWeight: 500,
              }}
              onMouseEnter={e => { if (!exporting) e.currentTarget.style.background = C.hover; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ color: C.textMuted, display: 'inline-flex' }}><DocIcon /></span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span>{it.label}</span>
                <span style={{ fontSize: 11, color: C.textFaint, fontWeight: 400 }}>{it.sub}</span>
              </span>
            </button>
          ))}

          <div style={{ borderTop: `1px solid ${C.borderSubtle}`, margin: '4px 0' }} />

          <button
            onClick={() => { signOut(); setOpen(false); }}
            style={{
              width: '100%',
              padding: '8px 10px',
              background: 'transparent',
              border: 'none',
              borderRadius: 4,
              textAlign: 'start',
              cursor: 'pointer',
              color: C.danger,
              fontSize: 13,
              fontWeight: 500,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = C.hover)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
