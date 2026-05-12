import type { PRDData } from '../types/prd';
import { formatFileSize } from '../utils/formatFileSize';

export function generateTxt(data: PRDData): string {
  let text = `FATTAL HOTELS - PRD\n${'='.repeat(50)}\nFeature: ${data.featureName}\nDate: ${new Date().toLocaleDateString('en-GB')}\n\n`;
  text += `1. FEATURE BRIEF\n${'-'.repeat(30)}\nWhat: ${data.what}\nWhy: ${data.why}\nWho: ${data.who}\n\n`;
  text += `2. USER STORIES & AC\n${'-'.repeat(30)}\n`;
  data.stories.forEach((s, si) => {
    text += `\nUS-${String(si + 1).padStart(2, '0')}: As a ${s.persona}, I want to ${s.action}, so that ${s.benefit}.\n  Definition of Done:\n`;
    s.acs.forEach((ac, ai) => {
      text += `  AC-${String(ai + 1).padStart(2, '00')}: Given: ${ac.given} | When: ${ac.when} | Then: ${ac.then}\n`;
    });
    if (s.images && s.images.length > 0) {
      text += `  Images:\n`;
      s.images.forEach(img => {
        text += `    - ${img.name}${img.label ? ` (${img.label})` : ''}\n`;
      });
    }
  });
  text += `\n3. EDGE CASES\n${'-'.repeat(30)}\n`;
  (data.edge || []).forEach((e, i) => {
    text += `EC-${String(i + 1).padStart(2, '0')}: ${e.scenario}\n  Expected: ${e.behavior}\n${e.errorMsg ? `  Error: "${e.errorMsg}"\n` : ''}`;
  });
  text += `\n4. TECHNICAL NOTES\n${'-'.repeat(30)}\nAPI: ${data.api}\nDB: ${data.db}\nIntegrations: ${data.integrations}\n`;
  text += `\n5. PROJECT SCOPE\n${'-'.repeat(30)}\n`;
  (data.scope || []).forEach(s => {
    text += `- ${s.item}\n`;
  });
  text += `\n6. DESIGN LINKS\n${'-'.repeat(30)}\nFigma: ${data.figma}\nScreens: ${data.screens}\n`;
  text += `\n7. REFERENCE FILES\n${'-'.repeat(30)}\n`;
  if (data.files && data.files.length > 0) {
    data.files.forEach(f => {
      text += `- ${f.name} (${formatFileSize(f.size)})\n`;
    });
  } else {
    text += 'No files attached.\n';
  }
  return text;
}

export function downloadTxt(data: PRDData): void {
  const text = generateTxt(data);
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Fattal-PRD-${(data.featureName || 'Feature').replace(/\s+/g, '-')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
