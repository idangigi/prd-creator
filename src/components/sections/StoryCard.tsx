import { Button } from '../buttons/Button';
import { TrashIcon } from '../icons/TrashIcon';
import { FormFieldInput } from '../inputs/FormFieldInput';
import { AcceptanceCriterionList } from './AcceptanceCriterionList';
import { StoryImagesGrid } from './StoryImagesGrid';
import { C } from '../../constants/designTokens';
import type { Translation } from '../../constants/translations';
import type { AC, ErrorMap, Story } from '../../types/prd';

interface StoryCardProps {
  index: number;
  story: Story;
  totalStories: number;
  ui: Translation;
  isRtl: boolean;
  mob: boolean;
  errors: ErrorMap;
  submitted: boolean;
  onUpdateStory: (field: keyof Omit<Story, 'acs' | 'images'>, value: string) => void;
  onRemoveStory: () => void;
  onUpdateAC: (acIndex: number, field: keyof AC, value: string) => void;
  onAddAC: () => void;
  onRemoveAC: (acIndex: number) => void;
  onAddImages: (files: FileList) => void;
  onRemoveImage: (imgId: string) => void;
  onUpdateImageLabel: (imgId: string, label: string) => void;
}

export function StoryCard({
  index,
  story,
  totalStories,
  ui,
  isRtl,
  mob,
  errors,
  submitted,
  onUpdateStory,
  onRemoveStory,
  onUpdateAC,
  onAddAC,
  onRemoveAC,
  onAddImages,
  onRemoveImage,
  onUpdateImageLabel,
}: StoryCardProps) {
  const storyFields: { id: keyof Omit<Story, 'acs' | 'images'>; label: string; placeholder: string; maxLength: number }[] = [
    { id: 'persona', label: ui.asA, placeholder: ui.storyPersonaPlaceholder, maxLength: 60 },
    { id: 'action', label: ui.iWantTo, placeholder: ui.storyActionPlaceholder, maxLength: 120 },
    { id: 'benefit', label: ui.soThat, placeholder: ui.storyBenefitPlaceholder, maxLength: 150 },
  ];

  return (
    <div style={{
      border: `1px solid ${C.border}`,
      borderRadius: 6,
      marginBottom: 16,
      overflow: 'hidden',
      background: C.surface,
    }}>
      <div style={{
        borderBottom: `1px solid ${C.borderSubtle}`,
        padding: mob ? '10px 14px' : '11px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#FCFCFC',
      }}>
        <span style={{
          fontSize: 12,
          fontWeight: 600,
          color: C.text,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '-0.01em',
        }}>
          US-{String(index + 1).padStart(2, '0')}
        </span>
        {totalStories > 1 && (
          <Button variant="ghost" size="sm" onClick={onRemoveStory}>
            <TrashIcon /> {ui.remove}
          </Button>
        )}
      </div>
      <div style={{ padding: mob ? '16px 14px 4px' : '20px 18px 4px' }}>
        {storyFields.map(f => (
          <FormFieldInput
            key={f.id}
            field={{
              id: f.id,
              label: f.label,
              type: 'text',
              placeholder: f.placeholder,
              required: true,
              maxLength: f.maxLength,
            }}
            value={story[f.id] || ''}
            onChange={v => onUpdateStory(f.id, v)}
            error={submitted && errors[`story_${index}_${f.id}`]}
            errorText={ui.fieldRequired}
            mob={mob}
          />
        ))}
      </div>

      <AcceptanceCriterionList
        storyIndex={index}
        acs={story.acs}
        ui={ui}
        isRtl={isRtl}
        mob={mob}
        errors={errors}
        submitted={submitted}
        onUpdateAC={onUpdateAC}
        onAddAC={onAddAC}
        onRemoveAC={onRemoveAC}
      />

      <StoryImagesGrid
        images={story.images || []}
        storyImagesLabel={ui.storyImages}
        addImageLabel={ui.addImage}
        imageLabelPlaceholder={ui.imageLabelPlaceholder}
        mob={mob}
        onAddFiles={onAddImages}
        onRemoveImage={onRemoveImage}
        onUpdateLabel={onUpdateImageLabel}
      />
    </div>
  );
}
