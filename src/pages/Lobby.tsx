import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { C } from '../constants/designTokens';
import { useAuth } from '../contexts/AuthContext';
import { createPRD, deletePRD, fetchUserPRDs } from '../services/prdService';
import type { PRDRecord } from '../services/prdService';
import { fetchAllReleases } from '../services/releaseService';
import type { ReleaseRecord } from '../services/releaseService';
import { initData } from '../utils/initData';
import { CriticalPopup } from '../components/CriticalPopup';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function Lobby() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [prds, setPrds] = useState<Pick<PRDRecord, 'id' | 'feature_name' | 'created_at' | 'updated_at'>[]>([]);
  const [releases, setReleases] = useState<ReleaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');
  const [draftsPage, setDraftsPage] = useState(0);
  const [hasMoreDrafts, setHasMoreDrafts] = useState(false);
  const [loadingMoreDrafts, setLoadingMoreDrafts] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  // Initial load
  useEffect(() => {
    Promise.all([fetchUserPRDs('', 0), fetchAllReleases('')])
      .then(([prdsResult, releasesData]) => {
        setPrds(prdsResult.data);
        setHasMoreDrafts(prdsResult.hasMore);
        setReleases(releasesData);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Debounced re-fetch when filter changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setLoading(true);
      setDraftsPage(0);
      Promise.all([fetchUserPRDs(filterText, 0), fetchAllReleases(filterText)])
        .then(([prdsResult, releasesData]) => {
          setPrds(prdsResult.data);
          setHasMoreDrafts(prdsResult.hasMore);
          setReleases(releasesData);
        })
        .catch(e => setError(e.message))
        .finally(() => setLoading(false));
    }, 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterText]);

  const handleNew = async () => {
    setCreating(true);
    try {
      const record = await createPRD(initData());
      navigate(`/prd/${record.id}`);
    } catch (e) {
      setError((e as Error).message);
      setCreating(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConfirmDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    if (!id) return;
    setDeletingId(id);
    try {
      await deletePRD(id);
      setPrds(p => p.filter(r => r.id !== id));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleLoadMoreDrafts = async () => {
    const nextPage = draftsPage + 1;
    setLoadingMoreDrafts(true);
    try {
      const result = await fetchUserPRDs(filterText, nextPage);
      setPrds(prev => [...prev, ...result.data]);
      setHasMoreDrafts(result.hasMore);
      setDraftsPage(nextPage);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingMoreDrafts(false);
    }
  };

  // Group releases by prd_id, keep only the latest version per series
  const latestReleases = Object.values(
    releases.reduce<Record<string, ReleaseRecord>>((acc, r) => {
      if (!acc[r.prd_id] || r.version_number > acc[r.prd_id].version_number) {
        acc[r.prd_id] = r;
      }
      return acc;
    }, {})
  ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Filtering is done server-side; these aliases keep the JSX unchanged
  const filteredPrds = prds;
  const filteredReleases = latestReleases;

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
          maxWidth: 1180,
          margin: '0 auto',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 22,
              height: 22,
              background: C.text,
              color: '#fff',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: '-0.02em',
            }}>F</div>
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>Fattal</span>
            <span style={{ fontSize: 13, color: C.textFaint }}>/ PRD Creator</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: C.textSubtle }}>{user?.email}</span>
            <button
              onClick={signOut}
              style={{
                background: 'transparent',
                border: `1px solid ${C.border}`,
                borderRadius: 5,
                padding: '4px 10px',
                fontSize: 12,
                color: C.textSubtle,
                cursor: 'pointer',
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 24px' }}>
        {/* Filter input */}
        <div style={{ marginBottom: 32 }}>
          <input
            type="text"
            placeholder="Filter by name…"
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            style={{
              width: '100%',
              maxWidth: 360,
              padding: '8px 12px',
              fontSize: 13,
              border: `1px solid ${C.border}`,
              borderRadius: 7,
              background: C.surface,
              color: C.text,
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = C.borderStrong)}
            onBlur={e => (e.currentTarget.style.borderColor = C.border)}
          />
        </div>

        {error && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 8,
            padding: '12px 16px',
            fontSize: 13,
            color: C.danger,
            marginBottom: 24,
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ color: C.textSubtle, fontSize: 14 }}>Loading…</div>
        ) : (
          <>
            {/* Drafts section */}
            <div style={{ marginBottom: 48 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>Drafts</h2>
                <span style={{ fontSize: 13, color: C.textFaint }}>{filteredPrds.length}</span>
              </div>
              {filteredPrds.length === 0 ? (
                <p style={{ fontSize: 13, color: C.textFaint, margin: 0 }}>{filterText ? 'No drafts match your filter.' : 'No drafts yet — create your first one.'}</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                  {filteredPrds.map(prd => (
                    <div
                      key={prd.id}
                      onClick={() => navigate(`/prd/${prd.id}`)}
                      style={{
                        background: C.surface,
                        border: `1px solid ${C.border}`,
                        borderRadius: 10,
                        padding: '18px 20px 14px',
                        cursor: 'pointer',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLDivElement).style.borderColor = C.borderStrong;
                        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLDivElement).style.borderColor = C.border;
                        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.textFaint, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                        Draft
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {prd.feature_name || 'Untitled PRD'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: 11, color: C.textFaint }}>Updated {formatDate(prd.updated_at)}</div>
                        <button
                          onClick={e => handleDeleteClick(e, prd.id)}
                          disabled={deletingId === prd.id}
                          style={{ background: 'transparent', border: 'none', padding: '2px 6px', fontSize: 11, color: C.textFaint, cursor: 'pointer', borderRadius: 4 }}
                          onMouseEnter={e => (e.currentTarget.style.color = C.danger)}
                          onMouseLeave={e => (e.currentTarget.style.color = C.textFaint)}
                        >
                          {deletingId === prd.id ? '…' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {hasMoreDrafts && (
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <button
                    onClick={handleLoadMoreDrafts}
                    disabled={loadingMoreDrafts}
                    style={{
                      background: 'transparent',
                      border: `1px solid ${C.border}`,
                      borderRadius: 6,
                      padding: '6px 18px',
                      fontSize: 12,
                      color: C.textSubtle,
                      cursor: loadingMoreDrafts ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {loadingMoreDrafts ? 'Loading…' : 'Load more'}
                  </button>
                </div>
              )}
            </div>

            {/* Released section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>Released</h2>
                <span style={{ fontSize: 13, color: C.textFaint }}>{filteredReleases.length}</span>
              </div>
              {filteredReleases.length === 0 ? (
                <p style={{ fontSize: 13, color: C.textFaint, margin: 0 }}>{filterText ? 'No releases match your filter.' : 'No releases yet — open a draft and click Release.'}</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                  {filteredReleases.map(r => {
                    const seriesVersionCount = releases.filter(rel => rel.prd_id === r.prd_id).length;
                    return (
                      <div
                        key={r.id}
                        onClick={() => navigate(`/release/${r.id}`)}
                        style={{
                          background: C.surface,
                          border: `1px solid ${C.border}`,
                          borderRadius: 10,
                          padding: '18px 20px 14px',
                          cursor: 'pointer',
                          transition: 'border-color 0.15s, box-shadow 0.15s',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLDivElement).style.borderColor = C.borderStrong;
                          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLDivElement).style.borderColor = C.border;
                          (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: C.textFaint, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                              Release
                            </div>
                            {seriesVersionCount > 1 && (
                              <div style={{ fontSize: 10, color: C.textFaint }}>
                                · {seriesVersionCount} versions
                              </div>
                            )}
                          </div>
                          <div style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: '#fff',
                            background: C.accent,
                            borderRadius: 3,
                            padding: '2px 6px',
                            letterSpacing: '0.04em',
                          }}>
                            v{r.version_number}
                          </div>
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.feature_name || 'Untitled PRD'}
                        </div>
                        {r.release_notes && (
                          <div style={{ fontSize: 12, color: C.textSubtle, marginBottom: 10, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {r.release_notes}
                          </div>
                        )}
                        <div style={{ fontSize: 11, color: C.textFaint }}>{formatDate(r.created_at)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <CriticalPopup
        open={confirmDeleteId !== null}
        title="Delete this PRD?"
        description="This action cannot be undone. The document will be permanently removed."
        onConfirm={handleDeleteConfirm}
        onDecline={() => setConfirmDeleteId(null)}
      />

      {/* Floating + button */}
      <button
        onClick={handleNew}
        disabled={creating}
        title="New PRD"
        style={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: creating ? C.textFaint : C.accent,
          color: C.accentText,
          border: 'none',
          fontSize: 28,
          fontWeight: 300,
          cursor: creating ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
          zIndex: 200,
          transition: 'background 0.15s, transform 0.15s',
        }}
        onMouseEnter={e => { if (!creating) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
      >
        {creating ? '…' : '+'}
      </button>
    </div>
  );
}
