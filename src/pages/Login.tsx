import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { C } from '../constants/designTokens';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      navigate('/');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: '40px 36px',
        width: '100%',
        maxWidth: 380,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{
            width: 26,
            height: 26,
            background: C.text,
            color: '#fff',
            borderRadius: 5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 13,
          }}>F</div>
          <span style={{ fontSize: 15, fontWeight: 600 }}>Fattal PRD Creator</span>
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, color: C.text }}>Sign in</h1>
        <p style={{ fontSize: 13, color: C.textSubtle, marginBottom: 24 }}>
          Access is restricted to Fattal Hotels team members.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: C.textMuted }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="you@fattal.com"
              style={{
                padding: '9px 12px',
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                fontSize: 14,
                color: C.text,
                background: C.surface,
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: C.textMuted }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                padding: '9px 12px',
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                fontSize: 14,
                color: C.text,
                background: C.surface,
                outline: 'none',
              }}
            />
          </div>

          {error && (
            <p style={{ fontSize: 13, color: C.danger, margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 6,
              padding: '10px 0',
              background: loading ? C.textFaint : C.accent,
              color: C.accentText,
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
