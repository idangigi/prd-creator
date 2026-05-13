import { useState } from 'react';
import { C } from '../constants/designTokens';

interface CreateReleaseModalProps {
  featureName: string;
  nextVersion: number;
  onConfirm: (releaseNotes: string) => Promise<void>;
  onClose: () => void;
}

export function CreateReleaseModal({ featureName, nextVersion, onConfirm, onClose }: CreateReleaseModalProps) {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await onConfirm(notes);
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: 28,
        width: '100%',
        maxWidth: 480,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{
            display: 'inline-block',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: C.textFaint,
            marginBottom: 8,
          }}>
            Create Release
          </div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>
            {featureName || 'Untitled PRD'}
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: C.textSubtle }}>
            This will publish <strong>v{nextVersion}</strong> and make it visible to all team members.
          </p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textMuted, marginBottom: 6 }}>
            Release notes <span style={{ fontWeight: 400, color: C.textFaint }}>(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="What changed in this version? e.g. Added technical specs, updated user stories…"
            rows={4}
            autoFocus
            style={{
              width: '100%',
              boxSizing: 'border-box',
              border: `1px solid ${C.border}`,
              borderRadius: 7,
              padding: '10px 12px',
              fontSize: 13,
              fontFamily: 'inherit',
              color: C.text,
              background: C.bg,
              resize: 'vertical',
              outline: 'none',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = C.borderStrong)}
            onBlur={e => (e.currentTarget.style.borderColor = C.border)}
          />
        </div>

        {error && (
          <div style={{ fontSize: 12, color: C.danger, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: 'transparent',
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              padding: '8px 16px',
              fontSize: 13,
              color: C.textSubtle,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              background: loading ? C.textFaint : C.accent,
              border: 'none',
              borderRadius: 6,
              padding: '8px 18px',
              fontSize: 13,
              fontWeight: 600,
              color: C.accentText,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Publishing…' : `Publish v${nextVersion}`}
          </button>
        </div>
      </div>
    </div>
  );
}
