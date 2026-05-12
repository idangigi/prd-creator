import { Button } from '../buttons/Button';
import { DocIcon } from '../icons/DocIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { C } from '../../constants/designTokens';
import { formatFileSize } from '../../utils/formatFileSize';
import type { AttachedFile } from '../../types/prd';

interface FileListItemProps {
  file: AttachedFile;
  removeLabel: string;
  mob: boolean;
  onRemove: () => void;
}

export function FileListItem({ file, removeLabel, mob, onRemove }: FileListItemProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: mob ? '10px 12px' : '10px 16px',
      border: `1px solid ${C.border}`,
      borderRadius: 6,
      background: C.surface,
    }}>
      <span style={{ color: C.textMuted, display: 'inline-flex', flexShrink: 0 }}>
        <DocIcon />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <a
          href={file.url}
          download={file.name}
          onClick={e => e.stopPropagation()}
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: C.text,
            textDecoration: 'none',
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {file.name}
        </a>
        <span style={{ fontSize: 11, color: C.textFaint }}>{formatFileSize(file.size)}</span>
      </div>
      <Button variant="ghost" size="sm" onClick={onRemove}>
        <TrashIcon /> {removeLabel}
      </Button>
    </div>
  );
}
