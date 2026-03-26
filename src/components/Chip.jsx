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

const chipColors = {
    primary: { background: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',     color: 'var(--color-primary-soft)' },
    accent:  { background: 'color-mix(in srgb, var(--color-accent) 20%, transparent)',       color: 'var(--color-accent)' },
    success: { background: 'color-mix(in srgb, var(--color-success) 20%, transparent)',      color: 'var(--color-success)' },
    danger:  { background: 'color-mix(in srgb, var(--color-danger) 20%, transparent)',       color: 'var(--color-danger)' },
    muted:   { background: 'color-mix(in srgb, var(--color-text-muted) 20%, transparent)',   color: 'var(--color-text-muted)' },
}

function Chip({
    label,
    color = 'primary',
    style: customStyles = {},
    className = null,
    onClick = null,
}) {
    const colorStyles = chipColors[color] ?? chipColors.primary;
    const styles = {
        border: 'none',
        borderRadius: '20px',
        padding: '6px 14px',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.06em',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        cursor: (onClick == null ? null : 'pointer'),
        ...colorStyles,
        ...customStyles,
    }

    const props = {
        style: styles,
        className: className,
    }

    return (onClick != null)
        ? <button {...props} onClick={onClick}>{label}</button>
        : <span {...props}>{label}</span>
}

export default Chip