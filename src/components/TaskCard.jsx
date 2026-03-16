import { priority as priorityMap } from '../data/priority'

function formatDate(dateStr) {
    if (!dateStr) return null
    const date = new Date(dateStr + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diff = (date - today) / (1000 * 60 * 60 * 24)
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Tomorrow'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        .replace(/(\d+)/, (_, d) => {
            const s = ['th','st','nd','rd']
            const v = d % 100
            return d + (s[(v - 20) % 10] || s[v] || s[0])
        })
}

function TaskCard({ title, due, time, priority = 'med', subtasks = [], done = false, onCheck, onClick }) {
    const p = priorityMap[priority]
    const firstSubtask = subtasks[0]
    const remaining = subtasks.length - 1

    return (
        <div
            style={{
                background: 'var(--color-surface)',
                borderRadius: '16px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                cursor: 'pointer',
                boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                transition: 'opacity 0.15s',
            }}
            onMouseDown={e => e.currentTarget.style.opacity = '0.7'}
            onMouseUp={e => e.currentTarget.style.opacity = '1'}
        >
            {/* checkbox */}
            <button
                onClick={e => { e.stopPropagation(); onCheck && onCheck() }}
                style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    border: `2px solid ${done ? 'var(--color-success)' : 'var(--color-surface-alt)'}`,
                    background: done ? 'var(--color-success)' : 'none',
                    flexShrink: 0,
                    marginTop: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                }}
            >
                {done && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                )}
            </button>

            {/* content */}
            <div onClick={onClick} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <span style={{
              color: done ? 'var(--color-text-muted)' : 'var(--color-text)',
              fontWeight: 600,
              fontSize: '14px',
              flex: 1,
              textDecoration: done ? 'line-through' : 'none',
          }}>
            {title}
          </span>
                    <span style={{
                        background: `color-mix(in srgb, ${p.color} 15%, transparent)`,
                        color: p.color,
                        fontSize: '10px',
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        padding: '2px 8px',
                        borderRadius: '20px',
                        whiteSpace: 'nowrap',
                    }}>
            {p.label}
          </span>
                </div>

                {(due || time) && (
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
            Due: {formatDate(due)}{time ? ` · ${time}` : ''}
          </span>
                )}

                {firstSubtask && (
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>
            ↳ {firstSubtask.label}{remaining > 0 ? ` · +${remaining} more tasks` : ''}
          </span>
                )}
            </div>
        </div>
    )
}

export default TaskCard