import type { ErrorMap, PRDData, SectionDef } from '../types/prd';

export function validate(data: PRDData, sections: SectionDef[]): ErrorMap {
  const errs: ErrorMap = {};
  sections.forEach(s => {
    if (s.isStories) {
      data.stories.forEach((story, si) => {
        (['persona', 'action', 'benefit'] as const).forEach(f => {
          if (!story[f]?.trim()) errs[`story_${si}_${f}`] = 'Required';
        });
        story.acs.forEach((ac, ai) => {
          (['given', 'when', 'then'] as const).forEach(f => {
            if (!ac[f]?.trim()) errs[`ac_${si}_${ai}_${f}`] = 'Required';
          });
        });
      });
    } else if (s.dynamic) {
      (data[s.id as keyof PRDData] as unknown as Record<string, string>[]).forEach((item, i) => {
        s.fields?.forEach(f => {
          if (f.required && !item[f.id]?.trim()) errs[`${s.id}_${i}_${f.id}`] = 'Required';
        });
      });
    } else {
      s.fields?.forEach(f => {
        if (f.required && !(data[f.id as keyof PRDData] as string)?.trim()) {
          errs[f.id] = 'Required';
        }
      });
    }
  });
  return errs;
}

export function sectionHasErrors(
  section: SectionDef,
  data: PRDData,
  errors: ErrorMap,
): boolean {
  if (section.isStories) {
    return data.stories.some((story, si) =>
      ['persona', 'action', 'benefit'].some(f => errors[`story_${si}_${f}`]) ||
      story.acs.some((_, ai) => ['given', 'when', 'then'].some(f => errors[`ac_${si}_${ai}_${f}`])),
    );
  }
  if (section.dynamic) {
    return (data[section.id as keyof PRDData] as unknown as Record<string, string>[]).some(
      (_, i) => section.fields?.some(f => errors[`${section.id}_${i}_${f.id}`]),
    );
  }
  return section.fields?.some(f => errors[f.id]) ?? false;
}

export function findFirstErrorSection(
  sections: SectionDef[],
  data: PRDData,
  errors: ErrorMap,
): SectionDef | undefined {
  return sections.find(s => sectionHasErrors(s, data, errors));
}
