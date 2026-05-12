import { useState } from 'react';
import type {
  AC, AttachedFile, ErrorMap, PRDData, SectionDef, Story, StoryImage,
} from '../types/prd';
import { initData, newAC, newStory } from '../utils/initData';

export interface PRDDataController {
  data: PRDData;
  errors: ErrorMap;
  setErrors: (errors: ErrorMap) => void;
  clearError: (key: string) => void;

  updateField: (fieldId: string, value: string) => void;
  updateDynamic: (sectionId: keyof PRDData, index: number, fieldId: string, value: string) => void;
  addItem: (sectionId: keyof PRDData, section: SectionDef) => void;
  removeItem: (sectionId: keyof PRDData, index: number) => void;

  updateStory: (si: number, field: keyof Omit<Story, 'acs' | 'images'>, value: string) => void;
  addStory: () => void;
  removeStory: (si: number) => void;

  updateAC: (si: number, ai: number, field: keyof AC, value: string) => void;
  addAC: (si: number) => void;
  removeAC: (si: number, ai: number) => void;

  addStoryImages: (si: number, files: FileList) => void;
  removeStoryImage: (si: number, imgId: string) => void;
  updateStoryImageLabel: (si: number, imgId: string, label: string) => void;

  addFiles: (fileList: FileList) => void;
  removeFile: (id: string) => void;
}

export function usePRDData(): PRDDataController {
  const [data, setData] = useState<PRDData>(initData);
  const [errors, setErrors] = useState<ErrorMap>({});

  const clearError = (key: string) => setErrors(e => {
    if (!(key in e)) return e;
    const n = { ...e };
    delete n[key];
    return n;
  });

  const updateField = (fieldId: string, value: string) => {
    setData(d => ({ ...d, [fieldId]: value }));
    clearError(fieldId);
  };

  const updateDynamic = (sectionId: keyof PRDData, index: number, fieldId: string, value: string) => {
    setData(d => {
      const arr = [...(d[sectionId] as unknown as Record<string, string>[])];
      arr[index] = { ...arr[index], [fieldId]: value };
      return { ...d, [sectionId]: arr };
    });
    clearError(`${sectionId}_${index}_${fieldId}`);
  };

  const addItem = (sectionId: keyof PRDData, section: SectionDef) => {
    const ni: Record<string, string> = {};
    section.fields?.forEach(f => { ni[f.id] = ''; });
    setData(d => ({ ...d, [sectionId]: [...(d[sectionId] as object[]), ni] }));
  };

  const removeItem = (sectionId: keyof PRDData, index: number) =>
    setData(d => ({ ...d, [sectionId]: (d[sectionId] as object[]).filter((_, i) => i !== index) }));

  const updateStory = (si: number, field: keyof Omit<Story, 'acs' | 'images'>, value: string) => {
    setData(d => {
      const s = [...d.stories];
      s[si] = { ...s[si], [field]: value };
      return { ...d, stories: s };
    });
    clearError(`story_${si}_${field}`);
  };

  const addStory = () => setData(d => ({ ...d, stories: [...d.stories, newStory()] }));
  const removeStory = (si: number) =>
    setData(d => ({ ...d, stories: d.stories.filter((_, i) => i !== si) }));

  const updateAC = (si: number, ai: number, field: keyof AC, value: string) => {
    setData(d => {
      const s = [...d.stories];
      const acs = [...s[si].acs];
      acs[ai] = { ...acs[ai], [field]: value };
      s[si] = { ...s[si], acs };
      return { ...d, stories: s };
    });
    clearError(`ac_${si}_${ai}_${field}`);
  };

  const addAC = (si: number) => setData(d => {
    const s = [...d.stories];
    s[si] = { ...s[si], acs: [...s[si].acs, newAC()] };
    return { ...d, stories: s };
  });

  const removeAC = (si: number, ai: number) => setData(d => {
    const s = [...d.stories];
    s[si] = { ...s[si], acs: s[si].acs.filter((_, i) => i !== ai) };
    return { ...d, stories: s };
  });

  const addStoryImages = (si: number, files: FileList) => {
    const newImages: StoryImage[] = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .map(f => ({
        id: Math.random().toString(36).slice(2),
        name: f.name,
        url: URL.createObjectURL(f),
        label: '',
        mimeType: f.type,
      }));
    if (newImages.length === 0) return;
    setData(d => {
      const s = [...d.stories];
      s[si] = { ...s[si], images: [...(s[si].images || []), ...newImages] };
      return { ...d, stories: s };
    });
  };

  const removeStoryImage = (si: number, imgId: string) => {
    setData(d => {
      const s = [...d.stories];
      const img = s[si].images?.find(i => i.id === imgId);
      if (img) URL.revokeObjectURL(img.url);
      s[si] = { ...s[si], images: (s[si].images || []).filter(i => i.id !== imgId) };
      return { ...d, stories: s };
    });
  };

  const updateStoryImageLabel = (si: number, imgId: string, label: string) => {
    setData(d => {
      const s = [...d.stories];
      s[si] = {
        ...s[si],
        images: (s[si].images || []).map(i => i.id === imgId ? { ...i, label } : i),
      };
      return { ...d, stories: s };
    });
  };

  const addFiles = (fileList: FileList) => {
    const newFiles: AttachedFile[] = Array.from(fileList).map(f => ({
      id: Math.random().toString(36).slice(2),
      name: f.name,
      size: f.size,
      type: f.type,
      url: URL.createObjectURL(f),
    }));
    setData(d => ({ ...d, files: [...d.files, ...newFiles] }));
  };

  const removeFile = (id: string) => {
    setData(d => {
      const file = d.files.find(f => f.id === id);
      if (file) URL.revokeObjectURL(file.url);
      return { ...d, files: d.files.filter(f => f.id !== id) };
    });
  };

  return {
    data,
    errors,
    setErrors,
    clearError,
    updateField,
    updateDynamic,
    addItem,
    removeItem,
    updateStory,
    addStory,
    removeStory,
    updateAC,
    addAC,
    removeAC,
    addStoryImages,
    removeStoryImage,
    updateStoryImageLabel,
    addFiles,
    removeFile,
  };
}
