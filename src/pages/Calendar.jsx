import Header from '../components/Header'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
]

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay()
}

function Calendar() {
    const today      = new Date()
    const year       = today.getFullYear()
    const month      = today.getMonth()
    const todayDate  = today.getDate()

    const daysInMonth = getDaysInMonth(year, month)
    const startOffset = getFirstDayOfMonth(year, month)

    const cells = [
        ...Array(startOffset).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ]
    while (cells.length % 7 !== 0) cells.push(null)

    const weeks = []
    for (let i = 0; i < cells.length; i += 7) {
        weeks.push(cells.slice(i, i + 7))
    }

    return (
        <div className="page flex flex-col gap-0 min-h-screen" style={{ background: 'var(--color-bg)' }}>

            <Header subtitle={`${MONTHS[month].toUpperCase()} ${year}`} title="Calendar" />

            <div style={{ padding: '0 16px 16px' }}>

                {/* Coming Soon banner */}
                <div style={{
                    borderRadius: '14px',
                    border: '1px dashed var(--color-border, rgba(255,255,255,0.15))',
                    background: 'var(--color-surface, rgba(255,255,255,0.04))',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '16px',
                }}>
                    <span style={{ fontSize: '16px' }}>🚧</span>
                    <span style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'var(--color-text-muted)',
                        letterSpacing: '0.02em',
                    }}>
                        Placeholder - Coming Soon
                    </span>
                </div>

                {/* Day-of-week headers */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    marginBottom: '4px',
                }}>
                    {DAYS.map(d => (
                        <div key={d} style={{
                            textAlign: 'center',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            color: 'var(--color-text-muted)',
                            paddingBottom: '8px',
                            userSelect: 'none',
                        }}>
                            {d}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {weeks.map((week, wi) => (
                        <div
                            key={wi}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(7, 1fr)',
                                gap: '4px',
                            }}
                        >
                            {week.map((day, di) => {
                                const isToday = day === todayDate
                                const isSun   = di === 0
                                const isSat   = di === 6

                                return (
                                    <div
                                        key={di}
                                        style={{
                                            aspectRatio: '1',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '50%',
                                            position: 'relative',
                                            background: isToday
                                                ? 'var(--color-primary, #a78bfa)'
                                                : 'transparent',
                                            boxShadow: isToday
                                                ? '0 0 16px var(--color-primary-glow, rgba(167,139,250,0.35))'
                                                : 'none',
                                        }}
                                    >
                                        {day !== null && (
                                            <span style={{
                                                fontSize: '14px',
                                                fontWeight: isToday ? 800 : isSun || isSat ? 500 : 400,
                                                color: isToday
                                                    ? '#fff'
                                                    : isSun || isSat
                                                        ? 'var(--color-text-muted)'
                                                        : 'var(--color-text-main)',
                                                userSelect: 'none',
                                                lineHeight: 1,
                                            }}>
                                                {day}
                                            </span>
                                        )}

                                        {isToday && (
                                            <div style={{
                                                position: 'absolute',
                                                inset: '-3px',
                                                borderRadius: '50%',
                                                border: '1.5px solid var(--color-primary, #a78bfa)',
                                                opacity: 0.4,
                                                pointerEvents: 'none',
                                            }} />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>

            </div>

        </div>
    )
}

export default Calendar