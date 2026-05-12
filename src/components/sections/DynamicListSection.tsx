import { Button } from '../buttons/Button';
import { PlusIcon } from '../icons/PlusIcon';
import { DynamicItemCard } from './DynamicItemCard';
import type { ErrorMap, PRDData, SectionDef } from '../../types/prd';

interface DynamicListSectionProps {
  section: SectionDef;
  data: PRDData;
  errors: ErrorMap;
  submitted: boolean;
  fieldRequiredText: string;
  removeLabel: string;
  itemFallbackLabel: string;
  mob: boolean;
  onItemChange: (sectionId: keyof PRDData, index: number, fieldId: string, value: string) => void;
  onAddItem: (sectionId: keyof PRDData, section: SectionDef) => void;
  onRemoveItem: (sectionId: keyof PRDData, index: number) => void;
}

export function DynamicListSection({
  section,
  data,
  errors,
  submitted,
  fieldRequiredText,
  removeLabel,
  itemFallbackLabel,
  mob,
  onItemChange,
  onAddItem,
  onRemoveItem,
}: DynamicListSectionProps) {
  const sectionKey = section.id as keyof PRDData;
  const items = data[sectionKey] as unknown as Record<string, string>[];
  const minItems = section.minItems || 1;

  return (
    <div>
      {items.map((item, idx) => (
        <DynamicItemCard
          key={idx}
          sectionId={section.id}
          index={idx}
          prefix={section.prefix}
          itemFallbackLabel={itemFallbackLabel}
          fields={section.fields || []}
          values={item}
          canRemove={items.length > minItems}
          errors={errors}
          submitted={submitted}
          fieldRequiredText={fieldRequiredText}
          removeLabel={removeLabel}
          mob={mob}
          onChange={(fieldId, value) => onItemChange(sectionKey, idx, fieldId, value)}
          onRemove={() => onRemoveItem(sectionKey, idx)}
        />
      ))}
      <Button
        variant="dashed"
        size="md"
        onClick={() => onAddItem(sectionKey, section)}
        style={{ width: '100%', height: mob ? 44 : 38 }}
      >
        <PlusIcon /> {section.addLabel}
      </Button>
    </div>
  );
}
