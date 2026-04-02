import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Play, Pause, RotateCcw, ChevronDown, CheckCircle } from 'lucide-react'
import useTimerStore, { MODES } from '../data/useTimerStore'
import useTaskStore from '../data/useTaskStore'
import CircleCheck from '../components/CircleCheck'
import ConfirmDialog from '../components/ConfirmDialog'
import FadeOverlay from '../components/FadeOverlay'
import Header from '../components/Header'

// ─── Module-level interval ─────────────────────────────────────────────────────
// Lives outside React so the clock keeps ticking even when the component
// is unmounted (i.e. when the user navigates away from the Timer page).
let _intervalId = null

function _flushTime() {
    const { taskId, sessionSec } = useTimerStore.getState()
    if (!taskId || sessionSec < 1) return
    const task = useTaskStore.getState().tasks.find(t => t.id === taskId)
    if (task) {
        useTaskStore.getState().updateTask(taskId, {
            timeSpent: (task.timeSpent ?? 0) + sessionSec,
        })
    }
    useTimerStore.setState({ sessionSec: 0 })
}

function _tick() {
    const { seconds, modeIdx, running, sessions, sessionSec } = useTimerStore.getState()
    if (!running) { _stopInterval(); return }

    const isWork = MODES[modeIdx].key === 'focus'

    if (seconds <= 1) {
        _stopInterval()
        _flushTime()
        playDing()
        const newSessions = isWork ? sessions + 1 : sessions
        const nextModeIdx = _nextModeIdx(modeIdx, newSessions)
        useTimerStore.setState({
            seconds:        MODES[nextModeIdx].minutes * 60,
            modeIdx:        nextModeIdx,
            running:        false,
            sessions:       newSessions,
            startedAt:      null,
            waitingForUser: true,
        })
        return
    }

    useTimerStore.setState({
        seconds:    seconds - 1,
        sessionSec: isWork ? sessionSec + 1 : sessionSec,
    })
}

function _startInterval() {
    if (_intervalId) return   // already running — don't double-start
    _intervalId = setInterval(_tick, 1000)
}

function _stopInterval() {
    clearInterval(_intervalId)
    _intervalId = null
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
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

// After a focus session: long break every 4, otherwise short break.
// After any break: back to focus.
function _nextModeIdx(currentModeIdx, sessionsAfter) {
    if (currentModeIdx === 0) {
        return sessionsAfter > 0 && sessionsAfter % 4 === 0 ? 2 : 1
    }
    return 0
}

function formatTime(s) {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const r = (s % 60).toString().padStart(2, '0')
    return `${m}:${r}`
}

// ─── Component ─────────────────────────────────────────────────────────────────
const R = 100
const Circ = 2 * Math.PI * R

export default function Timer() {
    const navigate      = useNavigate()
    const location      = useLocation()
    const allTasks      = useTaskStore(s => s.tasks)
    const tasks         = allTasks.filter(t => t.status !== 'completed')
    const toggleSubtask = useTaskStore(s => s.toggleSubtask)

    // All timer state lives in the store — survives navigation
    const { modeIdx, seconds, running, sessions, taskId, waitingForUser } = useTimerStore()

    // showTaskDrop is intentionally local — no reason to persist a dropdown's open state
    const [showTaskDrop, setShowTaskDrop] = useState(false)
    const [pendingTaskId, setPendingTaskId] = useState(null)  // task switch awaiting confirmation

    // On mount: resume interval if the timer was running, and pre-select any task
    // passed via router state (e.g. tapping the timer icon from TaskDetail).
    useEffect(() => {
        // Pre-select task from navigation state (TaskDetail → Timer)
        const incomingTaskId = location.state?.taskId
        if (incomingTaskId) {
            _flushTime()
            useTimerStore.setState({ taskId: incomingTaskId, sessionSec: 0 })
        }

        // Resume interval if timer was already running (e.g. after page reload)
        const { running: wasRunning, startedAt, seconds: storedSeconds } = useTimerStore.getState()
        if (wasRunning && !_intervalId) {
            if (startedAt) {
                const elapsed  = Math.floor((Date.now() - startedAt) / 1000)
                const adjusted = Math.max(0, storedSeconds - elapsed)
                useTimerStore.setState({ seconds: adjusted })
            }
            _startInterval()
        }
        // Intentionally no cleanup — the interval must outlive this component
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // ─── Derived ──────────────────────────────────────────────────────────────
    const currentPhase = MODES[modeIdx]
    const total        = currentPhase.minutes * 60
    const progress     = 1 - seconds / total
    const dash         = Circ * progress
    const gap          = Circ - dash
    const selectedTask = taskId ? (tasks.find(t => t.id === taskId) ?? null) : null

    // ─── Actions ──────────────────────────────────────────────────────────────
    function handleStartPause() {
        if (running) {
            _stopInterval()
            _flushTime()
            useTimerStore.setState({ running: false, startedAt: null })
        } else {
            useTimerStore.setState({ running: true, startedAt: Date.now(), waitingForUser: false })
            _startInterval()
        }
    }

    function handleReset() {
        _stopInterval()
        _flushTime()
        useTimerStore.setState({
            running: false, startedAt: null, waitingForUser: false,
            seconds: MODES[modeIdx].minutes * 60,
        })
    }

    function handleSwitchPhase(i) {
        _stopInterval()
        _flushTime()
        useTimerStore.setState({
            running: false, startedAt: null, waitingForUser: false,
            modeIdx: i, seconds: MODES[i].minutes * 60,
        })
    }

    // ─── task switching ───────────────────────────────────────────────────────
    function handleTaskSelect(id) {
        setShowTaskDrop(false)
        if (id === taskId) return
        // If a focus session is actively running, ask what to do
        if (running && MODES[modeIdx].key === 'focus') {
            setPendingTaskId(id || null)
        } else {
            _flushTime()
            useTimerStore.setState({ taskId: id || null, sessionSec: 0 })
        }
    }

    function handleSwitchAndReset(newId) {
        // Log elapsed time to the old task, reset timer, switch task
        _stopInterval()
        _flushTime()
        useTimerStore.setState({
            running: false, startedAt: null, waitingForUser: false,
            seconds: MODES[0].minutes * 60, modeIdx: 0,
            taskId: newId, sessionSec: 0,
        })
        setPendingTaskId(null)
    }

    function handleSwitchAndSplit(newId) {
        // Log elapsed time to old task, continue timer, switch task
        _flushTime()
        useTimerStore.setState({ taskId: newId, sessionSec: 0, startedAt: Date.now() })
        setPendingTaskId(null)
    }

    // ─── render ───────────────────────────────────────────────────────────────
    return (
        <div style={{
            color: 'var(--color-text-main)',
            minHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
            paddingBottom: '96px',
        }}>
            <Header title="Timer" onBack={() => navigate(-1)} />

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
                    {MODES.map((m, i) => (
                        <button
                            key={m.key}
                            onClick={() => handleSwitchPhase(i)}
                            className="label-bold"
                            style={{
                                flex: 1,
                                padding: '8px 4px',
                                borderRadius: '10px',
                                border: 'none',
                                cursor: 'pointer',
                                background: modeIdx === i ? currentPhase.color : 'transparent',
                                color: modeIdx === i ? '#fff' : 'var(--color-text-secondary)',
                                transition: 'all 0.2s',
                                fontSize: '11px',
                            }}
                        >
                            {m.label}
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
                                {formatTime(seconds)}
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
                                background: i < (sessions % 4) ? currentPhase.color : 'var(--color-divider)',
                                transition: 'background 0.3s',
                            }} />
                        ))}
                    </div>
                    <span className="label-caps" style={{
                        color: 'var(--color-text-secondary)',
                        marginTop: '6px',
                    }}>
                        {sessions} session{sessions !== 1 ? 's' : ''} complete
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
                            ? <Pause size={28} strokeWidth={2.5} />
                            : <Play  size={28} strokeWidth={2.5} style={{ marginLeft: '3px' }} />
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
                                    onClick={() => handleTaskSelect('')}
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
                                        onClick={() => handleTaskSelect(t.id)}
                                        style={{
                                            width: '100%', textAlign: 'left',
                                            padding: '12px 16px', background: 'none', border: 'none',
                                            borderBottom: i < tasks.length - 1 ? '1px solid var(--color-divider)' : 'none',
                                            cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '10px',
                                        }}
                                    >
                                        {t.id === taskId && (
                                            <CheckCircle size={14} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                                        )}
                                        <span className="body" style={{
                                            color: t.id === taskId ? 'var(--color-primary)' : 'var(--color-text-main)',
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

            {/* Task-switch confirmation — only shown when timer is running */}
            {pendingTaskId !== null && (
                <>
                    <FadeOverlay visible={true} />
                    <ConfirmDialog
                        icon={<RotateCcw size={24} color="var(--color-accent)" />}
                        title="Switch Task?"
                        message={`Timer is running. Log ${formatTime(useTimerStore.getState().sessionSec)} to the current task, then…`}
                        confirmLabel="Reset Timer"
                        cancelLabel="Keep Going"
                        confirmVariant="primary"
                        onConfirm={() => handleSwitchAndReset(pendingTaskId)}
                        onCancel={() => handleSwitchAndSplit(pendingTaskId)}
                    />
                </>
            )}
        </div>
    )
}
