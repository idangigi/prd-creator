import { useState } from 'react';
import { C } from '../constants/designTokens';
import { useAuth } from '../contexts/AuthContext';

interface ChangePasswordModalProps {
  onClose: () => void;
}

export function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box' as const,
    border: `1px solid ${C.border}`,
    borderRadius: 7,
    padding: '9px 12px',
    fontSize: 13,
    fontFamily: 'inherit',
    color: C.text,
    background: C.bg,
    outline: 'none',
  };

  const handleSubmit = async () => {
    setError(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    setLoading(true);
    const { error } = await changePassword(currentPassword, newPassword);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      setSuccess(true);
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
        maxWidth: 420,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase' as const,
            color: C.textFaint,
            marginBottom: 8,
          }}>
            Account
          </div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Change Password
          </h2>
        </div>

        {success ? (
          <div>
            <p style={{ fontSize: 13, color: C.textSubtle, marginBottom: 20 }}>
              Your password has been updated successfully.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={onClose}
                style={{
                  background: C.accent,
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 18px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.accentText,
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              {([
                { label: 'Current password', value: currentPassword, setter: setCurrentPassword },
                { label: 'New password', value: newPassword, setter: setNewPassword },
                { label: 'Confirm new password', value: confirmPassword, setter: setConfirmPassword },
              ] as const).map(({ label, value, setter }) => (
                <div key={label}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textMuted, marginBottom: 6 }}>
                    {label}
                  </label>
                  <input
                    type="password"
                    value={value}
                    onChange={e => setter(e.target.value)}
                    style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = C.borderStrong)}
                    onBlur={e => (e.currentTarget.style.borderColor = C.border)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                  />
                </div>
              ))}
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
                {loading ? 'Updating…' : 'Update password'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
