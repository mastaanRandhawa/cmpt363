// Input
// Styled text input and textarea with optional label.
//
// Props:
//   label       – string, displays as a small caps label above the field
//   required    – boolean, shows a red asterisk after the label
//   placeholder – string
//   value       – controlled value
//   onChange    – (e) => void  (raw event, same as native)
//   multiline   – boolean, renders a <textarea> instead of <input>
//   rows        – number, only used when multiline=true (default 4)
//   type        – input type string, e.g. 'text' | 'date' | 'time' (default 'text')
//   disabled    – boolean
//
// Usage examples:
//   // Task name
//   <Input label="TASK NAME" required value={name} onChange={e => setName(e.target.value)} placeholder="Task Name" />
//
//   // Notes field
//   <Input label="NOTES OR CONTEXT" multiline value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add any context..." />
//
//   // Date picker
//   <Input label="DATE" required type="date" value={date} onChange={e => setDate(e.target.value)} />
//
//   // No label (e.g. AI assistant name inline field in Settings)
//   <Input value={name} onChange={e => setName(e.target.value)} placeholder="Robo" />

function Input({ label, required = false, placeholder, value, onChange, multiline = false, rows = 4, type = 'text', disabled = false }) {
    const fieldStyle = {
        background: 'var(--color-surface)',
        border: '1.5px solid var(--color-surface-alt)',
        borderRadius: '12px',
        padding: '12px 14px',
        color: 'var(--color-text)',
        fontSize: '14px',
        width: '100%',
        outline: 'none',
        boxSizing: 'border-box',
        opacity: disabled ? 0.5 : 1,
        colorScheme: 'dark',
        ...(multiline ? { resize: 'none', lineHeight: 1.6 } : {}),
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {label && (
                <label style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: 'var(--color-text-muted)',
                }}>
                    {label}
                    {required && (
                        <span style={{ color: 'var(--color-danger)', marginLeft: '3px' }}>*</span>
                    )}
                </label>
            )}

            {multiline ? (
                <textarea
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    rows={rows}
                    disabled={disabled}
                    style={fieldStyle}
                />
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    style={fieldStyle}
                />
            )}
        </div>
    )
}

export default Input