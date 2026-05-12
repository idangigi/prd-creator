import { FileDropZone } from './FileDropZone';
import { FileListItem } from './FileListItem';
import { C } from '../../constants/designTokens';
import type { AttachedFile } from '../../types/prd';

interface ReferenceFilesSectionProps {
  files: AttachedFile[];
  uploadLabel: string;
  uploadSubLabel: string;
  filesNoneLabel: string;
  removeLabel: string;
  mob: boolean;
  onAddFiles: (files: FileList) => void;
  onRemoveFile: (id: string) => void;
}

export function ReferenceFilesSection({
  files,
  uploadLabel,
  uploadSubLabel,
  filesNoneLabel,
  removeLabel,
  mob,
  onAddFiles,
  onRemoveFile,
}: ReferenceFilesSectionProps) {
  return (
    <div>
      <FileDropZone
        uploadLabel={uploadLabel}
        uploadSubLabel={uploadSubLabel}
        mob={mob}
        onFiles={onAddFiles}
      />
      {files.length === 0 && (
        <p style={{ textAlign: 'center', fontSize: 12, color: C.textFaint, margin: '0 0 16px' }}>
          {filesNoneLabel}
        </p>
      )}
      {files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 4 }}>
          {files.map(file => (
            <FileListItem
              key={file.id}
              file={file}
              removeLabel={removeLabel}
              mob={mob}
              onRemove={() => onRemoveFile(file.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
