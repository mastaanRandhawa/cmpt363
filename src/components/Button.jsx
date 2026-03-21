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