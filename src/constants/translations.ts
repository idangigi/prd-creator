import type { Lang } from '../types/prd';

export interface Translation {
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
  filesUpload: string; filesUploadSub: string; filesNone: string;
  storyImages: string; addImage: string; imageLabelPlaceholder: string;
}

export const UI: Record<Lang, Translation> = {
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
    filesUpload: 'Click to upload or drag & drop', filesUploadSub: 'PDF, DOCX, XLSX, PNG, JPG and more',
    filesNone: 'No files attached yet',
    storyImages: 'Images', addImage: 'Add image', imageLabelPlaceholder: 'Add a label...',
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
    filesUpload: 'לחץ להעלאה או גרור ושחרר', filesUploadSub: 'PDF, DOCX, XLSX, PNG, JPG ועוד',
    filesNone: 'לא צורפו קבצים עדיין',
    storyImages: 'תמונות', addImage: 'הוסף תמונה', imageLabelPlaceholder: 'הוסף תווית...',
  },
};
