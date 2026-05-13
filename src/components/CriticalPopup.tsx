import { useEffect, useRef } from 'react';
import { C } from '../constants/designTokens';

interface CriticalPopupProps {
  title: string;
  description?: string;
  open: boolean;
  onConfirm: () => void;
  onDecline: () => void;
}

export function CriticalPopup({ title, description, open, onConfirm, onDecline }: CriticalPopupProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [open]);

  // Treat ESC key as decline
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleCancel = (e: Event) => {
      e.preventDefault();
      onDecline();
    };
    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onDecline]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onDecline();
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      style={{
        border: 'none',
        borderRadius: 12,
        padding: 0,
        background: C.surface,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
        minWidth: 320,
        maxWidth: 440,
        width: '90vw',
        outline: 'none',
      }}
    >
      <div style={{ padding: '28px 28px 24px' }}>
        {/* Icon */}
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: '#FEF2F2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 2L16.5 15H1.5L9 2Z" stroke={C.danger} strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M9 7V10" stroke={C.danger} strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="9" cy="12.5" r="0.75" fill={C.danger} />
          </svg>
        </div>

        {/* Title */}
        <p style={{
          margin: '0 0 8px',
          fontSize: 15,
          fontWeight: 600,
          color: C.text,
          lineHeight: 1.4,
        }}>
          {title}
        </p>

        {/* Description */}
        {description && (
          <p style={{
            margin: 0,
            fontSize: 13,
            color: C.textSubtle,
            lineHeight: 1.55,
          }}>
            {description}
          </p>
        )}

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: 8,
          justifyContent: 'flex-end',
          marginTop: 24,
        }}>
          <button
            onClick={onDecline}
            style={{
              padding: '7px 16px',
              fontSize: 13,
              fontWeight: 500,
              color: C.textSubtle,
              background: 'transparent',
              border: `1px solid ${C.border}`,
              borderRadius: 7,
              cursor: 'pointer',
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = C.borderStrong;
              e.currentTarget.style.color = C.text;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.color = C.textSubtle;
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '7px 16px',
              fontSize: 13,
              fontWeight: 500,
              color: '#fff',
              background: C.danger,
              border: 'none',
              borderRadius: 7,
              cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            Delete
          </button>
        </div>
      </div>
    </dialog>
  );
}
