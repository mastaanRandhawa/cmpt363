function SegmentedControl({
                              options = [],
                              value,
                              onChange,
                              size = 'md',
                              fullWidth = false
                          }) {
    const isSmall = size === 'sm'

    return (
        <div style={{
            display: 'inline-flex',
            background: 'var(--color-divider)',
            borderRadius: '14px', // Softer rounding to match 16px inputs
            padding: '4px',
            gap: '4px',
            width: fullWidth ? '100%' : 'auto',
            boxSizing: 'border-box',
        }}>
            {options.map(option => {
                const active = option.value === value
                const disabled = option.disabled ?? false
                const onClick = disabled ? null : () => onChange?.(option.value)

                return (
                    <button
                        key={option.value}
                        onClick={onClick}
                        className={isSmall ? "label-caps" : "label-medium"}
                        style={{
                            flex: fullWidth ? 1 : undefined,
                            padding: isSmall ? '6px 10px' : '10px 16px',
                            borderRadius: '10px',
                            border: 'none',
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            // Active state uses theme primary, inactive uses secondary text
                            color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            background: active ? 'var(--color-card)' : 'transparent',
                            fontWeight: active ? 700 : 500,
                            boxShadow: active ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap',
                            opacity: disabled ? 0.4 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
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