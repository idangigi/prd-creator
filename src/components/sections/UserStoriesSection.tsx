import { Button } from '../buttons/Button';
import { PlusIcon } from '../icons/PlusIcon';
import { StoryCard } from './StoryCard';
import type { Translation } from '../../constants/translations';
import type { AC, ErrorMap, Story } from '../../types/prd';

interface UserStoriesSectionProps {
  stories: Story[];
  ui: Translation;
  isRtl: boolean;
  mob: boolean;
  errors: ErrorMap;
  submitted: boolean;
  onUpdateStory: (si: number, field: keyof Omit<Story, 'acs' | 'images'>, value: string) => void;
  onAddStory: () => void;
  onRemoveStory: (si: number) => void;
  onUpdateAC: (si: number, ai: number, field: keyof AC, value: string) => void;
  onAddAC: (si: number) => void;
  onRemoveAC: (si: number, ai: number) => void;
  onAddStoryImages: (si: number, files: FileList) => void;
  onRemoveStoryImage: (si: number, imgId: string) => void;
  onUpdateStoryImageLabel: (si: number, imgId: string, label: string) => void;
}

export function UserStoriesSection({
  stories,
  ui,
  isRtl,
  mob,
  errors,
  submitted,
  onUpdateStory,
  onAddStory,
  onRemoveStory,
  onUpdateAC,
  onAddAC,
  onRemoveAC,
  onAddStoryImages,
  onRemoveStoryImage,
  onUpdateStoryImageLabel,
}: UserStoriesSectionProps) {
  return (
    <div>
      {stories.map((story, si) => (
        <StoryCard
          key={si}
          index={si}
          story={story}
          totalStories={stories.length}
          ui={ui}
          isRtl={isRtl}
          mob={mob}
          errors={errors}
          submitted={submitted}
          onUpdateStory={(field, value) => onUpdateStory(si, field, value)}
          onRemoveStory={() => onRemoveStory(si)}
          onUpdateAC={(ai, field, value) => onUpdateAC(si, ai, field, value)}
          onAddAC={() => onAddAC(si)}
          onRemoveAC={ai => onRemoveAC(si, ai)}
          onAddImages={files => onAddStoryImages(si, files)}
          onRemoveImage={imgId => onRemoveStoryImage(si, imgId)}
          onUpdateImageLabel={(imgId, label) => onUpdateStoryImageLabel(si, imgId, label)}
        />
      ))}
      <Button
        variant="dashed"
        size="md"
        onClick={onAddStory}
        style={{ width: '100%', height: mob ? 44 : 38 }}
      >
        <PlusIcon /> {ui.addStory}
      </Button>
    </div>
  );
}
