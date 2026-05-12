import { useRef } from 'react';
import { Button } from '../buttons/Button';
import { ImageIcon } from '../icons/ImageIcon';
import { StoryImageThumbnail } from './StoryImageThumbnail';
import { C } from '../../constants/designTokens';
import type { StoryImage } from '../../types/prd';

interface StoryImagesGridProps {
  images: StoryImage[];
  storyImagesLabel: string;
  addImageLabel: string;
  imageLabelPlaceholder: string;
  mob: boolean;
  onAddFiles: (files: FileList) => void;
  onRemoveImage: (imgId: string) => void;
  onUpdateLabel: (imgId: string, label: string) => void;
}

export function StoryImagesGrid({
  images,
  storyImagesLabel,
  addImageLabel,
  imageLabelPlaceholder,
  mob,
  onAddFiles,
  onRemoveImage,
  onUpdateLabel,
}: StoryImagesGridProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const hasImages = images.length > 0;

  return (
    <div style={{ padding: mob ? '4px 14px 16px' : '4px 18px 16px' }}>
      <input
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        ref={inputRef}
        onChange={e => {
          if (e.target.files) onAddFiles(e.target.files);
          e.currentTarget.value = '';
        }}
      />
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: hasImages ? 10 : 0,
      }}>
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          color: C.textFaint,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {storyImagesLabel}
        </span>
        <Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()}>
          <ImageIcon /> {addImageLabel}
        </Button>
      </div>
      {hasImages && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: mob ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: 8,
        }}>
          {images.map(img => (
            <StoryImageThumbnail
              key={img.id}
              image={img}
              labelPlaceholder={imageLabelPlaceholder}
              onLabelChange={label => onUpdateLabel(img.id, label)}
              onRemove={() => onRemoveImage(img.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
