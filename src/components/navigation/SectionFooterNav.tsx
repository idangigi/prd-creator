import { Button } from '../buttons/Button';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { ArrowRightIcon } from '../icons/ArrowRightIcon';
import { DownloadIcon } from '../icons/DownloadIcon';
import { C } from '../../constants/designTokens';
import type { Translation } from '../../constants/translations';

interface SectionFooterNavProps {
  ui: Translation;
  currentIndex: number;
  totalSections: number;
  isRtl: boolean;
  isLast: boolean;
  exporting: boolean;
  onBack: () => void;
  onNext: () => void;
  onExport: () => void;
}

export function SectionFooterNav({
  ui,
  currentIndex,
  totalSections,
  isRtl,
  isLast,
  exporting,
  onBack,
  onNext,
  onExport,
}: SectionFooterNavProps) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 32,
      paddingTop: 18,
      borderTop: `1px solid ${C.borderSubtle}`,
    }}>
      <Button
        variant="outline"
        size="md"
        onClick={onBack}
        disabled={currentIndex === 0}
      >
        {isRtl ? <ArrowRightIcon /> : <ArrowLeftIcon />} {ui.back}
      </Button>
      <span style={{
        fontSize: 12,
        color: C.textFaint,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {String(currentIndex + 1).padStart(2, '0')} / {String(totalSections).padStart(2, '0')}
      </span>
      {!isLast ? (
        <Button variant="primary" size="md" onClick={onNext}>
          {ui.next} {isRtl ? <ArrowLeftIcon /> : <ArrowRightIcon />}
        </Button>
      ) : (
        <Button variant="primary" size="md" onClick={onExport} disabled={exporting}>
          {exporting ? '...' : <><DownloadIcon /> {ui.exportBtn}</>}
        </Button>
      )}
    </div>
  );
}
