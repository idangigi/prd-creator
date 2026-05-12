import { C } from '../../constants/designTokens';

interface ProgressBarProps {
  progress: number;
  isRtl: boolean;
}

export function ProgressBar({ progress, isRtl }: ProgressBarProps) {
  return (
    <div style={{ height: 1, background: C.border, position: 'relative' }}>
      <div style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        ...(isRtl ? { right: 0 } : { left: 0 }),
        width: `${progress}%`,
        background: C.text,
        transition: 'width 280ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      }} />
    </div>
  );
}
