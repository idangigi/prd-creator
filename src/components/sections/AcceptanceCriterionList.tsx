import { Button } from '../buttons/Button';
import { PlusIcon } from '../icons/PlusIcon';
import { AcceptanceCriterionField } from '../inputs/AcceptanceCriterionField';
import { C } from '../../constants/designTokens';
import type { Translation } from '../../constants/translations';
import type { AC, ErrorMap } from '../../types/prd';

interface AcceptanceCriterionListProps {
  storyIndex: number;
  acs: AC[];
  ui: Translation;
  isRtl: boolean;
  mob: boolean;
  errors: ErrorMap;
  submitted: boolean;
  onUpdateAC: (acIndex: number, field: keyof AC, value: string) => void;
  onAddAC: () => void;
  onRemoveAC: (acIndex: number) => void;
}

export function AcceptanceCriterionList({
  storyIndex,
  acs,
  ui,
  isRtl,
  mob,
  errors,
  submitted,
  onUpdateAC,
  onAddAC,
  onRemoveAC,
}: AcceptanceCriterionListProps) {
  const fieldDefs: { id: keyof AC; label: string; placeholder: string }[] = [
    { id: 'given', label: ui.given, placeholder: ui.acGivenPlaceholder },
    { id: 'when', label: ui.when, placeholder: ui.acWhenPlaceholder },
    { id: 'then', label: ui.then, placeholder: ui.acThenPlaceholder },
  ];

  return (
    <div style={{
      margin: mob ? '4px 14px 16px' : '4px 18px 18px',
      ...(isRtl
        ? { borderRight: `2px solid ${C.acAccent}`, paddingRight: mob ? 14 : 18 }
        : { borderLeft: `2px solid ${C.acAccent}`, paddingLeft: mob ? 14 : 18 }),
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          color: C.text,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {ui.dod}
        </span>
        <span style={{ fontSize: 11.5, color: C.textFaint, fontWeight: 400 }}>
          {ui.acSubtitle}
        </span>
      </div>
      <p style={{ fontSize: 11.5, color: C.textSubtle, margin: '0 0 14px', lineHeight: 1.5 }}>
        {ui.acHint}
      </p>
      {acs.map((ac, ai) => (
        <div
          key={ai}
          style={{
            paddingBottom: 14,
            marginBottom: 14,
            borderBottom: ai < acs.length - 1 ? `1px dashed ${C.border}` : 'none',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}>
            <span style={{
              fontSize: 11,
              fontWeight: 500,
              color: C.textMuted,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              AC-{String(ai + 1).padStart(2, '00')}
            </span>
            {acs.length > 1 && (
              <button
                onClick={() => onRemoveAC(ai)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: C.textFaint,
                  fontSize: 11,
                  cursor: 'pointer',
                  padding: '2px 4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
                onMouseEnter={e => (e.currentTarget.style.color = C.danger)}
                onMouseLeave={e => (e.currentTarget.style.color = C.textFaint)}
              >
                {ui.remove}
              </button>
            )}
          </div>
          {fieldDefs.map(f => (
            <AcceptanceCriterionField
              key={f.id}
              label={f.label}
              placeholder={f.placeholder}
              value={ac[f.id] || ''}
              onChange={v => onUpdateAC(ai, f.id, v)}
              error={submitted && errors[`ac_${storyIndex}_${ai}_${f.id}`]}
              errorText={ui.required}
              mob={mob}
            />
          ))}
        </div>
      ))}
      <Button variant="dashed" size="sm" onClick={onAddAC} style={{ width: '100%' }}>
        <PlusIcon /> {ui.addAC}
      </Button>
    </div>
  );
}
