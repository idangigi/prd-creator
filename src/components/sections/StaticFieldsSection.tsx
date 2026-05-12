import { FormFieldInput } from '../inputs/FormFieldInput';
import type { ErrorMap, FieldDef, PRDData } from '../../types/prd';

interface StaticFieldsSectionProps {
  fields: FieldDef[];
  data: PRDData;
  errors: ErrorMap;
  submitted: boolean;
  fieldRequiredText: string;
  mob: boolean;
  onChange: (fieldId: string, value: string) => void;
}

export function StaticFieldsSection({
  fields,
  data,
  errors,
  submitted,
  fieldRequiredText,
  mob,
  onChange,
}: StaticFieldsSectionProps) {
  return (
    <>
      {fields.map(field => (
        <FormFieldInput
          key={field.id}
          field={field}
          value={(data[field.id as keyof PRDData] as string) || ''}
          onChange={v => onChange(field.id, v)}
          error={submitted && errors[field.id]}
          errorText={fieldRequiredText}
          mob={mob}
        />
      ))}
    </>
  );
}
