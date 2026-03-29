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
function ProgressBar({
                         value,
                         max,
                         color = 'var(--color-primary)',
                         size = 'md',
                         label,
                         showMax = false
                     }) {
    const percent = max > 0 ? Math.min(100, (value / max) * 100) : 0;

    // Adjusted sizes for a more modern mobile feel
    const height = size === 'sm' ? '6px' : '10px';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>

            {/* label row */}
            {(label || showMax) && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline'
                }}>
                    {label && (
                        <span className="label-caps" style={{
                            color: 'var(--color-text-secondary)',
                        }}>
                            {label}
                        </span>
                    )}
                    {showMax && (
                        <span className="label-medium" style={{
                            fontSize: '12px',
                            color: 'var(--color-text-mid)',
                            marginLeft: 'auto',
                        }}>
                            {value} <span style={{ opacity: 0.5 }}>/</span> {max}
                        </span>
                    )}
                </div>
            )}

            {/* track */}
            <div style={{
                width: '100%',
                height,
                background: 'var(--color-divider)', // Using divider for the empty track
                borderRadius: '100px',
                overflow: 'hidden',
                // Optional: add a tiny bit of depth in dark themes
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
            }}>
                {/* fill */}
                <div style={{
                    width: `${percent}%`,
                    height: '100%',
                    background: color,
                    borderRadius: '100px',
                    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)', // Smoother easing
                    // Using a subtle gradient for a premium "glow" effect
                    backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)'
                }} />
            </div>

        </div>
    )
}

export default ProgressBar