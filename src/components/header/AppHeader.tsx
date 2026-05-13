import { MenuIcon } from '../icons/MenuIcon';
import { XIcon } from '../icons/XIcon';
import { LanguageToggle } from './LanguageToggle';
import { ExportMenu } from './ExportMenu';
import { ProgressBar } from './ProgressBar';
import { C } from '../../constants/designTokens';
import { useAuth } from '../../contexts/AuthContext';
import type { Translation } from '../../constants/translations';
import type { ExportFormat, Lang } from '../../types/prd';

interface AppHeaderProps {
  ui: Translation;
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  mob: boolean;
  menuOpen: boolean;
  onMenuToggle: () => void;
  currentIndex: number;
  totalSections: number;
  currentSectionTitle: string;
  exporting: boolean;
  exportDone: boolean;
  onExport: (format: ExportFormat) => void;
  progress: number;
  isRtl: boolean;
}

export function AppHeader({
  ui,
  lang,
  onLangChange,
  mob,
  menuOpen,
  onMenuToggle,
  currentIndex,
  totalSections,
  currentSectionTitle,
  exporting,
  exportDone,
  onExport,
  progress,
  isRtl,
}: AppHeaderProps) {
  const { signOut, user } = useAuth();

  return (
    <header style={{
      background: 'rgba(250,250,250,0.85)',
      backdropFilter: 'saturate(180%) blur(8px)',
      WebkitBackdropFilter: 'saturate(180%) blur(8px)',
      borderBottom: `1px solid ${C.border}`,
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1180,
        margin: '0 auto',
        padding: mob ? '11px 16px' : '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {mob && (
            <button
              onClick={onMenuToggle}
              style={{
                background: 'transparent',
                border: `1px solid ${C.border}`,
                borderRadius: 5,
                width: 30,
                height: 30,
                color: C.text,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {menuOpen ? <XIcon /> : <MenuIcon />}
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 22,
              height: 22,
              background: C.text,
              color: '#fff',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: '-0.02em',
            }}>F</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>Fattal</span>
              <span style={{ fontSize: 13, color: C.textFaint, fontWeight: 400 }}>/ {ui.subtitle}</span>
            </div>
          </div>
        </div>

        {!mob && (
          <div style={{ fontSize: 12, color: C.textSubtle, fontVariantNumeric: 'tabular-nums' }}>
            {ui.step} <span style={{ color: C.text, fontWeight: 500 }}>{currentIndex + 1}</span>
            <span style={{ color: C.textFaint }}> {ui.of} {totalSections}</span>
            <span style={{ color: C.textFaint, padding: '0 8px' }}>·</span>
            <span>{currentSectionTitle}</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LanguageToggle lang={lang} onChange={onLangChange} />
          <ExportMenu
            ui={ui}
            mob={mob}
            exporting={exporting}
            exportDone={exportDone}
            onExport={onExport}
          />
          <button
            onClick={signOut}
            title={user?.email}
            style={{
              background: 'transparent',
              border: `1px solid ${C.border}`,
              borderRadius: 5,
              padding: '4px 10px',
              fontSize: 12,
              color: C.textSubtle,
              cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      <ProgressBar progress={progress} isRtl={isRtl} />
    </header>
  );
}
