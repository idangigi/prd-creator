import { useRef, useState } from 'react';
import { UploadIcon } from '../icons/UploadIcon';
import { C } from '../../constants/designTokens';

interface FileDropZoneProps {
  uploadLabel: string;
  uploadSubLabel: string;
  mob: boolean;
  onFiles: (files: FileList) => void;
}

export function FileDropZone({ uploadLabel, uploadSubLabel, mob, onFiles }: FileDropZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={e => {
          if (e.target.files) onFiles(e.target.files);
          e.currentTarget.value = '';
        }}
      />
      <div
        onDragEnter={() => setDragOver(true)}
        onDragLeave={() => setDragOver(false)}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault();
          setDragOver(false);
          onFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? C.text : C.borderStrong}`,
          borderRadius: 8,
          padding: mob ? '28px 16px' : '36px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragOver ? C.hover : C.bg,
          transition: 'border-color 120ms ease, background 120ms ease',
          marginBottom: 16,
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 10,
          color: dragOver ? C.text : C.textMuted,
        }}>
          <UploadIcon />
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 4 }}>
          {uploadLabel}
        </div>
        <div style={{ fontSize: 12, color: C.textFaint }}>{uploadSubLabel}</div>
      </div>
    </>
  );
}
