import { useState, useRef, useEffect } from 'react'
import { Command, Lock, LockOpen } from 'lucide-react'
import useTaskStore from '../data/useTaskStore'

const THUMB_SIZE  = 52
const TRACK_PAD   = 4

function getWeekBounds() {
    const now   = new Date()
    const day   = now.getDay()
    const start = new Date(now)
    start.setDate(now.getDate() - day)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    return { start, end }
}

function buildMessage(tasks) {
    const { start, end } = getWeekBounds()

    const today    = new Date(); today.setHours(0, 0, 0, 0)
    const nextStart = new Date(end); nextStart.setDate(nextStart.getDate() + 1)
    const nextEnd   = new Date(nextStart); nextEnd.setDate(nextStart.getDate() + 6)

    const weekTasks   = tasks.filter(t => {
        if (!t.due) return false
        const d = new Date(t.due + 'T00:00:00')
        return d >= start && d <= end
    })
    const overdueTasks = tasks.filter(t => {
        if (!t.due || t.status === 'completed') return false
        return new Date(t.due + 'T00:00:00') < today
    })
    const nextWeekTasks = tasks.filter(t => {
        if (!t.due) return false
        const d = new Date(t.due + 'T00:00:00')
        return d >= nextStart && d <= nextEnd
    })

    const total     = weekTasks.length
    const completed = weekTasks.filter(t => t.status === 'completed').length
    const remaining = total - completed
    const overdue   = overdueTasks.length
    const dayName   = new Date().toLocaleDateString('en-US', { weekday: 'long' })

    // Overdue takes priority
    if (overdue > 0 && remaining > 0) {
        return {
            title: `${overdue} overdue + ${remaining} left this week`,
            body:  `No stress — let's take it one step at a time. Your progress this week: ${completed} of ${total} done.`,
        }
    }

    if (overdue > 0 && remaining === 0) {
        return {
            title: `${overdue} overdue task${overdue > 1 ? 's' : ''} to catch up on`,
            body:  `You've cleared everything else this week — great work. These ones are still waiting when you're ready.`,
        }
    }

    if (total === 0 && nextWeekTasks.length > 0) {
        const next = nextWeekTasks.length
        return {
            title: `Mid-week check in: Your week is clear — ${next} coming up next week`,
            body:  `Getting a head start now is always a good feeling. Take a peek at what's ahead!`,
        }
    }

    if (total === 0) {
        return {
            title: 'Mid-week check in: Your week is clear!',
            body:  'Nothing scheduled — a great chance to get ahead or just recharge.',
        }
    }

    if (remaining === 0) {
        return {
            title: `Week complete! ${completed}/${total} done ✓`,
            body:  "You've cleared everything on your list this week. Genuinely impressive.",
        }
    }

    const variants = [
        {
            title: `${dayName} check-in — ${completed} of ${total} done`,
            body:  `${remaining} task${remaining > 1 ? 's' : ''} left this week. You're making real progress — keep it up!`,
        },
        {
            title: `Midweek momentum — ${completed}/${total} tasks`,
            body:  `${remaining} more to go. You've got this — one at a time!`,
        },
        {
            title: `${completed} down, ${remaining} to go this week`,
            body:  `Nice work so far. Let's keep the streak alive — you're closer than you think.`,
        },
    ]

    return variants[new Date().getDay() % variants.length]
}

function LockScreen({ onUnlock }) {
    const tasks   = useTaskStore(s => s.tasks)
    const message = buildMessage(tasks)

    const [slideX, setSlideX]     = useState(0)
    const [dragging, setDragging] = useState(false)
    const [fading, setFading]     = useState(false)
    const trackRef                = useRef(null)
    const startX                  = useRef(null)
    const startSlide              = useRef(0)

    const [time, setTime] = useState(() => {
        const now = new Date()
        return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    })
    const [dateStr] = useState(() =>
        new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    )

    useEffect(() => {
        const id = setInterval(() => {
            const now = new Date()
            setTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }))
        }, 1000)
        return () => clearInterval(id)
    }, [])

    function trackWidth() {
        return (trackRef.current?.clientWidth ?? 280) - THUMB_SIZE - TRACK_PAD * 2
    }

    function onTouchStart(e) {
        startX.current     = e.touches[0].clientX
        startSlide.current = slideX
        setDragging(true)
    }

    function onMouseDown(e) {
        startX.current     = e.clientX
        startSlide.current = slideX
        setDragging(true)
    }

    function onMove(clientX) {
        if (startX.current === null) return
        const diff = clientX - startX.current
        const next = Math.max(0, Math.min(trackWidth(), startSlide.current + diff))
        setSlideX(next)
    }

    function onEnd() {
        if (!dragging) return
        setDragging(false)
        startX.current = null
        const ratio = slideX / trackWidth()
        if (ratio >= 0.75) {
            setSlideX(trackWidth())
            setFading(true)
            setTimeout(onUnlock, 400)
        } else {
            setSlideX(0)
        }
    }

    useEffect(() => {
        if (!dragging) return
        function mm(e) { onMove(e.touches ? e.touches[0].clientX : e.clientX) }
        function mu()  { onEnd() }
        window.addEventListener('touchmove', mm)
        window.addEventListener('touchend',  mu)
        window.addEventListener('mousemove', mm)
        window.addEventListener('mouseup',   mu)
        return () => {
            window.removeEventListener('touchmove', mm)
            window.removeEventListener('touchend',  mu)
            window.removeEventListener('mousemove', mm)
            window.removeEventListener('mouseup',   mu)
        }
    }, [dragging, slideX])

    const slideRatio  = slideX / (trackWidth() || 1)
    const labelOpacity = Math.max(0, 1 - slideRatio * 2)

    return (
        <div style={{
            position:   'absolute',
            inset:       0,
            zIndex:      200,
            display:    'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflow:   'hidden',
            borderRadius: '48px',
            opacity:    fading ? 0 : 1,
            transition: fading ? 'opacity 0.4s ease' : 'none',

            /* iOS-style wallpaper — deep blue/purple space gradient */
            background: `
                radial-gradient(ellipse at 30% 20%, #3b2d6e 0%, transparent 60%),
                radial-gradient(ellipse at 75% 60%, #1a3a5c 0%, transparent 55%),
                radial-gradient(ellipse at 50% 90%, #0d1f3c 0%, transparent 50%),
                linear-gradient(160deg, #1a1040 0%, #0b1a35 50%, #050d1a 100%)
            `,
        }}>

            {/* subtle star-like noise overlay */}
            <div style={{
                position: 'absolute', inset: 0, borderRadius: 'inherit',
                backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
                opacity: 0.25,
                pointerEvents: 'none',
            }} />

            {/* ── time + date ─────────────────────────────────────── */}
            <div style={{
                marginTop: '80px',
                textAlign: 'center',
                color: 'white',
                zIndex: 1,
            }}>
                <div style={{
                    fontSize: '72px',
                    fontWeight: 200,
                    letterSpacing: '-2px',
                    lineHeight: 1,
                }}>
                    {time.replace(/\s?(AM|PM)/, '')}
                    <span style={{ fontSize: '28px', fontWeight: 300, marginLeft: '6px', opacity: 0.7 }}>
                        {time.match(/AM|PM/)?.[0]}
                    </span>
                </div>
                <div style={{
                    marginTop: '8px',
                    fontSize: '16px',
                    fontWeight: 400,
                    opacity: 0.75,
                    letterSpacing: '0.02em',
                }}>
                    {dateStr}
                </div>
            </div>

            {/* ── Robo notification banner ─────────────────────────── */}
            <div style={{
                marginTop:    '40px',
                width:        'calc(100% - 32px)',
                background:   'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border:       '1px solid rgba(255,255,255,0.18)',
                padding:      '14px 16px',
                zIndex:        1,
            }}>
                {/* banner header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{
                        width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                        background: 'rgba(255,255,255,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Command size={15} color="white" />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.06em' }}>
                        ROBO
                    </span>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginLeft: 'auto' }}>
                        now
                    </span>
                </div>
                {/* banner body */}
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'white', lineHeight: 1.3 }}>
                    {message.title}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.4 }}>
                    {message.body}
                </p>
            </div>

            {/* ── spacer ───────────────────────────────────────────── */}
            <div style={{ flex: 1 }} />

            {/* ── slide to unlock ──────────────────────────────────── */}
            <div style={{ width: 'calc(100% - 48px)', marginBottom: '56px', zIndex: 1 }}>
                <div
                    ref={trackRef}
                    style={{
                        position:     'relative',
                        height:       `${THUMB_SIZE + TRACK_PAD * 2}px`,
                        background:   'rgba(255,255,255,0.12)',
                        borderRadius: '999px',
                        border:       '1px solid rgba(255,255,255,0.18)',
                        display:      'flex',
                        alignItems:   'center',
                        padding:      `0 ${TRACK_PAD}px`,
                        cursor:       'pointer',
                        userSelect:   'none',
                    }}
                >
                    {/* label */}
                    <span style={{
                        position:   'absolute',
                        left: 0, right: 0,
                        textAlign:  'center',
                        fontSize:   '14px',
                        fontWeight: 500,
                        color:      'rgba(255,255,255,0.6)',
                        letterSpacing: '0.04em',
                        pointerEvents: 'none',
                        opacity:    labelOpacity,
                        transition: dragging ? 'none' : 'opacity 0.2s',
                    }}>
                        slide to unlock
                    </span>

                    {/* thumb */}
                    <div
                        onTouchStart={onTouchStart}
                        onMouseDown={onMouseDown}
                        style={{
                            width:        `${THUMB_SIZE}px`,
                            height:       `${THUMB_SIZE}px`,
                            borderRadius: '50%',
                            background:   'rgba(255,255,255,0.9)',
                            display:      'flex',
                            alignItems:   'center',
                            justifyContent: 'center',
                            flexShrink:   0,
                            transform:    `translateX(${slideX}px)`,
                            transition:   dragging ? 'none' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            cursor:       'grab',
                            zIndex:       2,
                        }}
                    >
                        {slideRatio >= 0.75
                            ? <LockOpen size={20} color="#1a1040" />
                            : <Lock     size={20} color="#1a1040" />
                        }
                    </div>
                </div>
            </div>

        </div>
    )
}

export default LockScreen