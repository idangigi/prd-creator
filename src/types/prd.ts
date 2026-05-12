export type Lang = 'en' | 'he';

export interface AC {
  given: string;
  when: string;
  then: string;
}

export interface StoryImage {
  id: string;
  name: string;
  url: string;
  label: string;
  mimeType: string;
}

export interface Story {
  persona: string;
  action: string;
  benefit: string;
  acs: AC[];
  images: StoryImage[];
}

export interface EdgeCase {
  scenario: string;
  behavior: string;
  errorMsg: string;
}

export interface ScopeItem {
  item: string;
}

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface PRDData {
  stories: Story[];
  edge: EdgeCase[];
  scope: ScopeItem[];
  files: AttachedFile[];
  featureName: string;
  what: string;
  why: string;
  who: string;
  api: string;
  db: string;
  integrations: string;
  figma: string;
  screens: string;
}

export interface FieldDef {
  id: string;
  label: string;
  type: 'text' | 'textarea';
  placeholder: string;
  required: boolean;
  maxLength: number;
  rows?: number;
}

export interface SectionDef {
  id: string;
  title: string;
  note?: string;
  isStories?: boolean;
  isFiles?: boolean;
  dynamic?: boolean;
  itemLabel?: string;
  addLabel?: string;
  prefix?: string | null;
  minItems?: number;
  fields?: FieldDef[];
}

export type ErrorMap = Record<string, string>;

export type ExportFormat = 'docx' | 'txt';
