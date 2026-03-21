// ProgressBar
// A horizontal fill bar for showing progress toward a goal.
// Used on the Robo screen for XP progress toward the next level.
//
// Props:
//   value   – number, current value (e.g. 230)
//   max     – number, maximum value (e.g. 300)
//   color   – CSS color string, fill color (default 'var(--color-primary)')
//   size    – 'sm' | 'md' (default 'md')
//             'md' = 8px tall, used for the Robo XP bar
//             'sm' = 4px tall, available for subtask or secondary progress bars
//   label   – string, small caps label on the left (e.g. 'XP') (optional)
//   showMax – boolean, shows "value / max" text on the right (default false)
//
// Usage examples:
//   // Robo XP bar
//   <ProgressBar value={230} max={300} label="XP" showMax />
//
//   // Subtask progress (no label, thin)
//   <ProgressBar value={2} max={5} size="sm" />
//
//   // Custom color (e.g. accent for a streak bar)
//   <ProgressBar value={3} max={7} color="var(--color-accent)" label="STREAK" showMax />

function ProgressBar({ value, max, color = 'var(--color-primary)', size = 'md', label, showMax = false }) {
    const percent = max > 0 ? Math.min(100, (value / max) * 100) : 0
    const height  = size === 'sm' ? '4px' : '8px'

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>

            {/* label row — only rendered when label or showMax is present */}
            {(label || showMax) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {label && (
                        <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            color: 'var(--color-text-muted)',
                        }}>
                            {label}
                        </span>
                    )}
                    {showMax && (
                        <span style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: 'var(--color-text-muted)',
                            marginLeft: 'auto',
                        }}>
                            {value} / {max}
                        </span>
                    )}
                </div>
            )}

            {/* track */}
            <div style={{
                width: '100%',
                height,
                background: 'var(--color-surface-alt)',
                borderRadius: '999px',
                overflow: 'hidden',
            }}>
                {/* fill */}
                <div style={{
                    width: `${percent}%`,
                    height: '100%',
                    background: color,
                    borderRadius: '999px',
                    transition: 'width 0.4s ease',
                }} />
            </div>

        </div>
    )
}

export default ProgressBar