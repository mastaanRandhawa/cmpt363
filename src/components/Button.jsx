function Button({ label, variant = 'primary', onClick, fullWidth = false }) {
    const styles = {
        primary:     { background: 'var(--color-primary)',  color: 'var(--color-text)' },
        secondary:   { background: 'var(--color-surface)',  color: 'var(--color-text)' },
        destructive: { background: 'var(--color-danger)',   color: 'var(--color-text)' },
        outline:     { background: 'transparent', color: 'var(--color-text-muted)',
            border: '1px solid var(--color-text-muted)' },
    }

    return (
        <button
            onClick={onClick}
            style={{ ...styles[variant], width: fullWidth ? '100%' : 'auto', padding: '16px' }}
            className="px-4 py-3 rounded-xl font-semibold text-sm transition-opacity active:opacity-70"
        >
            {label}
        </button>
    )
}

export default Button