function Chip({ label, color = 'primary' }) {
    const styles = {
        primary: { background: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',     color: 'var(--color-primary-soft)' },
        accent:  { background: 'color-mix(in srgb, var(--color-accent) 20%, transparent)',       color: 'var(--color-accent)' },
        success: { background: 'color-mix(in srgb, var(--color-success) 20%, transparent)',      color: 'var(--color-success)' },
        danger:  { background: 'color-mix(in srgb, var(--color-danger) 20%, transparent)',       color: 'var(--color-danger)' },
        muted:   { background: 'color-mix(in srgb, var(--color-text-muted) 20%, transparent)',   color: 'var(--color-text-muted)' },
    }

    return (
        <span
            style={styles[color] ?? styles.primary}
            className="px-2 py-0.5 rounded-md text-xs font-semibold"
        >
      {label}
    </span>
    )
}

export default Chip