function CircleCheck({ checked, onChange, size = 22 }) {
    return (
        <div
            onClick={e => { e.stopPropagation(); onChange(!checked) }}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                // Using divider for unchecked and success for checked
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
            {checked && (
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
            )}
        </div>
    )
}

export default CircleCheck