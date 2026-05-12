import type { AC, PRDData, Story } from '../types/prd';

export const newAC = (): AC => ({ given: '', when: '', then: '' });

export const newStory = (): Story => ({
  persona: '',
  action: '',
  benefit: '',
  acs: [newAC()],
  images: [],
});

export function initData(): PRDData {
  return {
    stories: [newStory()],
    edge: [{ scenario: '', behavior: '', errorMsg: '' }],
    scope: [{ item: '' }],
    files: [],
    featureName: '',
    what: '',
    why: '',
    who: '',
    api: '',
    db: '',
    integrations: '',
    figma: '',
    screens: '',
  };
}
