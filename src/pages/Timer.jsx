import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Play, Pause, RotateCcw, ChevronDown, CheckCircle } from 'lucide-react'
import useTaskStore from '../data/useTaskStore'
import Header from '../components/Header'
import CircleCheck from '../components/CircleCheck'
import SegmentedControl from "../components/SegmentedControl.jsx";

// ─── constants ────────────────────────────────────────────────────────────────
const PHASES = {
    focus:      { label: 'Focus',       duration: 25 * 60, color: 'var(--color-primary)' },
    shortBreak: { label: 'Short Break', duration:  5 * 60, color: 'var(--color-success)' },
    longBreak:  { label: 'Long Break',  duration: 15 * 60, color: 'var(--color-accent)'  },
}

// Which phase comes after each, and when to take a long break
function nextPhase(phase, completedPomos) {
    if (phase === 'focus') {
        return completedPomos > 0 && completedPomos % 4 === 0 ? 'longBreak' : 'shortBreak'
    }
    return 'focus'
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
}

// Simple ding using Web Audio API
function playDing() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.value = 880
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.4, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 1.2)
    } catch { /* AudioContext not available */ }
}

// ─── component ────────────────────────────────────────────────────────────────
function Timer() {
    const navigate      = useNavigate()
    const location      = useLocation()
    const allTasks = useTaskStore(s => s.tasks)
    const tasks = allTasks.filter(t => t.status !== 'completed')
    const toggleSubtask = useTaskStore(s => s.toggleSubtask)

    // Pre-select task if navigated here with state
    const [selectedTaskId, setSelectedTaskId] = useState(location.state?.taskId ?? '')
    const [showTaskDrop, setShowTaskDrop]     = useState(false)

    // Timer state
    const [phase, setPhase]                   = useState('focus')
    const [secondsLeft, setSecondsLeft]       = useState(PHASES.focus.duration)
    const [running, setRunning]               = useState(false)
    const [completedPomos, setCompletedPomos] = useState(0)  // focus sessions done
    const [waitingForUser, setWaitingForUser] = useState(false) // dinged, waiting to start next

    const intervalRef = useRef(null)
    const phaseRef    = useRef(phase)
    phaseRef.current  = phase

    const selectedTask = tasks.find(t => t.id === selectedTaskId) ?? null
    const currentPhase = PHASES[phase]

    // ─── tick ─────────────────────────────────────────────────────────────────
    const handleDone = useCallback(() => {
        setRunning(false)
        playDing()
        setWaitingForUser(true)

        const newPomos = phaseRef.current === 'focus' ? completedPomos + 1 : completedPomos
        if (phaseRef.current === 'focus') setCompletedPomos(newPomos)

        const next = nextPhase(phaseRef.current, newPomos)
        setPhase(next)
        setSecondsLeft(PHASES[next].duration)
    }, [completedPomos])

    useEffect(() => {
        if (running) {
            intervalRef.current = setInterval(() => {
                setSecondsLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current)
                        handleDone()
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        } else {
            clearInterval(intervalRef.current)
        }
        return () => clearInterval(intervalRef.current)
    }, [running, handleDone])

    // ─── controls ─────────────────────────────────────────────────────────────
    function handleStartPause() {
        setWaitingForUser(false)
        setRunning(r => !r)
    }

    function handleReset() {
        setRunning(false)
        setWaitingForUser(false)
        setSecondsLeft(PHASES[phase].duration)
    }

    function handleSwitchPhase(p) {
        setRunning(false)
        setWaitingForUser(false)
        setPhase(p)
        setSecondsLeft(PHASES[p].duration)
    }

    // ─── progress ring ────────────────────────────────────────────────────────
    const total    = PHASES[phase].duration
    const progress = 1 - secondsLeft / total
    const R        = 100
    const C        = 2 * Math.PI * R
    const dash     = C * progress
    const gap      = C - dash

    // ─── render ───────────────────────────────────────────────────────────────
    return (
        <div style={{
            color: 'var(--color-text-main)',
            minHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
            paddingBottom: '96px',
        }}>
            <Header title="Pomodoro" onBack={() => navigate(-1)} />

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                padding: '16px 20px',
            }}>

                {/* Phase tabs */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    background: 'var(--color-card)',
                    borderRadius: '14px',
                    padding: '4px',
                    border: '1.5px solid var(--color-divider)',
                }}>
                    {Object.entries(PHASES).map(([key, val]) => (
                        <button
                            key={key}
                            onClick={() => handleSwitchPhase(key)}
                            className="label-bold"
                            style={{
                                flex: 1,
                                padding: '8px 4px',
                                borderRadius: '10px',
                                border: 'none',
                                cursor: 'pointer',
                                background: phase === key ? currentPhase.color : 'transparent',
                                color: phase === key ? '#fff' : 'var(--color-text-secondary)',
                                transition: 'all 0.2s',
                                fontSize: '11px',
                            }}
                        >
                            {val.label}
                        </button>
                    ))}
                </div>

                {/* Ring + time */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0px',
                    padding: '8px 0',
                }}>
                    <div style={{ position: 'relative', width: '240px', height: '240px' }}>
                        <svg
                            viewBox="0 0 240 240"
                            style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}
                        >
                            {/* Track */}
                            <circle
                                cx="120" cy="120" r={R}
                                fill="none"
                                stroke="var(--color-divider)"
                                strokeWidth="10"
                            />
                            {/* Progress */}
                            <circle
                                cx="120" cy="120" r={R}
                                fill="none"
                                stroke={currentPhase.color}
                                strokeWidth="10"
                                strokeLinecap="round"
                                strokeDasharray={`${dash} ${gap}`}
                                style={{ transition: running ? 'stroke-dasharray 1s linear' : 'none' }}
                            />
                        </svg>

                        {/* Time display */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                        }}>
                            <span style={{
                                fontSize: '52px',
                                fontWeight: 700,
                                letterSpacing: '-2px',
                                color: waitingForUser ? 'var(--color-text-secondary)' : 'var(--color-text-main)',
                                transition: 'color 0.3s',
                                fontVariantNumeric: 'tabular-nums',
                            }}>
                                {formatTime(secondsLeft)}
                            </span>
                            <span className="label-caps" style={{
                                color: currentPhase.color,
                                letterSpacing: '0.12em',
                            }}>
                                {waitingForUser ? 'Ready when you are' : currentPhase.label}
                            </span>
                        </div>
                    </div>

                    {/* Pomo dots */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        {[0, 1, 2, 3].map(i => (
                            <div key={i} style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: i < (completedPomos % 4) || (completedPomos % 4 === 0 && completedPomos > 0 && i === 0 && phase !== 'focus')
                                    ? currentPhase.color
                                    : 'var(--color-divider)',
                                transition: 'background 0.3s',
                            }} />
                        ))}
                    </div>
                    <span className="label-caps" style={{
                        color: 'var(--color-text-secondary)',
                        marginTop: '6px',
                    }}>
                        {completedPomos} session{completedPomos !== 1 ? 's' : ''} complete
                    </span>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                    {/* Reset */}
                    <button
                        onClick={handleReset}
                        style={{
                            width: '48px', height: '48px', borderRadius: '50%',
                            background: 'var(--color-card)',
                            border: '1.5px solid var(--color-divider)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: 'var(--color-text-secondary)',
                        }}
                    >
                        <RotateCcw size={18} strokeWidth={2} />
                    </button>

                    {/* Play / Pause */}
                    <button
                        onClick={handleStartPause}
                        style={{
                            width: '72px', height: '72px', borderRadius: '50%',
                            background: currentPhase.color,
                            border: 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: '#fff',
                            boxShadow: `0 8px 24px color-mix(in srgb, ${currentPhase.color} 40%, transparent)`,
                            transition: 'all 0.2s',
                        }}
                    >
                        {running
                            ? <Pause  size={28} strokeWidth={2.5} />
                            : <Play   size={28} strokeWidth={2.5} style={{ marginLeft: '3px' }} />
                        }
                    </button>

                    {/* Spacer to balance reset button */}
                    <div style={{ width: '48px' }} />
                </div>

                {/* Task selector */}
                <div>
                    <p className="label-bold" style={{
                        color: 'var(--color-text-secondary)',
                        margin: '0 0 8px',
                        letterSpacing: '0.08em',
                    }}>
                        Linked Task
                    </p>
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowTaskDrop(v => !v)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '12px',
                                padding: '14px 16px',
                                background: 'var(--color-card)',
                                border: `1.5px solid ${selectedTask ? 'var(--color-primary)' : 'var(--color-divider)'}`,
                                borderRadius: '14px',
                                cursor: 'pointer',
                                color: selectedTask ? 'var(--color-text-main)' : 'var(--color-text-secondary)',
                                textAlign: 'left',
                                transition: 'border-color 0.2s',
                            }}
                        >
                            <span className="body" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {selectedTask ? selectedTask.name : 'No task selected'}
                            </span>
                            <ChevronDown
                                size={16}
                                color="var(--color-text-secondary)"
                                style={{ flexShrink: 0, transform: showTaskDrop ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                            />
                        </button>

                        {showTaskDrop && (
                            <div style={{
                                position: 'absolute',
                                top: 'calc(100% + 6px)',
                                left: 0, right: 0,
                                background: 'var(--color-card)',
                                border: '1.5px solid var(--color-divider)',
                                borderRadius: '14px',
                                overflow: 'hidden',
                                zIndex: 50,
                                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                                maxHeight: '220px',
                                overflowY: 'auto',
                            }}>
                                {/* None option */}
                                <button
                                    onClick={() => { setSelectedTaskId(''); setShowTaskDrop(false) }}
                                    className="body"
                                    style={{
                                        width: '100%', textAlign: 'left',
                                        padding: '12px 16px', background: 'none', border: 'none',
                                        borderBottom: '1px solid var(--color-divider)',
                                        cursor: 'pointer',
                                        color: 'var(--color-text-secondary)',
                                    }}
                                >
                                    No task
                                </button>

                                {tasks.length === 0 && (
                                    <p className="caption" style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', margin: 0 }}>
                                        No active tasks
                                    </p>
                                )}

                                {tasks.map((t, i) => (
                                    <button
                                        key={t.id}
                                        onClick={() => { setSelectedTaskId(t.id); setShowTaskDrop(false) }}
                                        style={{
                                            width: '100%', textAlign: 'left',
                                            padding: '12px 16px', background: 'none', border: 'none',
                                            borderBottom: i < tasks.length - 1 ? '1px solid var(--color-divider)' : 'none',
                                            cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '10px',
                                        }}
                                    >
                                        {t.id === selectedTaskId && (
                                            <CheckCircle size={14} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                                        )}
                                        <span className="body" style={{
                                            color: t.id === selectedTaskId ? 'var(--color-primary)' : 'var(--color-text-main)',
                                            flex: 1,
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        }}>
                                            {t.name}
                                        </span>
                                        {t.due && (
                                            <span className="label-caps" style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }}>
                                                {new Date(t.due + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Subtasks — only when a task with subtasks is selected */}
                {selectedTask && selectedTask.subtasks?.length > 0 && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span className="label-bold" style={{ color: 'var(--color-text-secondary)', letterSpacing: '0.08em' }}>
                                Subtasks
                            </span>
                            <span className="label-bold" style={{
                                color: selectedTask.subtasks.filter(s => s.done).length === selectedTask.subtasks.length
                                    ? 'var(--color-success)'
                                    : 'var(--color-text-secondary)',
                            }}>
                                {selectedTask.subtasks.filter(s => s.done).length} / {selectedTask.subtasks.length} Done
                            </span>
                        </div>

                        <div style={{
                            background: 'var(--color-card)',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            border: '1.5px solid var(--color-divider)',
                        }}>
                            {selectedTask.subtasks.map((subtask, i) => (
                                <div
                                    key={subtask.id}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                        padding: '14px 16px',
                                        borderBottom: i < selectedTask.subtasks.length - 1
                                            ? '1px solid var(--color-divider)' : 'none',
                                    }}
                                >
                                    <CircleCheck
                                        checked={subtask.done}
                                        onChange={() => toggleSubtask(selectedTask.id, subtask.id)}
                                        size={22}
                                    />
                                    <span className="body" style={{
                                        flex: 1,
                                        color: subtask.done ? 'var(--color-text-secondary)' : 'var(--color-text-main)',
                                        textDecoration: subtask.done ? 'line-through' : 'none',
                                        fontWeight: subtask.done ? 400 : 500,
                                    }}>
                                        {subtask.label}
                                    </span>
                                    {subtask.ai && !subtask.done && (
                                        <span className="label-caps" style={{
                                            fontWeight: 700,
                                            color: 'var(--color-primary)',
                                            background: 'var(--color-primary-soft)',
                                            padding: '2px 8px',
                                            borderRadius: '999px',
                                            border: '1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)',
                                        }}>
                                            AI
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}

export default Timer