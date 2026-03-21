// SegmentedControl
// A row of exclusive-select options styled as connected pill buttons.
//
// Props:
//   options   – array of { value, label } objects
//   value     – currently selected value (controlled)
//   onChange  – (value) => void
//   size      – 'sm' | 'md' (default 'md')
//   fullWidth – boolean, stretches to fill parent (default false)
//
// Usage examples:
//   AI Involvement (full-width)
//   <SegmentedControl
//     options={[{ value: 'off', label: 'Off' }, { value: 'suggestive', label: 'Suggestive' }, { value: 'collaborative', label: 'Collaborative' }]}
//     value={involvement}
//     onChange={setInvolvement}
//     fullWidth
//   />

function SegmentedControl({ options = [], value, onChange, size = 'md', fullWidth = false }) {
    const isSmall = size === 'sm'

    return (
        <div style={{
            display: 'inline-flex',
            background: 'var(--color-surface-alt)',
            borderRadius: '12px',
            padding: '3px',
            gap: '2px',
            width: fullWidth ? '100%' : 'auto',
        }}>
            {options.map(option => {
                const active = option.value === value
                return (
                    <button
                        key={option.value}
                        onClick={() => onChange?.(option.value)}
                        style={{
                            flex: fullWidth ? 1 : undefined,
                            padding: isSmall ? '5px 10px' : '7px 14px',
                            borderRadius: '9px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: isSmall ? '11px' : '13px',
                            fontWeight: active ? 600 : 400,
                            color: active ? 'var(--color-text)' : 'var(--color-text-muted)',
                            background: active ? 'var(--color-surface)' : 'transparent',
                            boxShadow: active ? '0 1px 4px rgba(0,0,0,0.25)' : 'none',
                            transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {option.label}
                    </button>
                )
            })}
        </div>
    )
}

export default SegmentedControl