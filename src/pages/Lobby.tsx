import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { C } from '../constants/designTokens';
import { useAuth } from '../contexts/AuthContext';
import { createPRD, deletePRD, fetchUserPRDs } from '../services/prdService';
import type { PRDRecord } from '../services/prdService';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchUserPRDs()
      .then(setPrds)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

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
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>My PRDs</h1>
          <p style={{ fontSize: 14, color: C.textSubtle, marginTop: 6, marginBottom: 0 }}>
            {prds.length === 0 && !loading ? 'No PRDs yet — create your first one.' : `${prds.length} document${prds.length !== 1 ? 's' : ''}`}
          </p>
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}>
            {prds.map(prd => (
              <div
                key={prd.id}
                onClick={() => navigate(`/prd/${prd.id}`)}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  padding: '20px 20px 16px',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  position: 'relative',
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
                <div style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: C.textFaint,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}>
                  PRD
                </div>
                <div style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: C.text,
                  marginBottom: 12,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {prd.feature_name || 'Untitled PRD'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 11, color: C.textFaint }}>
                    Updated {formatDate(prd.updated_at)}
                  </div>
                  <button
                    onClick={e => handleDeleteClick(e, prd.id)}
                    disabled={deletingId === prd.id}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: '2px 6px',
                      fontSize: 11,
                      color: C.textFaint,
                      cursor: 'pointer',
                      borderRadius: 4,
                    }}
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
