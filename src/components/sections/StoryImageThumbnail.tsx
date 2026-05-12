import { ImageLabelInput } from '../inputs/ImageLabelInput';
import { C } from '../../constants/designTokens';
import type { StoryImage } from '../../types/prd';

interface StoryImageThumbnailProps {
  image: StoryImage;
  labelPlaceholder: string;
  onLabelChange: (label: string) => void;
  onRemove: () => void;
}

export function StoryImageThumbnail({
  image,
  labelPlaceholder,
  onLabelChange,
  onRemove,
}: StoryImageThumbnailProps) {
  return (
    <div style={{
      border: `1px solid ${C.border}`,
      borderRadius: 5,
      overflow: 'hidden',
      background: C.bg,
    }}>
      <div style={{ position: 'relative', height: 90, background: C.borderSubtle }}>
        <img
          src={image.url}
          alt={image.label || image.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <button
          onClick={onRemove}
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            background: 'rgba(0,0,0,0.45)',
            border: 'none',
            borderRadius: 3,
            color: '#fff',
            width: 18,
            height: 18,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            lineHeight: 1,
            padding: 0,
            fontWeight: 400,
          }}
        >
          ×
        </button>
      </div>
      <div style={{ padding: '5px 7px' }}>
        <ImageLabelInput
          value={image.label}
          onChange={onLabelChange}
          placeholder={labelPlaceholder}
        />
      </div>
    </div>
  );
}
