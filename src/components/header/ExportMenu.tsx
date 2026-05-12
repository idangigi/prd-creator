import { useRef, useState } from 'react';
import { Button } from '../buttons/Button';
import { CheckIcon } from '../icons/CheckIcon';
import { ChevronIcon } from '../icons/ChevronIcon';
import { DocIcon } from '../icons/DocIcon';
import { DownloadIcon } from '../icons/DownloadIcon';
import { C } from '../../constants/designTokens';
import type { Translation } from '../../constants/translations';
import type { ExportFormat } from '../../types/prd';
import { useClickOutside } from '../../hooks/useClickOutside';

interface ExportMenuProps {
  ui: Translation;
  mob: boolean;
  exporting: boolean;
  exportDone: boolean;
  onExport: (format: ExportFormat) => void;
}

export function ExportMenu({ ui, mob, exporting, exportDone, onExport }: ExportMenuProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useClickOutside(exportMenuRef, () => setShowExportMenu(false));

  const options: { fmt: ExportFormat; label: string; sub: string }[] = [
    { fmt: 'docx', label: ui.exportDocx, sub: ui.microsoftWord },
    { fmt: 'txt', label: ui.exportTxt, sub: ui.plainText },
  ];

  return (
    <div ref={exportMenuRef} style={{ position: 'relative', display: 'flex' }}>
      <Button
        variant="primary"
        size="md"
        onClick={() => onExport('docx')}
        disabled={exporting}
        style={{
          borderRadius: 0,
          borderStartStartRadius: 5,
          borderEndStartRadius: 5,
          borderInlineEnd: '1px solid rgba(255,255,255,0.15)',
          minWidth: mob ? 90 : 110,
        }}
      >
        {exporting ? '...' : exportDone ? <><CheckIcon /> {ui.saved}</> : <><DownloadIcon /> {ui.exportBtn}</>}
      </Button>
      <Button
        variant="primary"
        size="md"
        onClick={() => setShowExportMenu(o => !o)}
        disabled={exporting}
        style={{
          borderRadius: 0,
          borderStartEndRadius: 5,
          borderEndEndRadius: 5,
          padding: '0 8px',
          minWidth: 0,
        }}
      >
        <span style={{
          transform: showExportMenu ? 'rotate(180deg)' : 'none',
          transition: 'transform 120ms ease',
          display: 'inline-flex',
        }}>
          <ChevronIcon />
        </span>
      </Button>
      {showExportMenu && (
        <div style={{
          position: 'absolute',
          insetInlineEnd: 0,
          top: 'calc(100% + 6px)',
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 6,
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          minWidth: 180,
          zIndex: 200,
          overflow: 'hidden',
          padding: 4,
        }}>
          {options.map(it => (
            <button
              key={it.fmt}
              onClick={() => { onExport(it.fmt); setShowExportMenu(false); }}
              style={{
                width: '100%',
                padding: '8px 10px',
                background: 'transparent',
                border: 'none',
                borderRadius: 4,
                textAlign: 'start',
                cursor: 'pointer',
                color: C.text,
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                fontSize: 13,
                fontWeight: 500,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = C.hover)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ color: C.textMuted, display: 'inline-flex' }}><DocIcon /></span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span>{it.label}</span>
                <span style={{ fontSize: 11, color: C.textFaint, fontWeight: 400 }}>{it.sub}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
