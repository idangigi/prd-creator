import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, LevelFormat, ImageRun,
} from 'docx';
import type { PRDData, Story } from '../types/prd';
import { formatFileSize } from '../utils/formatFileSize';

export async function generateDocx(data: PRDData): Promise<Blob> {
  const BLUE = '1A3C6E', MID = '2E75B6', LBLUE = 'EBF2FA', RED_C = 'C0392B';
  const BDR = { style: BorderStyle.SINGLE, size: 1, color: 'C8D9ED' } as const;
  const ACBDR = { style: BorderStyle.SINGLE, size: 1, color: 'B8D4F0' } as const;
  const AB = { top: BDR, bottom: BDR, left: BDR, right: BDR };
  const ACB = { top: ACBDR, bottom: ACBDR, left: ACBDR, right: ACBDR };
  const W = 9360;
  const M = { top: 90, bottom: 90, left: 140, right: 140 };
  const AM = { top: 70, bottom: 70, left: 120, right: 120 };
  const sp = (b: number, a: number) => ({ spacing: { before: b, after: a } });
  const sp2 = () => new Paragraph({ spacing: { before: 100, after: 100 }, children: [new TextRun('')] });
  const sp1 = () => new Paragraph({ spacing: { before: 50, after: 50 }, children: [new TextRun('')] });

  const h1 = (text: string) => new Paragraph({
    ...sp(400, 120),
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: BLUE, space: 4 } },
    children: [new TextRun({ text, bold: true, size: 30, color: BLUE, font: 'Calibri' })],
  });
  const lbl = (text: string, req?: boolean) => new Paragraph({
    ...sp(160, 40),
    children: [
      new TextRun({ text, bold: true, size: 20, color: BLUE, font: 'Calibri' }),
      ...(req ? [new TextRun({ text: '  *', bold: true, size: 20, color: RED_C })] : []),
    ],
  });
  const noteBox = (text: string) => new Paragraph({
    ...sp(40, 100),
    shading: { fill: LBLUE, type: ShadingType.CLEAR },
    indent: { left: 160, right: 160 },
    children: [new TextRun({ text: '* ' + text, size: 18, italics: true, color: BLUE, font: 'Calibri' })],
  });
  const ruleBox = (text: string) => new Paragraph({
    ...sp(0, 80),
    shading: { fill: 'FFF5F5', type: ShadingType.CLEAR },
    children: [new TextRun({ text: '! ' + text, size: 18, italics: true, color: RED_C, font: 'Calibri' })],
  });
  const blankLine = (hint: string) => new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: [W],
    rows: [new TableRow({ children: [new TableCell({
      borders: AB,
      shading: { fill: 'FAFCFF', type: ShadingType.CLEAR },
      margins: M,
      width: { size: W, type: WidthType.DXA },
      children: [new Paragraph({ ...sp(60, 60), children: [new TextRun({ text: hint || '', size: 20, italics: true, color: 'BBBBBB', font: 'Calibri' })] })],
    })] })],
  });

  const docxImageTypeMap: Record<string, 'png' | 'jpg' | 'gif' | 'bmp'> = {
    'image/png': 'png', 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/gif': 'gif', 'image/bmp': 'bmp',
  };

  const storyBlock = async (story: Story, si: number) => {
    const c1 = Math.round(W * 0.14), c2 = W - c1;
    const storyRows = ['As a', 'I want to', 'So that'].map((lbTxt, li) => new TableRow({ children: [
      new TableCell({ borders: AB, shading: { fill: LBLUE, type: ShadingType.CLEAR }, margins: M, width: { size: c1, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: lbTxt, bold: true, size: 18, color: BLUE, font: 'Calibri' })] })] }),
      new TableCell({ borders: AB, shading: { fill: 'FAFCFF', type: ShadingType.CLEAR }, margins: M, width: { size: c2, type: WidthType.DXA }, children: [new Paragraph({ ...sp(50, 50), children: [new TextRun({ text: [story.persona, story.action, story.benefit][li] || '', size: 20, font: 'Calibri' })] })] }),
    ]}));

    const acLW = Math.round(W * 0.10), acVW = W - acLW;
    const acRowFn = (rowLbl: string, val: string) => new TableRow({ children: [
      new TableCell({ borders: ACB, shading: { fill: 'D6E8FA', type: ShadingType.CLEAR }, margins: AM, width: { size: acLW, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: rowLbl, bold: true, size: 17, color: MID, font: 'Calibri' })] })] }),
      new TableCell({ borders: ACB, shading: { fill: 'F4F9FF', type: ShadingType.CLEAR }, margins: AM, width: { size: acVW, type: WidthType.DXA }, children: [new Paragraph({ ...sp(40, 40), children: [new TextRun({ text: val || '', size: 18, font: 'Calibri' })] })] }),
    ]});

    const acBlocks = story.acs.flatMap((ac, ai) => [
      new Paragraph({ ...sp(60, 30), children: [new TextRun({ text: 'AC-' + String(ai + 1).padStart(2, '0'), bold: true, size: 19, color: MID, font: 'Calibri' })] }),
      new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [acLW, acVW], rows: [acRowFn('Given', ac.given), acRowFn('When', ac.when), acRowFn('Then', ac.then)] }),
      sp1(),
    ]);

    const imageBlocks: Paragraph[] = [];
    if (story.images && story.images.length > 0) {
      imageBlocks.push(new Paragraph({ ...sp(100, 40), shading: { fill: 'D6E8FA', type: ShadingType.CLEAR }, children: [new TextRun({ text: '  STORY IMAGES', bold: true, size: 18, color: MID, font: 'Calibri' })] }));
      for (const img of story.images) {
        const imgType = docxImageTypeMap[img.mimeType];
        if (!imgType) {
          imageBlocks.push(new Paragraph({ ...sp(30, 30), children: [new TextRun({ text: `[Image: ${img.name}${img.label ? ` — ${img.label}` : ''}]`, size: 18, italics: true, color: '888888', font: 'Calibri' })] }));
          continue;
        }
        try {
          const resp = await fetch(img.url);
          const buf = await resp.arrayBuffer();
          const imgEl = new Image();
          await new Promise<void>(res => { imgEl.onload = () => res(); imgEl.onerror = () => res(); imgEl.src = img.url; });
          const maxW = 400;
          const scale = imgEl.naturalWidth > 0 ? Math.min(1, maxW / imgEl.naturalWidth) : 1;
          const w = Math.round((imgEl.naturalWidth || 400) * scale);
          const h = Math.round((imgEl.naturalHeight || 300) * scale);
          if (img.label) {
            imageBlocks.push(new Paragraph({ ...sp(30, 8), children: [new TextRun({ text: img.label, size: 18, italics: true, color: '555555', font: 'Calibri' })] }));
          }
          imageBlocks.push(new Paragraph({ ...sp(8, 30), children: [new ImageRun({ data: buf, transformation: { width: w, height: h } })] }));
        } catch {
          imageBlocks.push(new Paragraph({ ...sp(30, 30), children: [new TextRun({ text: `[Image: ${img.name}${img.label ? ` — ${img.label}` : ''}]`, size: 18, italics: true, color: '888888', font: 'Calibri' })] }));
        }
      }
    }

    return [
      new Paragraph({ ...sp(200, 40), children: [new TextRun({ text: 'US-' + String(si + 1).padStart(2, '0'), bold: true, size: 24, color: BLUE, font: 'Calibri' })] }),
      new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [c1, c2], rows: storyRows }),
      new Paragraph({ ...sp(120, 40), shading: { fill: 'D6E8FA', type: ShadingType.CLEAR }, children: [new TextRun({ text: '  v DEFINITION OF DONE   Acceptance Criteria - Given / When / Then', bold: true, size: 18, color: MID, font: 'Calibri' })] }),
      ...acBlocks,
      ...imageBlocks,
      sp2(),
    ];
  };

  const edgeW = [Math.round(W * 0.38), Math.round(W * 0.38), W - Math.round(W * 0.38) * 2];
  const edgeRows = (data.edge || []).map((e, i) => new TableRow({ children: [e.scenario, e.behavior, e.errorMsg || ''].map((v, ci) =>
    new TableCell({ borders: AB, shading: { fill: i % 2 === 0 ? 'FFFFFF' : 'F5F8FB', type: ShadingType.CLEAR }, margins: M, width: { size: edgeW[ci], type: WidthType.DXA }, children: [new Paragraph({ ...sp(80, 80), children: [new TextRun({ text: v, size: 20, font: 'Calibri' })] })] })
  )}));
  const edgeHeaderRow = new TableRow({ tableHeader: true, children: ['Scenario', 'Expected Behavior', 'Error Message (if any)'].map((h, i) =>
    new TableCell({ borders: AB, shading: { fill: BLUE, type: ShadingType.CLEAR }, margins: M, width: { size: edgeW[i], type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, color: 'FFFFFF', font: 'Calibri' })] })] })
  )});
  const edgeTable = new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: edgeW, rows: [edgeHeaderRow, ...edgeRows] });

  const techRow = (labelText: string, val: string, req?: boolean) => {
    const c1 = Math.round(W * 0.22), c2 = W - c1;
    return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [c1, c2], rows: [new TableRow({ children: [
      new TableCell({ borders: AB, shading: { fill: LBLUE, type: ShadingType.CLEAR }, margins: M, width: { size: c1, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: labelText + (req ? ' *' : ''), bold: true, size: 19, color: BLUE, font: 'Calibri' })] })] }),
      new TableCell({ borders: AB, shading: { fill: 'FAFCFF', type: ShadingType.CLEAR }, margins: M, width: { size: c2, type: WidthType.DXA }, children: [new Paragraph({ ...sp(50, 50), children: [new TextRun({ text: val || '', size: 20, font: 'Calibri' })] })] }),
    ]})] });
  };

  const metaTable = (k: string, v: string, i: number) => {
    const c1 = Math.round(W * 0.28), c2 = W - c1;
    return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [c1, c2], rows: [new TableRow({ children: [
      new TableCell({ borders: AB, shading: { fill: i % 2 === 0 ? LBLUE : 'F5F8FB', type: ShadingType.CLEAR }, margins: M, width: { size: c1, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: k, bold: true, size: 20, font: 'Calibri', color: BLUE })] })] }),
      new TableCell({ borders: AB, shading: { fill: i % 2 === 0 ? 'FAFCFF' : 'F5F8FB', type: ShadingType.CLEAR }, margins: M, width: { size: c2, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: v, size: 20, font: 'Calibri', color: '333333' })] })] }),
    ]})] });
  };

  const doc = new Document({
    styles: { default: { document: { run: { font: 'Calibri', size: 22 } } } },
    numbering: { config: [{ reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }] },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1260, right: 1260, bottom: 1260, left: 1260 } } },
      children: [
        new Paragraph({ spacing: { before: 600, after: 60 }, children: [new TextRun({ text: 'FATTAL HOTELS', bold: true, size: 56, font: 'Calibri', color: BLUE })] }),
        new Paragraph({ spacing: { before: 0, after: 40 }, children: [new TextRun({ text: 'Product Requirements Document', size: 30, font: 'Calibri', color: '555555' })] }),
        new Paragraph({ spacing: { before: 0, after: 500 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BLUE, space: 6 } }, children: [new TextRun({ text: 'Minimal - Structured - Mandatory', size: 22, font: 'Calibri', color: MID, italics: true })] }),
        ...[
          ['Feature Name', data.featureName || '[Feature Name]'],
          ['Date', new Date().toLocaleDateString('en-GB')],
          ['Platform', 'Web + Mobile (iOS / Android)'],
          ['Status', 'Draft'],
        ].map(([k, v], i) => metaTable(k, v, i)),
        sp2(), sp2(),
        h1('1. Feature Brief'),
        noteBox('All fields mandatory.'),
        sp2(),
        lbl('Feature Name', true), blankLine(data.featureName || 'e.g. Guest Room Upgrade Request'), sp2(),
        lbl('What is it?', true), blankLine(data.what || 'What does this feature do?'), sp2(),
        lbl('Why are we building it?', true), blankLine(data.why || 'Business reason or user problem it solves.'), sp2(),
        lbl('Who is it for?', true), blankLine(data.who || 'e.g. Hotel guests, Front desk staff'), sp2(),
        h1('2. User Stories & Acceptance Criteria'),
        noteBox('Each story includes its own Definition of Done (Acceptance Criteria).'),
        ruleBox('All story rows are mandatory. Every story must have at least one AC.'),
        sp2(),
        ...(await Promise.all(data.stories.map((story, si) => storyBlock(story, si)))).flat(),
        h1('3. Edge Cases'),
        noteBox('Minimum 2 edge cases required.'),
        sp2(),
        edgeTable,
        sp2(),
        h1('4. Technical Notes'),
        sp2(),
        techRow('API / Endpoints', data.api, true), sp2(),
        techRow('DB / Schema changes', data.db), sp2(),
        techRow('3rd-party integrations', data.integrations), sp2(),
        h1('5. Project Scope'),
        noteBox('At least 1 item mandatory.'),
        sp2(),
        ...(data.scope || []).map(s => new Paragraph({ numbering: { reference: 'bullets', level: 0 }, ...sp(60, 60), children: [new TextRun({ text: s.item || '[Scope item]', size: 20, font: 'Calibri' })] })),
        sp2(),
        h1('6. Design Links'),
        sp2(),
        lbl('Figma / Design file URL', true), blankLine(data.figma || 'https://figma.com/...'), sp2(),
        lbl('Screen names included', true), blankLine(data.screens || 'List screen names from the mockup, one per line.'),
        sp2(),
        h1('7. Reference Files'),
        noteBox('Files attached to this PRD for reference.'),
        sp2(),
        ...(data.files && data.files.length > 0
          ? data.files.map(f => new Paragraph({ numbering: { reference: 'bullets', level: 0 }, ...sp(60, 60), children: [new TextRun({ text: `${f.name}  (${formatFileSize(f.size)})`, size: 20, font: 'Calibri' })] }))
          : [new Paragraph({ ...sp(60, 60), children: [new TextRun({ text: 'No files attached.', size: 20, font: 'Calibri', italics: true, color: '888888' })] })]),
        sp2(),
        new Paragraph({ spacing: { before: 300, after: 0 }, border: { top: { style: BorderStyle.SINGLE, size: 4, color: BLUE, space: 4 } }, children: [new TextRun({ text: 'Fattal Hotels - Internal Use Only - PM + Tech Lead sign-off required before dev start', size: 17, font: 'Calibri', color: '888888', italics: true })] }),
      ],
    }],
  });

  return Packer.toBlob(doc);
}

export async function downloadDocx(data: PRDData): Promise<void> {
  const blob = await generateDocx(data);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Fattal-PRD-${(data.featureName || 'Feature').replace(/\s+/g, '-')}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
