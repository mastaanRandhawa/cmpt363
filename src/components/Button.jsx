function Button({ label, variant = 'primary', onClick, fullWidth = false }) {
    // Mapping variants to your specific theme tokens
    const variantStyles = {
        primary: {
            background: 'var(--color-primary)',
            color: '#FFFFFF', // High contrast for primary action
            border: 'none'
        },
        secondary: {
            background: 'var(--color-primary-soft)',
            color: 'var(--color-text-main)',
            border: 'none'
        },
        destructive: {
            background: 'var(--color-error)',
            color: '#FFFFFF',
            border: 'none'
        },
        outline: {
            background: 'transparent',
            color: 'var(--color-text-mid)',
            border: '1px solid var(--color-divider)'
        },
    }

    return (
        <button
            onClick={onClick}
            style={{
                ...variantStyles[variant],
                width: fullWidth ? '100%' : 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                userSelect: 'none'
            }}
            className="label-bold px-5 py-4 rounded-2xl transition-all active:scale-[0.97] active:opacity-80"
        >
            {label}
        </button>
    )
}

export default Button