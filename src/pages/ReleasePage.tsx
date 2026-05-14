import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { C } from '../constants/designTokens';
import { useResponsive } from '../hooks/useResponsive';
import { fetchRelease, fetchPRDReleases } from '../services/releaseService';
import { createPRD } from '../services/prdService';
import type { ReleaseRecord } from '../services/releaseService';
import type { PRDData, Story, EdgeCase, ScopeItem } from '../types/prd';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function Section({ title, children, collapsible = false, defaultOpen = true }: {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 36 }}>
      <div
        onClick={collapsible ? () => setOpen(o => !o) : undefined}
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: C.textFaint,
          marginBottom: open || !collapsible ? 14 : 0,
          paddingBottom: 8,
          borderBottom: `1px solid ${C.border}`,
          cursor: collapsible ? 'pointer' : undefined,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          userSelect: 'none',
        }}
      >
        <span>{title}</span>
        {collapsible && (
          <span style={{
            fontSize: 10,
            color: C.textFaint,
            transition: 'transform 0.2s',
            display: 'inline-block',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}>▼</span>
        )}
      </div>
      {(!collapsible || open) && children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.textSubtle, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, color: C.text, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{value}</div>
    </div>
  );
}

function StoryBlock({ story, index }: { story: Story; index: number }) {
  return (
    <div style={{
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      padding: '16px 18px',
      marginBottom: 12,
      background: C.surface,
    }}>
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        color: C.textFaint,
        letterSpacing: '0.06em',
        marginBottom: 10,
      }}>
        US-{String(index + 1).padStart(2, '0')}
      </div>
      <div style={{ fontSize: 13, color: C.text, marginBottom: 12, lineHeight: 1.6 }}>
        As a <strong>{story.persona || '…'}</strong>, I want to <strong>{story.action || '…'}</strong> so that <strong>{story.benefit || '…'}</strong>.
      </div>
      {story.acs.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.textSubtle, marginBottom: 8 }}>Acceptance Criteria</div>
          {story.acs.map((ac, ai) => (
            <div key={ai} style={{
              fontSize: 12,
              color: C.textMuted,
              marginBottom: 6,
              paddingLeft: 12,
              borderLeft: `2px solid ${C.border}`,
              lineHeight: 1.6,
            }}>
              <span style={{ color: C.textFaint }}>Given</span> {ac.given} <span style={{ color: C.textFaint }}>when</span> {ac.when} <span style={{ color: C.textFaint }}>then</span> {ac.then}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EdgeCaseBlock({ ec, index }: { ec: EdgeCase; index: number }) {
  return (
    <div style={{
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      padding: '14px 18px',
      marginBottom: 10,
      background: C.surface,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.textFaint, letterSpacing: '0.06em', marginBottom: 8 }}>
        EC-{String(index + 1).padStart(2, '0')}
      </div>
      <Field label="Scenario" value={ec.scenario} />
      <Field label="Expected Behavior" value={ec.behavior} />
      {ec.errorMsg && <Field label="Error Message" value={ec.errorMsg} />}
    </div>
  );
}

function PRDContent({ data, isMobile }: { data: PRDData; isMobile: boolean }) {
  return (
    <div>
      <Section title="Feature Brief">
        <Field label="Feature Name" value={data.featureName} />
        <Field label="What" value={data.what} />
        <Field label="Why" value={data.why} />
        <Field label="Who" value={data.who} />
      </Section>

      {data.stories.length > 0 && (
        <Section title="User Stories" collapsible={isMobile} defaultOpen={!isMobile}>
          {data.stories.map((s, i) => <StoryBlock key={i} story={s} index={i} />)}
        </Section>
      )}

      {data.edge.length > 0 && (
        <Section title="Edge Cases" collapsible={isMobile} defaultOpen={!isMobile}>
          {data.edge.map((ec, i) => <EdgeCaseBlock key={i} ec={ec} index={i} />)}
        </Section>
      )}

      {(data.api || data.db || data.integrations) && (
        <Section title="Technical Notes">
          <Field label="API / Endpoints" value={data.api} />
          <Field label="DB / Schema" value={data.db} />
          <Field label="Integrations" value={data.integrations} />
        </Section>
      )}

      {data.scope.some((s: ScopeItem) => s.item) && (
        <Section title="Out of Scope">
          {data.scope.filter((s: ScopeItem) => s.item).map((s: ScopeItem, i: number) => (
            <div key={i} style={{ fontSize: 14, color: C.text, marginBottom: 6, display: 'flex', gap: 8 }}>
              <span style={{ color: C.textFaint }}>—</span>
              <span>{s.item}</span>
            </div>
          ))}
        </Section>
      )}

      {(data.figma || data.screens) && (
        <Section title="Design Links">
          <Field label="Figma URL" value={data.figma} />
          <Field label="Screens" value={data.screens} />
        </Section>
      )}
    </div>
  );
}

export default function ReleasePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isMobile } = useResponsive();

  const [release, setRelease] = useState<ReleaseRecord | null>(null);
  const [seriesVersions, setSeriesVersions] = useState<ReleaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forking, setForking] = useState(false);

  useEffect(() => {
    if (!id) { navigate('/'); return; }
    setLoading(true);
    fetchRelease(id)
      .then(r => {
        setRelease(r);
        return fetchPRDReleases(r.prd_id);
      })
      .then(setSeriesVersions)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleFork = async () => {
    if (!release) return;
    setForking(true);
    try {
      // Pass the series ID so a release from this fork increments the same version lineage
      const record = await createPRD(release.snapshot, release.prd_id);
      navigate(`/prd/${record.id}`);
    } catch (e) {
      alert('Failed to fork: ' + (e as Error).message);
      setForking(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textSubtle, fontSize: 14 }}>
        Loading…
      </div>
    );
  }

  if (error || !release) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <p style={{ color: C.danger, fontSize: 14 }}>{error || 'Release not found.'}</p>
        <button onClick={() => navigate('/')} style={{ fontSize: 13, color: C.textSubtle, background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>
          ← Back to lobby
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
      {/* Header */}
      <header style={{
        background: 'rgba(250,250,250,0.85)',
        backdropFilter: 'saturate(180%) blur(8px)',
        WebkitBackdropFilter: 'saturate(180%) blur(8px)',
        borderBottom: `1px solid ${C.border}`,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{
          maxWidth: 860,
          margin: '0 auto',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'transparent',
                border: `1px solid ${C.border}`,
                borderRadius: 5,
                padding: '4px 8px',
                fontSize: 12,
                color: C.textSubtle,
                cursor: 'pointer',
              }}
            >
              ←
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 22, height: 22, background: C.text, color: '#fff',
                borderRadius: 4, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: 700, fontSize: 12,
              }}>F</div>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Fattal</span>
              <span style={{ fontSize: 13, color: C.textFaint }}>/ PRD Creator</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {seriesVersions.length > 1 ? (
              <select
                value={release.id}
                onChange={e => navigate(`/release/${e.target.value}`)}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#fff',
                  background: C.accent,
                  border: 'none',
                  borderRadius: 4,
                  padding: '3px 24px 3px 8px',
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23ffffff'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 7px center',
                  backgroundSize: '8px',
                }}
              >
                {seriesVersions.map(v => (
                  <option key={v.id} value={v.id} style={{ background: '#0A0A0A', color: '#fff' }}>
                    v{v.version_number}{v.version_number === seriesVersions[0].version_number ? ' (latest)' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#fff',
                background: C.accent,
                borderRadius: 4,
                padding: '3px 8px',
                letterSpacing: '0.04em',
              }}>
                v{release.version_number}
              </div>
            )}
            <button
              onClick={handleFork}
              disabled={forking}
              style={{
                background: 'transparent',
                border: `1px solid ${C.border}`,
                borderRadius: 5,
                padding: '5px 12px',
                fontSize: 12,
                fontWeight: 500,
                color: C.textMuted,
                cursor: forking ? 'not-allowed' : 'pointer',
              }}
            >
              {forking ? 'Forking…' : 'Fork to Draft'}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Release meta */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.03em' }}>
            {release.feature_name || 'Untitled PRD'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: C.textFaint }}>
              Released {formatDate(release.created_at)}
            </span>
            {release.author_email && (
              <span style={{ fontSize: 12, color: C.textFaint }}>
                · by {release.author_email}
              </span>
            )}
          </div>
          {release.release_notes && (
            <div style={{
              marginTop: 16,
              padding: '14px 16px',
              background: C.hover,
              borderRadius: 8,
              border: `1px solid ${C.border}`,
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.textSubtle, marginBottom: 6 }}>Release Notes</div>
              <div style={{ fontSize: 13, color: C.text, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {release.release_notes}
              </div>
            </div>
          )}
        </div>

        <PRDContent data={release.snapshot} isMobile={isMobile} />
      </main>
    </div>
  );
}
