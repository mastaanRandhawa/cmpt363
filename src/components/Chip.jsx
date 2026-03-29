// Updated chip color mapping to include full color spectrum

/*
Example usage
<Chip label="Level 4" color="primary" />
<Chip label="AI Active" color="blue" />

<Chip label="Deep Work" color="secondary" />
<Chip label="Focus Mode" color="purple" />

<Chip label="Complete" color="success" />
<Chip label="Medal Earned" color="green" />

<Chip label="Overdue" color="important" />
<Chip label="Critical" color="red" />

<Chip label="x2.0 Streak" color="accent" />
<Chip label="Combo Active" color="pink" />

<Chip label="Archive" color="muted" />
<Chip label="Tag" color="grey" />
 */


const chipColors = {
    // Primary: Map to Blue/Robo/Level
    primary: {
        background: 'var(--color-primary-soft)',
        color: 'var(--color-primary)'
    },
    blue: {
        background: 'var(--color-primary-soft)',
        color: 'var(--color-primary)'
    },

    // Purple: Map to Secondary
    secondary: {
        background: 'var(--color-secondary-soft)',
        color: 'var(--color-secondary)'
    },
    purple: {
        background: 'var(--color-secondary-soft)',
        color: 'var(--color-secondary)'
    },

    // Green: Map to Success/Medals/Growth
    success: {
        background: 'var(--color-success-soft)',
        color: 'var(--color-success)'
    },
    green: {
        background: 'var(--color-success-soft)',
        color: 'var(--color-success)'
    },

    // Red: Map to Important/Error/Warnings
    important: {
        background: 'var(--color-important-soft)',
        color: 'var(--color-important)'
    },
    red: {
        background: 'var(--color-important-soft)',
        color: 'var(--color-important)'
    },

    // Pink: Map to Accent/Combos/Streaks
    accent: {
        background: 'var(--color-accent-soft)',
        color: 'var(--color-accent)'
    },
    pink: {
        background: 'var(--color-accent-soft)',
        color: 'var(--color-accent)'
    },

    // Muted: Map to neutral grey for metadata/filtering
    muted: {
        background: 'var(--color-divider)',
        color: 'var(--color-text-mid)'
    },
    grey: {
        background: 'var(--color-divider)',
        color: 'var(--color-text-mid)'
    },
}

function Chip({
                  label,
                  color = 'primary', // Default to brand primary (blue)
                  style: customStyles = {},
                  className = "",
                  onClick = null,
              }) {
    // Fallback to primary if the specific color key isn't found
    const colorStyles = chipColors[color] ?? chipColors.primary;

    const styles = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        borderRadius: '100px', // Perfect pill shape
        padding: '3px 9px',   // Slightly tighter padding for pill aesthetic
        whiteSpace: 'nowrap',
        flexShrink: 0,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        textTransform: 'none', // Overriding .label-caps text-transform default
        ...colorStyles,
        ...customStyles,
    }

    // Applying label-caps ensures standard size (13px), weight, and letter-spacing.
    const combinedClassName = `label-caps ${className}`.trim();

    if (onClick) {
        return (
            <button
                style={styles}
                className={`${combinedClassName} transition-opacity active:opacity-70`}
                onClick={onClick}
            >
                {label}
            </button>
        )
    }

    return (
        <span style={styles} className={combinedClassName}>
            {label}
        </span>
    )
}

export default Chip