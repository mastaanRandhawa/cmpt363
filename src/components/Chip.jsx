// Chip
// Small inline badge for status labels, priority indicators, and tags.
//
// Props:
//   label – string, text displayed inside the chip
//   color – 'primary' | 'accent' | 'success' | 'danger' | 'muted' (default 'primary')
//
// Color usage guide:
//   primary – general AI/Robo labels, level indicators
//   accent  – combo badges, streak indicators
//   success – low priority, completed states, positive feedback
//   danger  – high priority, overdue tasks, destructive warnings
//   muted   – secondary metadata, inactive states, "coming soon" labels
//
// Usage examples:
//   // Priority badge on a task card
//   <Chip label="HIGH" color="danger" />
//   <Chip label="MED"  color="accent" />
//   <Chip label="LOW"  color="success" />
//
//   // Robo level badge
//   <Chip label="LEVEL 4" color="primary" />
//
//   // Coming soon label in Settings
//   <Chip label="COMING SOON" color="muted" />
//
//   // Combo badge on Robo screen
//   <Chip label="x1.5 COMBO" color="accent" />

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