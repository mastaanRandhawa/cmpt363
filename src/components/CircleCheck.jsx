function CircleCheck({ checked, onChange, size = 22, label }) {
    return (
        <div
            onClick={e => { e.stopPropagation(); onChange(!checked) }}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                border: `2px solid ${checked ? 'var(--color-success)' : 'var(--color-divider)'}`,
                background: checked ? 'var(--color-success)' : 'transparent',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
            }}
            className="active:scale-90"
        >
            {checked ? (
                <svg
                    width={size * 0.5}
                    height={size * 0.4}
                    viewBox="0 0 10 8"
                    fill="none"
                >
                    <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            ) : label != null ? (
                <span style={{
                    fontSize: `${Math.round(size * 0.42)}px`,
                    lineHeight: 1,
                    fontWeight: 600,
                    color: 'var(--color-text-secondary)',
                    userSelect: 'none',
                }}>
                    {label}
                </span>
            ) : null}
        </div>
    )
}

export default CircleCheck