import { useState, useRef } from 'react'
import { priority as priorityMap } from '../data/priority'
import { Pencil, Trash2 } from 'lucide-react'

function TaskCard({ title, due, time, priority = 'med', subtasks = [], onClick, onDelete, onEdit, swipeX, onSwipeChange }) {
    const [done, setDone] = useState(false)
    const [swiping, setSwiping] = useState(false)
    const startX = useRef(null)
    const p = priorityMap[priority]
    const firstSubtask = subtasks[0]
    const remaining = subtasks.length - 1
    const THRESHOLD = 60

    // Swipe Actions for TaskCards
        // Swipe Left to Delete
        // Swipe Right to Edit
    function onTouchStart(e) {
        startX.current = e.touches[0].clientX
        setSwiping(true)
    }

    function onTouchMove(e) {
        if (startX.current === null) return
        const diff = e.touches[0].clientX - startX.current
        onSwipeChange(Math.max(-THRESHOLD, Math.min(THRESHOLD, diff)))
    }

    function onTouchEnd() {
        if (Math.abs(swipeX) < THRESHOLD / 2) {
            onSwipeChange(0)
        }
        setSwiping(false)
        startX.current = null
    }

    const showDelete = swipeX < -THRESHOLD / 2
    const showEdit   = swipeX > THRESHOLD / 2

    return (
        <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden' }}>

            {/* action buttons */}
            <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: '16px',
            }}>
                <div
                    onClick={() => { onEdit && onEdit(); onSwipeChange(0) }}
                    style={{
                        background: 'var(--color-primary)',
                        width: '64px',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '16px 0 0 16px',
                        opacity: showEdit ? 1 : 0,
                        transition: 'opacity 0.15s',
                        cursor: 'pointer',
                    }}>
                    <Pencil size={18} color="white" />
                </div>
                <div
                    onClick={() => { onDelete && onDelete(); onSwipeChange(0) }}
                    style={{
                        background: 'var(--color-danger)',
                        width: '64px',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '0 16px 16px 0',
                        opacity: showDelete ? 1 : 0,
                        transition: 'opacity 0.15s',
                        cursor: 'pointer',
                    }}>
                    <Trash2 size={18} color="white" />
                </div>
            </div>

            {/* card */}
            <div
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onClick={() => {
                    if (Math.abs(swipeX) > 5) { onSwipeChange(0); return }
                    onClick && onClick()
                }}
                style={{
                    background: 'var(--color-surface)',
                    borderRadius: '16px',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                    transform: `translateX(${swipeX}px)`,
                    transition: swiping ? 'none' : 'transform 0.25s ease',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                {/* checkbox */}
                <div
                    onClick={e => { e.stopPropagation(); setDone(d => !d) }}
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
                        transition: 'all 0.15s',
                        cursor: 'pointer',
                    }}
                >
                    {done && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    )}
                </div>

                {/* content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{
                color: done ? 'var(--color-text-muted)' : 'var(--color-text)',
                fontWeight: 600,
                fontSize: '14px',
                flex: 1,
                textDecoration: done ? 'line-through' : 'none',
                transition: 'all 0.2s',
            }}>
              {title}
            </span>
                        {!done && (
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
                        )}
                    </div>

                    {!done && (due || time) && (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
              Due: {due}{time ? ` · ${time}` : ''}
            </span>
                    )}

                    {!done && firstSubtask && (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>
              ↳ {firstSubtask.label}{remaining > 0 ? ` · +${remaining} more tasks` : ''}
            </span>
                    )}
                </div>
            </div>
        </div>
    )
}

export default TaskCard