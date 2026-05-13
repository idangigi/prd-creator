import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { C } from './constants/designTokens';
import { UI } from './constants/translations';
import { getSections } from './config/sections';
import { useResponsive } from './hooks/useResponsive';
import { usePRDData } from './hooks/usePRDData';
import { downloadDocx } from './services/exportDocx';
import { downloadTxt } from './services/exportTxt';
import { fetchPRD, updatePRD } from './services/prdService';
import { findFirstErrorSection, sectionHasErrors, validate } from './utils/validation';
import type { ExportFormat, Lang, SectionDef } from './types/prd';
import { AppHeader } from './components/header/AppHeader';
import { DesktopSidebarNav } from './components/navigation/DesktopSidebarNav';
import { MobileDrawerNav } from './components/navigation/MobileDrawerNav';
import { MobilePillNav } from './components/navigation/MobilePillNav';
import { SectionFooterNav } from './components/navigation/SectionFooterNav';
import { SectionCard } from './components/sections/SectionCard';
import { StaticFieldsSection } from './components/sections/StaticFieldsSection';
import { DynamicListSection } from './components/sections/DynamicListSection';
import { UserStoriesSection } from './components/sections/UserStoriesSection';
import { ReferenceFilesSection } from './components/sections/ReferenceFilesSection';

export default function App() {
  const { id: prdId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const prd = usePRDData();
  const { isMobile } = useResponsive();

  const [activeSection, setActiveSection] = useState('brief');
  const [submitted, setSubmitted] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState<Lang>('en');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const sections = getSections(lang);
  const ui = UI[lang];
  const isRtl = lang === 'he';
  const mob = isMobile;

  // Load PRD data from Supabase on mount
  useEffect(() => {
    if (!prdId) {
      navigate('/', { replace: true });
      return;
    }
    fetchPRD(prdId)
      .then(record => {
        prd.setData(record.data);
        setLoading(false);
      })
      .catch(e => {
        setLoadError(e.message);
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prdId]);

  // Auto-save with debounce whenever data changes (after initial load)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (loading || !prdId) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      updatePRD(prdId, prd.data).catch(console.error);
    }, 1500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prd.data]);

  useEffect(() => {
    if (isMobile) setMenuOpen(false);
  }, [activeSection, isMobile]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textSubtle, fontSize: 14 }}>
        Loading…
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: C.text }}>
        <p style={{ color: C.danger, fontSize: 14 }}>Failed to load PRD: {loadError}</p>
        <button onClick={() => navigate('/')} style={{ fontSize: 13, color: C.textSubtle, background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>
          ← Back to lobby
        </button>
      </div>
    );
  }

  const currentSection = sections.find(s => s.id === activeSection)!;
  const currentIndex = sections.findIndex(s => s.id === activeSection);
  const progress = ((currentIndex + 1) / sections.length) * 100;

  const hasErrors = (s: SectionDef) =>
    submitted ? sectionHasErrors(s, prd.data, prd.errors) : false;

  const handleExport = async (format: ExportFormat) => {
    const errs = validate(prd.data, sections);
    if (Object.keys(errs).length > 0) {
      prd.setErrors(errs);
      setSubmitted(true);
      const firstErr = findFirstErrorSection(sections, prd.data, errs);
      if (firstErr) setActiveSection(firstErr.id);
      return;
    }
    setExporting(true);
    try {
      if (format === 'docx') {
        await downloadDocx(prd.data);
      } else {
        downloadTxt(prd.data);
      }
      setExportDone(true);
      setTimeout(() => setExportDone(false), 3000);
    } catch (e) {
      console.error(e);
      alert('Export failed: ' + (e as Error).message);
    }
    setExporting(false);
  };

  const goToPrev = () => {
    if (currentIndex > 0) setActiveSection(sections[currentIndex - 1].id);
  };
  const goToNext = () => {
    if (currentIndex < sections.length - 1) setActiveSection(sections[currentIndex + 1].id);
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{ minHeight: '100vh', background: C.bg, color: C.text, display: 'flex', flexDirection: 'column' }}
    >
      <AppHeader
        ui={ui}
        lang={lang}
        onLangChange={setLang}
        mob={mob}
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen(o => !o)}
        currentIndex={currentIndex}
        totalSections={sections.length}
        currentSectionTitle={currentSection.title}
        exporting={exporting}
        exportDone={exportDone}
        onExport={handleExport}
        progress={progress}
        isRtl={isRtl}
        onBackToLobby={() => navigate('/')}
      />

      {mob && menuOpen && (
        <MobileDrawerNav
          sections={sections}
          activeSection={activeSection}
          onSelect={setActiveSection}
          hasErrors={hasErrors}
        />
      )}

      <main style={{
        display: 'flex',
        flex: 1,
        maxWidth: 1180,
        margin: '0 auto',
        width: '100%',
        padding: mob ? '16px' : '32px 24px',
        gap: 32,
        boxSizing: 'border-box',
      }}>
        {!mob && (
          <DesktopSidebarNav
            sections={sections}
            activeSection={activeSection}
            onSelect={setActiveSection}
            sectionsLabel={ui.sectionsLabel}
            hasErrors={hasErrors}
          />
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          {mob && (
            <MobilePillNav
              sections={sections}
              activeSection={activeSection}
              onSelect={setActiveSection}
              hasErrors={hasErrors}
            />
          )}

          <SectionCard
            index={currentIndex}
            title={currentSection.title}
            note={currentSection.note}
            mob={mob}
          >
            {currentSection.isStories && (
              <UserStoriesSection
                stories={prd.data.stories}
                ui={ui}
                isRtl={isRtl}
                mob={mob}
                errors={prd.errors}
                submitted={submitted}
                onUpdateStory={prd.updateStory}
                onAddStory={prd.addStory}
                onRemoveStory={prd.removeStory}
                onUpdateAC={prd.updateAC}
                onAddAC={prd.addAC}
                onRemoveAC={prd.removeAC}
                onAddStoryImages={prd.addStoryImages}
                onRemoveStoryImage={prd.removeStoryImage}
                onUpdateStoryImageLabel={prd.updateStoryImageLabel}
              />
            )}

            {!currentSection.isStories &&
              !currentSection.isFiles &&
              !currentSection.dynamic &&
              currentSection.fields && (
                <StaticFieldsSection
                  fields={currentSection.fields}
                  data={prd.data}
                  errors={prd.errors}
                  submitted={submitted}
                  fieldRequiredText={ui.fieldRequired}
                  mob={mob}
                  onChange={prd.updateField}
                />
              )}

            {currentSection.isFiles && (
              <ReferenceFilesSection
                files={prd.data.files}
                uploadLabel={ui.filesUpload}
                uploadSubLabel={ui.filesUploadSub}
                filesNoneLabel={ui.filesNone}
                removeLabel={ui.remove}
                mob={mob}
                onAddFiles={prd.addFiles}
                onRemoveFile={prd.removeFile}
              />
            )}

            {!currentSection.isStories && !currentSection.isFiles && currentSection.dynamic && (
              <DynamicListSection
                section={currentSection}
                data={prd.data}
                errors={prd.errors}
                submitted={submitted}
                fieldRequiredText={ui.fieldRequired}
                removeLabel={ui.remove}
                itemFallbackLabel={ui.item}
                mob={mob}
                onItemChange={prd.updateDynamic}
                onAddItem={prd.addItem}
                onRemoveItem={prd.removeItem}
              />
            )}

            <SectionFooterNav
              ui={ui}
              currentIndex={currentIndex}
              totalSections={sections.length}
              isRtl={isRtl}
              isLast={currentIndex === sections.length - 1}
              exporting={exporting}
              onBack={goToPrev}
              onNext={goToNext}
              onExport={() => handleExport('docx')}
            />
          </SectionCard>

          <div style={{ textAlign: 'center', padding: '24px 0 16px', fontSize: 11, color: C.textFaint }}>
            {ui.footer}
          </div>
        </div>
      </main>
    </div>
  );
}
