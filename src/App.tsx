import { useState, useEffect, useRef } from 'react';
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, LevelFormat,
} from 'docx';

// ── Language ───────────────────────────────────────────────────────
type Lang = 'en' | 'he';

const UI: Record<Lang, {
  subtitle: string; step: string; of: string; sectionsLabel: string;
  exportBtn: string; saved: string;
  exportDocx: string; microsoftWord: string; exportTxt: string; plainText: string;
  back: string; next: string;
  asA: string; iWantTo: string; soThat: string;
  storyPersonaPlaceholder: string; storyActionPlaceholder: string; storyBenefitPlaceholder: string;
  dod: string; acSubtitle: string; acHint: string;
  given: string; when: string; then: string;
  acGivenPlaceholder: string; acWhenPlaceholder: string; acThenPlaceholder: string;
  addAC: string; addStory: string; remove: string; item: string;
  fieldRequired: string; required: string; footer: string;
}> = {
  en: {
    subtitle: 'PRD Builder', step: 'Step', of: '/', sectionsLabel: 'Sections',
    exportBtn: 'Export', saved: 'Saved',
    exportDocx: 'Export as .docx', microsoftWord: 'Microsoft Word',
    exportTxt: 'Export as .txt', plainText: 'Plain text',
    back: 'Back', next: 'Next',
    asA: 'As a', iWantTo: 'I want to', soThat: 'So that',
    storyPersonaPlaceholder: 'e.g. hotel guest, front-desk agent, housekeeping supervisor',
    storyActionPlaceholder: 'e.g. request a room upgrade from my phone during check-in',
    storyBenefitPlaceholder: 'e.g. I can get a better room without waiting on hold with reception',
    dod: 'Definition of Done', acSubtitle: 'Acceptance Criteria · Given / When / Then',
    acHint: 'Describe a testable scenario. Given a starting condition, When something happens, Then the system behaves this way.',
    given: 'Given', when: 'When', then: 'Then',
    acGivenPlaceholder: 'e.g. a logged-in guest is on the reservation details screen',
    acWhenPlaceholder: 'e.g. they tap "Request Upgrade" and select a room type',
    acThenPlaceholder: 'e.g. a confirmation is shown and the front-desk receives a notification',
    addAC: 'Add Acceptance Criterion', addStory: 'Add User Story', remove: 'Remove', item: 'Item',
    fieldRequired: 'This field is required.', required: 'Required',
    footer: 'Internal Use · PM + Tech Lead sign-off required before dev start',
  },
  he: {
    subtitle: 'בונה PRD', step: 'שלב', of: 'מתוך', sectionsLabel: 'סעיפים',
    exportBtn: 'ייצוא', saved: 'נשמר',
    exportDocx: 'ייצוא כ-.docx', microsoftWord: 'Microsoft Word',
    exportTxt: 'ייצוא כ-.txt', plainText: 'טקסט רגיל',
    back: 'חזור', next: 'הבא',
    asA: 'בתור', iWantTo: 'אני רוצה ל', soThat: 'כדי ש',
    storyPersonaPlaceholder: 'לדוגמה: אורח מלון, עובד קבלה, מנהל קומות',
    storyActionPlaceholder: 'לדוגמה: לבקש שדרוג חדר מהטלפון שלי במהלך הצ\'ק-אין',
    storyBenefitPlaceholder: 'לדוגמה: אוכל לקבל חדר טוב יותר מבלי להמתין בקו עם הקבלה',
    dod: 'הגדרת סיום', acSubtitle: 'קריטריוני קבלה · בהינתן / כאשר / אז',
    acHint: 'תאר תרחיש הניתן לבדיקה. בהינתן תנאי התחלה, כאשר משהו קורה, אז המערכת מתנהגת כך.',
    given: 'בהינתן', when: 'כאשר', then: 'אז',
    acGivenPlaceholder: 'לדוגמה: אורח מחובר נמצא במסך פרטי ההזמנה שלו',
    acWhenPlaceholder: 'לדוגמה: הוא לוחץ על "בקש שדרוג" ובוחר סוג חדר',
    acThenPlaceholder: 'לדוגמה: מוצגת הודעת אישור וצוות הקבלה מקבל התראה',
    addAC: 'הוסף קריטריון קבלה', addStory: 'הוסף סיפור משתמש', remove: 'הסר', item: 'פריט',
    fieldRequired: 'שדה זה הינו חובה.', required: 'חובה',
    footer: 'לשימוש פנימי · נדרשת אישור PM ו-Tech Lead לפני תחילת פיתוח',
  },
};

// ── Design tokens ─────────────────────────────────────────────────
const C = {
  bg: '#FAFAFA',
  surface: '#FFFFFF',
  text: '#0A0A0A',
  textMuted: '#525252',
  textSubtle: '#737373',
  textFaint: '#A3A3A3',
  border: '#E5E5E5',
  borderStrong: '#D4D4D4',
  borderSubtle: '#EFEFEF',
  hover: '#F5F5F5',
  accent: '#0A0A0A',
  accentText: '#FFFFFF',
  danger: '#DC2626',
  acAccent: '#0A0A0A',
} as const;

// ── Data model ────────────────────────────────────────────────────
interface AC { given: string; when: string; then: string }
interface Story { persona: string; action: string; benefit: string; acs: AC[] }
interface EdgeCase { scenario: string; behavior: string; errorMsg: string }
interface ScopeItem { item: string }

interface PRDData {
  stories: Story[];
  edge: EdgeCase[];
  scope: ScopeItem[];
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

interface SectionDef {
  id: string;
  title: string;
  note?: string;
  isStories?: boolean;
  dynamic?: boolean;
  itemLabel?: string;
  addLabel?: string;
  prefix?: string | null;
  minItems?: number;
  fields?: FieldDef[];
}

interface FieldDef {
  id: string;
  label: string;
  type: 'text' | 'textarea';
  placeholder: string;
  required: boolean;
  maxLength: number;
  rows?: number;
}

function getSections(lang: Lang): SectionDef[] {
  const he = lang === 'he';
  return [
    {
      id: 'brief',
      title: he ? 'תקציר הפיצ\'ר' : 'Feature Brief',
      note: he
        ? 'נאום המעלית. שמור על תשובות קצרות — הן יהפכו לתיאור ה-Epic בג\'ירה.'
        : 'The elevator pitch. Keep each answer short — this becomes the Jira Epic description.',
      fields: [
        { id: 'featureName', label: he ? 'שם הפיצ\'ר' : 'Feature name', type: 'text', placeholder: he ? 'לדוגמה: בקשת שדרוג חדר אורח' : 'e.g. Guest Room Upgrade Request', required: true, maxLength: 80 },
        { id: 'what', label: he ? 'מה זה עושה?' : 'What does it do?', type: 'textarea', placeholder: he ? 'לדוגמה: מאפשר לאורחים לבקש שדרוג חדר מהטלפון במהלך הצ\'ק-אין, מבלי להתקשר לקבלה.' : 'e.g. Lets guests request a room upgrade from their phone during check-in, without calling the front desk.', required: true, maxLength: 200, rows: 2 },
        { id: 'why', label: he ? 'איזו בעיה זה פותר?' : 'What problem does it solve?', type: 'textarea', placeholder: he ? 'לדוגמה: אורחים מתקשרים לקבלה לבקשת שדרוגים — זה עמוס את הצוות בשעות עומס ומפחית הכנסות מ-upsell.' : 'e.g. Guests frequently call reception for upgrades, overloading staff during peak hours and reducing upsell opportunities.', required: true, maxLength: 300, rows: 3 },
        { id: 'who', label: he ? 'מי משתמש בזה?' : 'Who uses it?', type: 'text', placeholder: he ? 'לדוגמה: אורחי המלון (iOS ו-Android), עובדי קבלה' : 'e.g. Hotel guests (iOS & Android), Front-desk agents', required: true, maxLength: 120 },
      ],
    },
    {
      id: 'stories',
      title: he ? 'סיפורי משתמש וקריטריוני קבלה' : 'User Stories & AC',
      note: he
        ? 'סיפור אחד = משימת פיתוח אחת. פצל פיצ\'רים גדולים לסיפורים קטנים. כל סיפור צריך לפחות קריטריון קבלה אחד — זו הגדרת הסיום שלך.'
        : 'One story = one dev task. Split large features into smaller stories. Each story needs at least one AC — that\'s your definition of done for that task.',
      isStories: true,
    },
    {
      id: 'edge',
      title: he ? 'מקרי קצה' : 'Edge Cases',
      note: he
        ? 'אופציונלי אבל מומלץ. חשוב מה צריך לקרות כשדברים משתבשים או כשהקלט אינו צפוי.'
        : 'Optional but recommended. Think about what should happen when things go wrong or inputs are unexpected.',
      dynamic: true, itemLabel: he ? 'מקרה קצה' : 'Edge Case',
      addLabel: he ? 'הוסף מקרה קצה' : 'Add Edge Case',
      prefix: 'EC', minItems: 1,
      fields: [
        { id: 'scenario', label: he ? 'מה יכול להשתבש?' : 'What could go wrong?', type: 'text', placeholder: he ? 'לדוגמה: האורח בוחר שדרוג אך אין חדרים זמינים מסוג זה' : 'e.g. Guest selects an upgrade but no rooms of that type are available', required: true, maxLength: 120 },
        { id: 'behavior', label: he ? 'מה המערכת צריכה לעשות?' : 'What should the system do?', type: 'textarea', placeholder: he ? 'לדוגמה: הצג הודעה "אין שדרוגים זמינים" והצע להצטרף לרשימת המתנה.' : 'e.g. Show a "No upgrades available" message and offer to join a waitlist.', required: true, maxLength: 200, rows: 2 },
        { id: 'errorMsg', label: he ? 'הודעת שגיאה למשתמש (אם קיימת)' : 'Error message shown to user (if any)', type: 'text', placeholder: he ? 'לדוגמה: "אין שדרוגים זמינים לסוג החדר שלך כרגע."' : 'e.g. "No upgrades are available for your room type right now."', required: false, maxLength: 120 },
      ],
    },
    {
      id: 'technical',
      title: he ? 'הערות טכניות' : 'Technical Notes',
      note: he
        ? 'עבור ה-Tech Lead. מלא מה שאתה יודע — השאר ריק אם לא בטוח. ניתן להשלים בזמן ה-Sprint Refinement.'
        : 'For the tech lead. Fill in what you know — leave blank if uncertain. This can be completed during sprint refinement.',
      fields: [
        { id: 'api', label: he ? 'API / נקודות קצה מושפעות' : 'API / Endpoints affected', type: 'textarea', placeholder: he ? 'לדוגמה:\nGET /reservations/{id}/upgrade-options\nPOST /reservations/{id}/upgrade-request' : 'e.g.\nGET /reservations/{id}/upgrade-options\nPOST /reservations/{id}/upgrade-request', required: false, maxLength: 400, rows: 4 },
        { id: 'db', label: he ? 'שינויי מסד נתונים / סכמה' : 'Database / schema changes', type: 'textarea', placeholder: he ? 'לדוגמה: הוסף טבלת upgrade_request עם שדות: reservation_id, room_type, status, requested_at' : 'e.g. Add upgrade_request table with fields: reservation_id, room_type, status, requested_at', required: false, maxLength: 400, rows: 3 },
        { id: 'integrations', label: he ? 'שירותי צד שלישי מעורבים' : 'Third-party services involved', type: 'textarea', placeholder: he ? 'לדוגמה: PMS (Opera) לזמינות חדרים, Firebase להתראות לצוות' : 'e.g. PMS (Opera) for room availability, Firebase for push notifications to staff', required: false, maxLength: 300, rows: 3 },
      ],
    },
    {
      id: 'scope',
      title: he ? 'היקף הפרויקט' : 'Project Scope',
      note: he
        ? 'הגדר מה מהדורה זו תספק. גבולות ברורים מונעים זחילת היקף ושומרים על המיקוד בספרינט. נדרש לפחות פריט אחד.'
        : 'Define what this release will deliver. Clear scope boundaries prevent scope creep and keep the sprint focused. At least 1 item required.',
      dynamic: true, itemLabel: he ? 'פריט היקף' : 'Scope Item',
      addLabel: he ? 'הוסף פריט היקף' : 'Add Scope Item',
      prefix: null, minItems: 1,
      fields: [{ id: 'item', label: he ? 'מה כלול במהדורה זו?' : 'What is included in this release?', type: 'text', placeholder: he ? 'לדוגמה: בקשת שדרוג חדר לאורחים במובייל, התראות push לצוות הקבלה, בדיקת זמינות חדרים בסיסית' : 'e.g. Guest room upgrade request via mobile app, Push notifications to front-desk staff, Basic room availability check', required: true, maxLength: 150 }],
    },
    {
      id: 'design',
      title: he ? 'קישורי עיצוב' : 'Design Links',
      note: he
        ? 'קשר עיצובי Figma כשיהיו מוכנים. סעיף זה אופציונלי — ניתן למלא או לעדכן לפני תחילת הספרינט.'
        : 'Link Figma designs when ready. This section is optional — it can be filled in or updated before sprint start.',
      fields: [
        { id: 'figma', label: he ? 'קישור לקובץ Figma / עיצוב' : 'Figma / design file URL', type: 'text', placeholder: 'https://figma.com/...', required: false, maxLength: 300 },
        { id: 'screens', label: he ? 'שמות מסכים הכלולים במוקאפ' : 'Screen names included in the mockup', type: 'textarea', placeholder: he ? 'לדוגמה:\nמסך בחירת שדרוג\nמסך אישור\nתצוגת התראת צוות' : 'e.g.\nUpgrade Selection Screen\nConfirmation Screen\nStaff Notification View', required: false, maxLength: 400, rows: 4 },
      ],
    },
  ];
}

const newAC = (): AC => ({ given: '', when: '', then: '' });
const newStory = (): Story => ({ persona: '', action: '', benefit: '', acs: [newAC()] });

function initData(): PRDData {
  return {
    stories: [newStory()],
    edge: [{ scenario: '', behavior: '', errorMsg: '' }],
    scope: [{ item: '' }],
    featureName: '', what: '', why: '', who: '',
    api: '', db: '', integrations: '',
    figma: '', screens: '',
  };
}

// ── .docx generation ──────────────────────────────────────────────
async function generateDocx(data: PRDData): Promise<Blob> {
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

  const storyBlock = (story: Story, si: number) => {
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

    return [
      new Paragraph({ ...sp(200, 40), children: [new TextRun({ text: 'US-' + String(si + 1).padStart(2, '0'), bold: true, size: 24, color: BLUE, font: 'Calibri' })] }),
      new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [c1, c2], rows: storyRows }),
      new Paragraph({ ...sp(120, 40), shading: { fill: 'D6E8FA', type: ShadingType.CLEAR }, children: [new TextRun({ text: '  v DEFINITION OF DONE   Acceptance Criteria - Given / When / Then', bold: true, size: 18, color: MID, font: 'Calibri' })] }),
      ...acBlocks,
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
        ...data.stories.flatMap((story, si) => storyBlock(story, si)),
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
        new Paragraph({ spacing: { before: 300, after: 0 }, border: { top: { style: BorderStyle.SINGLE, size: 4, color: BLUE, space: 4 } }, children: [new TextRun({ text: 'Fattal Hotels - Internal Use Only - PM + Tech Lead sign-off required before dev start', size: 17, font: 'Calibri', color: '888888', italics: true })] }),
      ],
    }],
  });

  return Packer.toBlob(doc);
}

function generateTxt(data: PRDData) {
  let text = `FATTAL HOTELS - PRD\n${'='.repeat(50)}\nFeature: ${data.featureName}\nDate: ${new Date().toLocaleDateString('en-GB')}\n\n`;
  text += `1. FEATURE BRIEF\n${'-'.repeat(30)}\nWhat: ${data.what}\nWhy: ${data.why}\nWho: ${data.who}\n\n`;
  text += `2. USER STORIES & AC\n${'-'.repeat(30)}\n`;
  data.stories.forEach((s, si) => {
    text += `\nUS-${String(si + 1).padStart(2, '0')}: As a ${s.persona}, I want to ${s.action}, so that ${s.benefit}.\n  Definition of Done:\n`;
    s.acs.forEach((ac, ai) => { text += `  AC-${String(ai + 1).padStart(2, '0')}: Given: ${ac.given} | When: ${ac.when} | Then: ${ac.then}\n`; });
  });
  text += `\n3. EDGE CASES\n${'-'.repeat(30)}\n`;
  (data.edge || []).forEach((e, i) => { text += `EC-${String(i + 1).padStart(2, '0')}: ${e.scenario}\n  Expected: ${e.behavior}\n${e.errorMsg ? `  Error: "${e.errorMsg}"\n` : ''}`; });
  text += `\n4. TECHNICAL NOTES\n${'-'.repeat(30)}\nAPI: ${data.api}\nDB: ${data.db}\nIntegrations: ${data.integrations}\n`;
  text += `\n5. PROJECT SCOPE\n${'-'.repeat(30)}\n`;
  (data.scope || []).forEach(s => { text += `- ${s.item}\n`; });
  text += `\n6. DESIGN LINKS\n${'-'.repeat(30)}\nFigma: ${data.figma}\nScreens: ${data.screens}\n`;
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Fattal-PRD-${(data.featureName || 'Feature').replace(/\s+/g, '-')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Lightweight icons ─────────────────────────────────────────────
const MenuIcon = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const XIcon = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const PlusIcon = () => <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const ChevronIcon = () => <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const ArrowLeftIcon = () => <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M10 3.5L5.5 8 10 12.5M5.5 8h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const ArrowRightIcon = () => <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M6 3.5L10.5 8 6 12.5M3.5 8h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const CheckIcon = () => <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const DownloadIcon = () => <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 2v8m0 0L4.5 6.5M8 10l3.5-3.5M3 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const DocIcon = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3.5 1.5h6L13 5v9.5H3.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M9.5 1.5V5H13" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>;
const TrashIcon = () => <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M6 4V2.5h4V4M4.5 4l.5 9.5h6L11.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;

// ── Btn ───────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'outline' | 'ghost' | 'subtle' | 'dashed';
type BtnSize = 'sm' | 'md' | 'lg';

function Btn({ variant = 'ghost', size = 'md', children, style = {}, disabled, onClick, ...rest }: {
  variant?: BtnVariant; size?: BtnSize; children: React.ReactNode;
  style?: React.CSSProperties; disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  [key: string]: unknown;
}) {
  const sizes: Record<BtnSize, React.CSSProperties> = {
    sm: { padding: '5px 10px', fontSize: 12, height: 28 },
    md: { padding: '7px 13px', fontSize: 13, height: 32 },
    lg: { padding: '9px 15px', fontSize: 13, height: 36 },
  };
  const variantStyles: Record<BtnVariant, React.CSSProperties> = {
    primary: { background: C.accent, color: C.accentText, border: `1px solid ${C.accent}` },
    outline: { background: C.surface, color: C.text, border: `1px solid ${C.border}` },
    ghost:   { background: 'transparent', color: C.textMuted, border: '1px solid transparent' },
    subtle:  { background: C.surface, color: C.textMuted, border: `1px solid ${C.border}` },
    dashed:  { background: 'transparent', color: C.textMuted, border: `1px dashed ${C.borderStrong}` },
  };
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderRadius: 5, fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background 120ms ease, border-color 120ms ease, color 120ms ease',
    opacity: disabled ? 0.5 : 1, whiteSpace: 'nowrap', letterSpacing: '-0.005em',
  };
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{ ...base, ...sizes[size], ...variantStyles[variant], ...style }}
      onMouseEnter={e => {
        if (disabled) return;
        const el = e.currentTarget;
        if (variant === 'ghost' || variant === 'outline' || variant === 'subtle') el.style.background = C.hover;
        if (variant === 'dashed') { el.style.borderColor = C.text; el.style.color = C.text; }
        if (variant === 'primary') el.style.background = '#262626';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget;
        if (variant === 'ghost') el.style.background = 'transparent';
        if (variant === 'outline' || variant === 'subtle') el.style.background = C.surface;
        if (variant === 'dashed') { el.style.borderColor = C.borderStrong; el.style.color = C.textMuted; }
        if (variant === 'primary') el.style.background = C.accent;
      }}
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >{children}</button>
  );
}

// ── FieldInput ────────────────────────────────────────────────────
function FieldInput({ field, value, onChange, error, inputId, mob, errorText = 'This field is required.' }: {
  field: FieldDef; value: string; onChange: (v: string) => void;
  error?: string | boolean; inputId?: string; mob?: boolean; errorText?: string;
}) {
  const id = inputId || field.id;
  const [focused, setFocused] = useState(false);
  const baseInput: React.CSSProperties = {
    width: '100%', padding: mob ? '10px 12px' : '8px 11px',
    fontSize: mob ? 14 : 13,
    border: `1px solid ${error ? C.danger : focused ? C.text : C.border}`,
    borderRadius: 5, outline: 'none', background: C.surface, color: C.text,
    transition: 'border-color 120ms ease, box-shadow 120ms ease',
    boxShadow: focused ? `0 0 0 3px ${error ? 'rgba(220,38,38,0.08)' : 'rgba(10,10,10,0.06)'}` : 'none',
    resize: field.type === 'textarea' ? 'vertical' : undefined,
    lineHeight: 1.55, fontFamily: 'inherit',
    WebkitAppearance: 'none', appearance: 'none', boxSizing: 'border-box',
  };
  const overLimit = field.maxLength && value.length > field.maxLength * 0.85;
  return (
    <div style={{ marginBottom: mob ? 14 : 18 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6, gap: 8 }}>
        <label htmlFor={id} style={{ fontSize: mob ? 12 : 14, fontWeight: 500, color: C.text, letterSpacing: '-0.005em' }}>
          {field.label}
          {field.required && <span style={{ color: C.textFaint, marginLeft: 4, fontWeight: 400 }}>*</span>}
        </label>
        {field.maxLength && !mob && (
          <span style={{ fontSize: 11, color: overLimit ? C.textMuted : C.textFaint, fontVariantNumeric: 'tabular-nums' }}>
            {value.length}/{field.maxLength}
          </span>
        )}
      </div>
      {field.type === 'textarea'
        ? <textarea id={id} value={value} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    onChange={e => onChange(e.target.value)} placeholder={field.placeholder}
                    maxLength={field.maxLength} rows={mob ? Math.max(2, (field.rows || 3) - 1) : (field.rows || 3)}
                    style={baseInput} />
        : <input id={id} type="text" value={value} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                 onChange={e => onChange(e.target.value)} placeholder={field.placeholder}
                 maxLength={field.maxLength} style={baseInput} />}
      {error && <div style={{ fontSize: 11, color: C.danger, marginTop: 5 }}>{errorText}</div>}
    </div>
  );
}

// ── ACField ───────────────────────────────────────────────────────
function ACField({ label, placeholder, value, onChange, error, mob, errorText = 'Required' }: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; error?: string | boolean; mob?: boolean; errorText?: string;
}) {
  const [focused, setFocused] = useState(false);
  const base: React.CSSProperties = {
    width: '100%', padding: mob ? '8px 10px' : '7px 10px',
    fontSize: mob ? 13 : 12.5,
    border: `1px solid ${error ? C.danger : focused ? C.text : C.border}`,
    borderRadius: 4, outline: 'none', background: C.surface, color: C.text,
    transition: 'border-color 120ms ease, box-shadow 120ms ease',
    boxShadow: focused ? '0 0 0 2px rgba(10,10,10,0.05)' : 'none',
    resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
    WebkitAppearance: 'none', appearance: 'none', lineHeight: 1.5,
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: mob ? '46px 1fr' : '52px 1fr', gap: 10, alignItems: 'start', marginBottom: 8 }}>
      <span style={{
        fontSize: 10.5, fontWeight: 600, color: C.textMuted, paddingTop: 8,
        textTransform: 'uppercase', letterSpacing: '0.05em',
        fontFamily: "'JetBrains Mono', monospace",
      }}>{label}</span>
      <div>
        <textarea value={value} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                  onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={2} style={base} />
        {error && <div style={{ fontSize: 10.5, color: C.danger, marginTop: 4 }}>{errorText}</div>}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
type ErrorMap = Record<string, string>;

export default function App() {
  const [data, setData] = useState<PRDData>(initData);
  const [activeSection, setActiveSection] = useState('brief');
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<ErrorMap>({});
  const [exporting, setExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [lang, setLang] = useState<Lang>('en');
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const sections = getSections(lang);
  const ui = UI[lang];
  const isRtl = lang === 'he';

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 820);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => { if (isMobile) setMenuOpen(false); }, [activeSection, isMobile]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) setShowExportMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const updateField = (fieldId: string, value: string) => {
    setData(d => ({ ...d, [fieldId]: value }));
    setErrors(e => { const n = { ...e }; delete n[fieldId]; return n; });
  };
  const updateDynamic = (sectionId: keyof PRDData, index: number, fieldId: string, value: string) => {
    setData(d => {
      const arr = [...(d[sectionId] as unknown as Record<string, string>[])];
      arr[index] = { ...arr[index], [fieldId]: value };
      return { ...d, [sectionId]: arr };
    });
    setErrors(e => { const n = { ...e }; delete n[`${sectionId}_${index}_${fieldId}`]; return n; });
  };
  const addItem = (sectionId: keyof PRDData, section: SectionDef) => {
    const ni: Record<string, string> = {};
    section.fields?.forEach(f => { ni[f.id] = ''; });
    setData(d => ({ ...d, [sectionId]: [...(d[sectionId] as object[]), ni] }));
  };
  const removeItem = (sectionId: keyof PRDData, index: number) =>
    setData(d => ({ ...d, [sectionId]: (d[sectionId] as object[]).filter((_, i) => i !== index) }));

  const updateStory = (si: number, field: keyof Omit<Story, 'acs'>, value: string) => {
    setData(d => { const s = [...d.stories]; s[si] = { ...s[si], [field]: value }; return { ...d, stories: s }; });
    setErrors(e => { const n = { ...e }; delete n[`story_${si}_${field}`]; return n; });
  };
  const addStory = () => setData(d => ({ ...d, stories: [...d.stories, newStory()] }));
  const removeStory = (si: number) => setData(d => ({ ...d, stories: d.stories.filter((_, i) => i !== si) }));

  const updateAC = (si: number, ai: number, field: keyof AC, value: string) => {
    setData(d => {
      const s = [...d.stories];
      const acs = [...s[si].acs];
      acs[ai] = { ...acs[ai], [field]: value };
      s[si] = { ...s[si], acs };
      return { ...d, stories: s };
    });
    setErrors(e => { const n = { ...e }; delete n[`ac_${si}_${ai}_${field}`]; return n; });
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

  const validate = (): ErrorMap => {
    const errs: ErrorMap = {};
    sections.forEach(s => {
      if (s.isStories) {
        data.stories.forEach((story, si) => {
          (['persona', 'action', 'benefit'] as const).forEach(f => { if (!story[f]?.trim()) errs[`story_${si}_${f}`] = 'Required'; });
          story.acs.forEach((ac, ai) => { (['given', 'when', 'then'] as const).forEach(f => { if (!ac[f]?.trim()) errs[`ac_${si}_${ai}_${f}`] = 'Required'; }); });
        });
      } else if (s.dynamic) {
        (data[s.id as keyof PRDData] as unknown as Record<string, string>[]).forEach((item, i) => {
          s.fields?.forEach(f => { if (f.required && !item[f.id]?.trim()) errs[`${s.id}_${i}_${f.id}`] = 'Required'; });
        });
      } else {
        s.fields?.forEach(f => { if (f.required && !(data[f.id as keyof PRDData] as string)?.trim()) errs[f.id] = 'Required'; });
      }
    });
    return errs;
  };

  const handleExport = async (format: 'docx' | 'txt' = 'docx') => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setSubmitted(true);
      const firstErr = sections.find(s => {
        if (s.isStories) return data.stories.some((story, si) => ['persona','action','benefit'].some(f => errs[`story_${si}_${f}`]) || story.acs.some((_, ai) => ['given','when','then'].some(f => errs[`ac_${si}_${ai}_${f}`])));
        if (s.dynamic) return (data[s.id as keyof PRDData] as unknown as Record<string, string>[]).some((_, i) => s.fields?.some(f => errs[`${s.id}_${i}_${f.id}`]));
        return s.fields?.some(f => errs[f.id]);
      });
      if (firstErr) setActiveSection(firstErr.id);
      return;
    }
    setExporting(true);
    try {
      if (format === 'docx') {
        const blob = await generateDocx(data);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Fattal-PRD-${(data.featureName || 'Feature').replace(/\s+/g, '-')}.docx`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        generateTxt(data);
      }
      setExportDone(true);
      setTimeout(() => setExportDone(false), 3000);
    } catch (e) {
      console.error(e);
      alert('Export failed: ' + (e as Error).message);
    }
    setExporting(false);
  };

  const currentSection = sections.find(s => s.id === activeSection)!;
  const currentIndex = sections.findIndex(s => s.id === activeSection);
  const progress = ((currentIndex + 1) / sections.length) * 100;
  const mob = isMobile;

  const sectionHasErrors = (s: SectionDef) => {
    if (!submitted) return false;
    if (s.isStories) return data.stories.some((story, si) => ['persona','action','benefit'].some(f => errors[`story_${si}_${f}`]) || story.acs.some((_, ai) => ['given','when','then'].some(f => errors[`ac_${si}_${ai}_${f}`])));
    if (s.dynamic) return (data[s.id as keyof PRDData] as unknown as Record<string, string>[]).some((_, i) => s.fields?.some(f => errors[`${s.id}_${i}_${f.id}`]));
    return s.fields?.some(f => errors[f.id]) ?? false;
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: C.bg, color: C.text, display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{
        background: 'rgba(250,250,250,0.85)',
        backdropFilter: 'saturate(180%) blur(8px)',
        WebkitBackdropFilter: 'saturate(180%) blur(8px)',
        borderBottom: `1px solid ${C.border}`,
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{
          maxWidth: 1180, margin: '0 auto',
          padding: mob ? '11px 16px' : '12px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {mob && (
              <button onClick={() => setMenuOpen(o => !o)} style={{
                background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 5,
                width: 30, height: 30, color: C.text, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{menuOpen ? <XIcon /> : <MenuIcon />}</button>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 22, height: 22, background: C.text, color: '#fff', borderRadius: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 12, letterSpacing: '-0.02em',
              }}>F</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>Fattal</span>
                <span style={{ fontSize: 13, color: C.textFaint, fontWeight: 400 }}>/ {ui.subtitle}</span>
              </div>
            </div>
          </div>

          {!mob && (
            <div style={{ fontSize: 12, color: C.textSubtle, fontVariantNumeric: 'tabular-nums' }}>
              {ui.step} <span style={{ color: C.text, fontWeight: 500 }}>{currentIndex + 1}</span>
              <span style={{ color: C.textFaint }}> {ui.of} {sections.length}</span>
              <span style={{ color: C.textFaint, padding: '0 8px' }}>·</span>
              <span>{currentSection.title}</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Language toggle */}
            <div style={{ display: 'flex', border: `1px solid ${C.border}`, borderRadius: 5, overflow: 'hidden', flexShrink: 0 }}>
              {(['en', 'he'] as Lang[]).map(l => (
                <button key={l} onClick={() => setLang(l)} style={{
                  padding: '5px 9px', fontSize: 11, fontWeight: 600,
                  background: lang === l ? C.accent : 'transparent',
                  color: lang === l ? C.accentText : C.textMuted,
                  border: 'none', cursor: 'pointer', letterSpacing: '0.04em',
                  transition: 'background 120ms ease, color 120ms ease',
                }}>
                  {l === 'en' ? 'EN' : 'עב'}
                </button>
              ))}
            </div>

            <div ref={exportMenuRef} style={{ position: 'relative', display: 'flex' }}>
            <Btn
              variant="primary" size="md"
              onClick={() => handleExport('docx')}
              disabled={exporting}
              style={{ borderRadius: 0, borderStartStartRadius: 5, borderEndStartRadius: 5, borderInlineEnd: '1px solid rgba(255,255,255,0.15)', minWidth: mob ? 90 : 110 }}
            >
              {exporting ? '...' : exportDone ? <><CheckIcon /> {ui.saved}</> : <><DownloadIcon /> {ui.exportBtn}</>}
            </Btn>
            <Btn
              variant="primary" size="md"
              onClick={() => setShowExportMenu(o => !o)}
              disabled={exporting}
              style={{ borderRadius: 0, borderStartEndRadius: 5, borderEndEndRadius: 5, padding: '0 8px', minWidth: 0 }}
            >
              <span style={{ transform: showExportMenu ? 'rotate(180deg)' : 'none', transition: 'transform 120ms ease', display: 'inline-flex' }}><ChevronIcon /></span>
            </Btn>
            {showExportMenu && (
              <div style={{
                position: 'absolute', insetInlineEnd: 0, top: 'calc(100% + 6px)',
                background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6,
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                minWidth: 180, zIndex: 200, overflow: 'hidden', padding: 4,
              }}>
                {([
                  { fmt: 'docx' as const, label: ui.exportDocx, sub: ui.microsoftWord },
                  { fmt: 'txt'  as const, label: ui.exportTxt,  sub: ui.plainText },
                ]).map(it => (
                  <button key={it.fmt}
                    onClick={() => { handleExport(it.fmt); setShowExportMenu(false); }}
                    style={{
                      width: '100%', padding: '8px 10px',
                      background: 'transparent', border: 'none', borderRadius: 4,
                      textAlign: 'start', cursor: 'pointer', color: C.text,
                      display: 'flex', alignItems: 'center', gap: 9,
                      fontSize: 13, fontWeight: 500,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.hover)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ color: C.textMuted, display: 'inline-flex' }}><DocIcon /></span>
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <span>{it.label}</span>
                      <span style={{ fontSize: 11, color: C.textFaint, fontWeight: 400 }}>{it.sub}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Progress line */}
        <div style={{ height: 1, background: C.border, position: 'relative' }}>
          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            ...(isRtl ? { right: 0 } : { left: 0 }),
            width: `${progress}%`, background: C.text,
            transition: 'width 280ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          }} />
        </div>
      </header>

      {/* Mobile drawer */}
      {mob && menuOpen && (
        <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
          {sections.map((s, i) => {
            const isActive = s.id === activeSection;
            const hasErr = sectionHasErrors(s);
            return (
              <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 18px', background: isActive ? C.hover : 'transparent',
                border: 'none', borderBottom: `1px solid ${C.borderSubtle}`,
                cursor: 'pointer', textAlign: 'left',
              }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: isActive ? C.text : C.textFaint, fontFamily: "'JetBrains Mono', monospace", minWidth: 22 }}>0{i + 1}</span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: isActive ? 600 : 500, color: isActive ? C.text : C.textMuted }}>{s.title}</span>
                {hasErr && <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.danger }} />}
                {isActive && <span style={{ color: C.text, display: 'inline-flex' }}><CheckIcon /></span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Body */}
      <main style={{
        display: 'flex', flex: 1, maxWidth: 1180, margin: '0 auto', width: '100%',
        padding: mob ? '16px' : '32px 24px', gap: 32, boxSizing: 'border-box',
      }}>
        {/* Sidebar */}
        {!mob && (
          <aside style={{ width: 220, flexShrink: 0 }}>
            <div style={{ position: 'sticky', top: 80 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: C.textFaint, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '0 10px', marginBottom: 10 }}>{ui.sectionsLabel}</div>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {sections.map((s, i) => {
                  const isActive = s.id === activeSection;
                  const hasErr = sectionHasErrors(s);
                  return (
                    <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '7px 10px', borderRadius: 5,
                      background: isActive ? C.hover : 'transparent',
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                      transition: 'background 120ms ease',
                    }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = C.hover; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span style={{ fontSize: 11, color: isActive ? C.text : C.textFaint, fontWeight: 500, fontFamily: "'JetBrains Mono', monospace", minWidth: 20, fontVariantNumeric: 'tabular-nums' }}>0{i + 1}</span>
                      <span style={{ flex: 1, fontSize: 13, color: isActive ? C.text : C.textMuted, fontWeight: isActive ? 500 : 400, letterSpacing: '-0.005em' }}>{s.title}</span>
                      {hasErr && <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.danger }} />}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>
        )}

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Mobile pills */}
          {mob && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 4 }}>
              {sections.map((s, i) => {
                const isActive = s.id === activeSection;
                const hasErr = sectionHasErrors(s);
                return (
                  <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                    flexShrink: 0, padding: '6px 11px', borderRadius: 5,
                    border: `1px solid ${isActive ? C.text : C.border}`,
                    background: isActive ? C.text : C.surface,
                    color: isActive ? '#fff' : C.textMuted,
                    fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", opacity: 0.7 }}>0{i + 1}</span>
                    <span>{s.title}</span>
                    {hasErr && <span style={{ width: 5, height: 5, borderRadius: '50%', background: isActive ? '#fff' : C.danger }} />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Section card */}
          <section style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6,
            padding: mob ? '20px 16px' : '36px 40px',
          }}>
            <div style={{ marginBottom: 26, paddingBottom: 18, borderBottom: `1px solid ${C.borderSubtle}` }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: currentSection.note ? 8 : 0 }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: C.textFaint, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}>0{currentIndex + 1}</span>
                <h1 style={{ margin: 0, fontSize: mob ? 18 : 22, fontWeight: 600, letterSpacing: '-0.02em', color: C.text }}>{currentSection.title}</h1>
              </div>
              {currentSection.note && (
                <p style={{ margin: '6px 0 0 28px', fontSize: 13, color: C.textSubtle, lineHeight: 1.5 }}>{currentSection.note}</p>
              )}
            </div>

            {/* Stories */}
            {currentSection.isStories && (
              <div>
                {data.stories.map((story, si) => (
                  <div key={si} style={{ border: `1px solid ${C.border}`, borderRadius: 6, marginBottom: 16, overflow: 'hidden', background: C.surface }}>
                    <div style={{
                      borderBottom: `1px solid ${C.borderSubtle}`, padding: mob ? '10px 14px' : '11px 18px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FCFCFC',
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-0.01em' }}>US-{String(si + 1).padStart(2, '0')}</span>
                      {data.stories.length > 1 && (
                        <Btn variant="ghost" size="sm" onClick={() => removeStory(si)}><TrashIcon /> {ui.remove}</Btn>
                      )}
                    </div>
                    <div style={{ padding: mob ? '16px 14px 4px' : '20px 18px 4px' }}>
                      {([
                        { id: 'persona' as const, label: ui.asA,      placeholder: ui.storyPersonaPlaceholder, maxLength: 60 },
                        { id: 'action'  as const, label: ui.iWantTo,  placeholder: ui.storyActionPlaceholder,  maxLength: 120 },
                        { id: 'benefit' as const, label: ui.soThat,   placeholder: ui.storyBenefitPlaceholder, maxLength: 150 },
                      ]).map(f => (
                        <FieldInput key={f.id}
                          field={{ ...f, type: 'text', required: true }}
                          value={story[f.id] || ''}
                          onChange={v => updateStory(si, f.id, v)}
                          error={submitted && errors[`story_${si}_${f.id}`]}
                          errorText={ui.fieldRequired}
                          mob={mob}
                        />
                      ))}
                    </div>

                    {/* Definition of Done */}
                    <div style={{ margin: mob ? '4px 14px 16px' : '4px 18px 18px', ...(isRtl ? { borderRight: `2px solid ${C.acAccent}`, paddingRight: mob ? 14 : 18 } : { borderLeft: `2px solid ${C.acAccent}`, paddingLeft: mob ? 14 : 18 }) }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: C.text, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{ui.dod}</span>
                        <span style={{ fontSize: 11.5, color: C.textFaint, fontWeight: 400 }}>{ui.acSubtitle}</span>
                      </div>
                      <p style={{ fontSize: 11.5, color: C.textSubtle, margin: '0 0 14px', lineHeight: 1.5 }}>{ui.acHint}</p>
                      {story.acs.map((ac, ai) => (
                        <div key={ai} style={{ paddingBottom: 14, marginBottom: 14, borderBottom: ai < story.acs.length - 1 ? `1px dashed ${C.border}` : 'none' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                            <span style={{ fontSize: 11, fontWeight: 500, color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>AC-{String(ai + 1).padStart(2, '00')}</span>
                            {story.acs.length > 1 && (
                              <button onClick={() => removeAC(si, ai)} style={{
                                background: 'transparent', border: 'none', color: C.textFaint,
                                fontSize: 11, cursor: 'pointer', padding: '2px 4px',
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                              }}
                                onMouseEnter={e => (e.currentTarget.style.color = C.danger)}
                                onMouseLeave={e => (e.currentTarget.style.color = C.textFaint)}
                              >{ui.remove}</button>
                            )}
                          </div>
                          {([
                            { id: 'given' as const, label: ui.given, placeholder: ui.acGivenPlaceholder },
                            { id: 'when'  as const, label: ui.when,  placeholder: ui.acWhenPlaceholder },
                            { id: 'then'  as const, label: ui.then,  placeholder: ui.acThenPlaceholder },
                          ]).map(f => (
                            <ACField key={f.id}
                              label={f.label} placeholder={f.placeholder}
                              value={ac[f.id] || ''}
                              onChange={v => updateAC(si, ai, f.id, v)}
                              error={submitted && errors[`ac_${si}_${ai}_${f.id}`]}
                              errorText={ui.required}
                              mob={mob}
                            />
                          ))}
                        </div>
                      ))}
                      <Btn variant="dashed" size="sm" onClick={() => addAC(si)} style={{ width: '100%' }}>
                        <PlusIcon /> {ui.addAC}
                      </Btn>
                    </div>
                  </div>
                ))}
                <Btn variant="dashed" size="md" onClick={addStory} style={{ width: '100%', height: mob ? 44 : 38 }}>
                  <PlusIcon /> {ui.addStory}
                </Btn>
              </div>
            )}

            {/* Static fields */}
            {!currentSection.isStories && !currentSection.dynamic && currentSection.fields?.map(field => (
              <FieldInput key={field.id}
                field={field}
                value={(data[field.id as keyof PRDData] as string) || ''}
                onChange={v => updateField(field.id, v)}
                error={submitted && errors[field.id]}
                errorText={ui.fieldRequired}
                mob={mob}
              />
            ))}

            {/* Dynamic items */}
            {!currentSection.isStories && currentSection.dynamic && (
              <div>
                {(data[currentSection.id as keyof PRDData] as unknown as Record<string, string>[]).map((item, idx) => (
                  <div key={idx} style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: mob ? '14px 14px 2px' : '20px 20px 4px', marginBottom: 12, background: C.surface }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>
                        {currentSection.prefix ? `${currentSection.prefix}-${String(idx + 1).padStart(2, '0')}` : `${ui.item} ${String(idx + 1).padStart(2, '0')}`}
                      </span>
                      {(data[currentSection.id as keyof PRDData] as object[]).length > (currentSection.minItems || 1) && (
                        <Btn variant="ghost" size="sm" onClick={() => removeItem(currentSection.id as keyof PRDData, idx)}><TrashIcon /> {ui.remove}</Btn>
                      )}
                    </div>
                    {currentSection.fields?.map(field => (
                      <FieldInput key={field.id}
                        field={field}
                        value={item[field.id] || ''}
                        onChange={v => updateDynamic(currentSection.id as keyof PRDData, idx, field.id, v)}
                        error={submitted && errors[`${currentSection.id}_${idx}_${field.id}`]}
                        errorText={ui.fieldRequired}
                        inputId={`${currentSection.id}_${idx}_${field.id}`}
                        mob={mob}
                      />
                    ))}
                  </div>
                ))}
                <Btn variant="dashed" size="md" onClick={() => addItem(currentSection.id as keyof PRDData, currentSection)} style={{ width: '100%', height: mob ? 44 : 38 }}>
                  <PlusIcon /> {currentSection.addLabel}
                </Btn>
              </div>
            )}

            {/* Footer nav */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, paddingTop: 18, borderTop: `1px solid ${C.borderSubtle}` }}>
              <Btn variant="outline" size="md" onClick={() => currentIndex > 0 && setActiveSection(sections[currentIndex - 1].id)} disabled={currentIndex === 0}>
                {isRtl ? <ArrowRightIcon /> : <ArrowLeftIcon />} {ui.back}
              </Btn>
              <span style={{ fontSize: 12, color: C.textFaint, fontVariantNumeric: 'tabular-nums' }}>
                {String(currentIndex + 1).padStart(2, '0')} / {String(sections.length).padStart(2, '0')}
              </span>
              {currentIndex < sections.length - 1 ? (
                <Btn variant="primary" size="md" onClick={() => setActiveSection(sections[currentIndex + 1].id)}>
                  {ui.next} {isRtl ? <ArrowLeftIcon /> : <ArrowRightIcon />}
                </Btn>
              ) : (
                <Btn variant="primary" size="md" onClick={() => handleExport('docx')} disabled={exporting}>
                  {exporting ? '...' : <><DownloadIcon /> {ui.exportBtn}</>}
                </Btn>
              )}
            </div>
          </section>

          <div style={{ textAlign: 'center', padding: '24px 0 16px', fontSize: 11, color: C.textFaint }}>
            {ui.footer}
          </div>
        </div>
      </main>
    </div>
  );
}
