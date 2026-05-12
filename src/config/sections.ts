import type { Lang, SectionDef } from '../types/prd';

export function getSections(lang: Lang): SectionDef[] {
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
    {
      id: 'files',
      title: he ? 'קבצי עזר' : 'Reference Files',
      note: he
        ? 'צרף קבצים רלוונטיים לפיצ\'ר — מסמכי API, הנחיות שירות צד שלישי, מחקר משתמשים, מוקאפים ועוד. הקבצים שמורים בזיכרון הדפדפן לאורך הסשן.'
        : 'Attach files relevant to this feature — API docs, third-party service guides, user research, mockups, and more. Files are kept in browser memory for this session.',
      isFiles: true,
    },
  ];
}
