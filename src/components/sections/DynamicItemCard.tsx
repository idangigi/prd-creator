import { Button } from '../buttons/Button';
import { FormFieldInput } from '../inputs/FormFieldInput';
import { TrashIcon } from '../icons/TrashIcon';
import { C } from '../../constants/designTokens';
import type { FieldDef } from '../../types/prd';

interface DynamicItemCardProps {
  sectionId: string;
  index: number;
  prefix: string | null | undefined;
  itemFallbackLabel: string;
  fields: FieldDef[];
  values: Record<string, string>;
  canRemove: boolean;
  errors: Record<string, string>;
  submitted: boolean;
  fieldRequiredText: string;
  removeLabel: string;
  mob: boolean;
  onChange: (fieldId: string, value: string) => void;
  onRemove: () => void;
}

export function DynamicItemCard({
  sectionId,
  index,
  prefix,
  itemFallbackLabel,
  fields,
  values,
  canRemove,
  errors,
  submitted,
  fieldRequiredText,
  removeLabel,
  mob,
  onChange,
  onRemove,
}: DynamicItemCardProps) {
  const itemTag = prefix
    ? `${prefix}-${String(index + 1).padStart(2, '0')}`
    : `${itemFallbackLabel} ${String(index + 1).padStart(2, '0')}`;

  return (
    <div style={{
      border: `1px solid ${C.border}`,
      borderRadius: 6,
      padding: mob ? '14px 14px 2px' : '20px 20px 4px',
      marginBottom: 12,
      background: C.surface,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
      }}>
        <span style={{
          fontSize: 12,
          fontWeight: 600,
          color: C.text,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {itemTag}
        </span>
        {canRemove && (
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <TrashIcon /> {removeLabel}
          </Button>
        )}
      </div>
      {fields.map(field => (
        <FormFieldInput
          key={field.id}
          field={field}
          value={values[field.id] || ''}
          onChange={v => onChange(field.id, v)}
          error={submitted && errors[`${sectionId}_${index}_${field.id}`]}
          errorText={fieldRequiredText}
          inputId={`${sectionId}_${index}_${field.id}`}
          mob={mob}
        />
      ))}
    </div>
  );
}
