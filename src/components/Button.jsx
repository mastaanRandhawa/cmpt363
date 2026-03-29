// Button
// Standard tap target for primary actions, secondary actions, destructive actions, and outlines.
//
// Props:
//   label     – string, button text
//   variant   – 'primary' | 'secondary' | 'destructive' | 'outline' (default 'primary')
//   onClick   – () => void
//   fullWidth – boolean, stretches to fill parent (default false)
//
// Usage examples:
//   // Main CTA (e.g. Create Task, Start Task)
//   <Button label="Create Task" onClick={handleCreate} fullWidth />
//
//   // Dangerous action (e.g. Delete Task)
//   <Button label="Delete Task" variant="destructive" onClick={handleDelete} fullWidth />
//
//   // Paired action row (e.g. Dismiss / Breakdown / Start on Home)
//   <Button label="Dismiss"   variant="outline"    onClick={handleDismiss} />
//   <Button label="Breakdown" variant="secondary"  onClick={handleBreakdown} />
//   <Button label="Start"     variant="primary"    onClick={handleStart} />

const buttonColors = {
    primary:     { background: 'var(--color-primary)',  color: 'var(--color-text)' },
    secondary:   { background: 'var(--color-surface)',  color: 'var(--color-text)' },
    destructive: { background: 'var(--color-danger)',   color: 'var(--color-text)' },
    outline:     { background: 'transparent', color: 'var(--color-text-muted)', borderColor: 'var(--color-text-muted)' },
    "destructive-outline": { background: 'transparent', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' },
}

function Button({
    label,
    variant = 'primary',
    onClick,
    fullWidth = false,
    style: customStyles,
}) {
    const colorStyles = buttonColors[variant] ?? buttonColors.primary;
    const styles = {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        border: 'transparent 1px solid',
        borderColor: 'transparent', // fixes error in console
        borderRadius: '20px',
        padding: '6px 11px',
        fontWeight: 700,
        fontSize: '12px',
        cursor: 'pointer',
        letterSpacing: '0.04em',
        justifyContent: 'center',
        width: fullWidth ? '100%' : 'auto',
        ...colorStyles,
        ...customStyles,
    }

    return (
        <button
            onClick={onClick}
            style={styles}
        >
            {label}
        </button>
    )
}

export default Button