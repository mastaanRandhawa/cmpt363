import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { Command, X, Pencil, Check, Plus, CheckCircle, MapPin, AlertTriangle, GripVertical, Lock, ChevronRight, Timer as TimerIcon } from 'lucide-react'
import useTaskStore from '../data/useTaskStore'
import useDebugStore from '../data/useDebugStore'
import useNavGuardStore from '../data/useNavGuardStore'
import useRoboStore, { levelFromXp } from '../data/useRoboStore'
import useDragSort from '../hooks/useDragSort'
import { generateSubtasks } from '../data/taskBreakdown'
import useTaskTemplateStore from '../data/useTaskTemplateStore'
import Header from '../components/Header'
import Input from '../components/Input'
import Button from '../components/Button'
import RepeatPicker from '../components/RepeatPicker'
import ConfirmDialog from '../components/ConfirmDialog'
import FadeOverlay from '../components/FadeOverlay'
import { priority as priorityMap } from '../data/priority'

const priorities = ['low', 'med', 'high']

const priorityColors = {
    low:  'var(--color-priority-low)',
    med:  'var(--color-priority-med)',
    high: 'var(--color-priority-high)',
}

const effortColors = {
    1: 'var(--color-success)',
    2: 'var(--color-success)',
    3: 'var(--color-primary)',
    4: 'var(--color-accent)',
    5: 'var(--color-danger)',
}

const labelStyle = {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: 'var(--color-text-muted)',
}

const errorStyle = {
    fontSize: '12px',
    color: 'var(--color-danger)',
    marginLeft: '8px',
    fontWeight: 600,
}

function TaskCreate() {
    const navigate       = useNavigate()
    const routerLocation = useLocation()
    const { id: routeId } = useParams()
    const addTask    = useTaskStore(s => s.addTask)
    const updateTask = useTaskStore(s => s.updateTask)
    const tasks      = useTaskStore(s => s.tasks)
    const setDebug   = useDebugStore(s => s.set)
    const xp         = useRoboStore(s => s.xp)
    const level      = levelFromXp(xp)

    // edit mode
    const editId   = routeId || routerLocation.state?.editId || null
    const editTask = editId ? tasks.find(t => t.id === editId) ?? null : null
    const isEdit   = !!editTask

    // ─── form state ───────────────────────────────────────────────────────────
    const [name, setName]           = useState(editTask?.name        ?? '')
    const [date, setDate]           = useState(editTask?.due         ?? '')
    const [addTime, setAddTime]     = useState(!!(editTask?.time))
    const [time, setTime]           = useState(typeof editTask?.time === 'string' ? editTask.time : '')
    const [priority, setPriority]   = useState(typeof editTask?.priority === 'string' ? editTask.priority : null)
    const [effort, setEffort]       = useState(typeof editTask?.effort === 'number' ? editTask.effort : null)
    const [notes, setNotes]         = useState(typeof editTask?.description === 'string' ? editTask.description : '')
    const [notesPrivate, setNotesPrivate] = useState(false)
    const [repeat, setRepeat]       = useState(editTask?.repeat      ?? null)
    const [location, setLocation]   = useState(
        typeof editTask?.location === 'string' ? editTask.location :
            editTask?.location?.label ? editTask.location.label : ''
    )
    const [locQuery, setLocQuery]     = useState('')
    const [locResults, setLocResults] = useState([])
    const [locLoading, setLocLoading] = useState(false)
    const [showLocDrop, setShowLocDrop] = useState(false)
    const [timed, setTimed]           = useState(editTask?.timed ?? false)
    const [errors, setErrors]         = useState({})

    // ─── subtasks ─────────────────────────────────────────────────────────────
    const [subtasks, setSubtasks]     = useState([])
    const [editingId, setEditingId]   = useState(null)
    const [editLabel, setEditLabel]   = useState('')
    const [newSubtask, setNewSubtask] = useState('')
    const [addingNew, setAddingNew]   = useState(false)

    // ─── AI state ─────────────────────────────────────────────────────────────
    const [aiSuggest, setAiSuggest]     = useState(false)   // default OFF
    const [aiLoading, setAiLoading]     = useState(false)
    const [aiSubmitted, setAiSubmitted] = useState(false)
    const [aiSnapshot, setAiSnapshot]   = useState(null)    // form values at time of last AI call
    const [aiPending, setAiPending]     = useState([])      // suggestions awaiting user decision
    const [aiOriginal, setAiOriginal]   = useState([])      // raw AI output for template saving
    const [aiInstructions, setAiInstructions] = useState('')      // user directions to the AI

    // ─── confirm step ─────────────────────────────────────────────────────────
    const [step, setStep]           = useState('form')
    const [createdId, setCreatedId] = useState(null)

    // ─── formStale: form changed after last AI submission ─────────────────────
    const formStale = aiSubmitted && aiSnapshot !== null && (
        name      !== aiSnapshot.name     ||
        date      !== aiSnapshot.date     ||
        priority  !== aiSnapshot.priority ||
        effort    !== aiSnapshot.effort   ||
        (!notesPrivate && notes !== aiSnapshot.notes) ||
        aiInstructions !== aiSnapshot.aiInstructions
    )

    // ─── unsaved changes guard ────────────────────────────────────────────────
    const isDirty = step === 'form' && (() => {
        if (isEdit && editTask) {
            return (
                name.trim()    !== (editTask.name        ?? '') ||
                date           !== (editTask.due         ?? '') ||
                time           !== (editTask.time        ?? '') ||
                addTime        !== !!(editTask.time)            ||
                priority       !== (editTask.priority    ?? null) ||
                effort         !== (editTask.effort      ?? null) ||
                notes.trim()   !== (editTask.description ?? '') ||
                (location||'') !== (typeof editTask.location === 'string' ? editTask.location : editTask.location?.label ?? '') ||
                JSON.stringify(repeat) !== JSON.stringify(editTask.repeat ?? null) ||
                timed          !== (editTask.timed       ?? false)
            )
        }
        return (
            name.trim() !== '' || date !== '' || priority !== null ||
            effort !== null || notes.trim() !== '' || location !== '' ||
            addTime || repeat !== null || subtasks.length > 0
        )
    })()

    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
    const [pendingNav, setPendingNav]             = useState(null)
    const [pendingProceed, setPendingProceed]     = useState(null)

    const setGuard   = useNavGuardStore(s => s.setGuard)
    const clearGuard = useNavGuardStore(s => s.clearGuard)

    useEffect(() => {
        if (isDirty) {
            setGuard((to, proceed) => {
                setPendingNav(to)
                setShowLeaveConfirm(true)
                setPendingProceed(() => proceed)
            })
        } else {
            clearGuard()
        }
        return () => clearGuard()
    }, [isDirty, setGuard, clearGuard])

    useEffect(() => {
        const handler = e => { if (isDirty) { e.preventDefault(); e.returnValue = '' } }
        window.addEventListener('beforeunload', handler)
        return () => window.removeEventListener('beforeunload', handler)
    }, [isDirty])

    const guardedNavigate = useCallback((to) => {
        if (isDirty) { setPendingNav(to); setShowLeaveConfirm(true) }
        else navigate(to, { replace: isEdit })
    }, [isDirty, navigate, isEdit])

    // ─── location autocomplete ────────────────────────────────────────────────
    useEffect(() => {
        if (!locQuery.trim() || locQuery.length < 2) { setLocResults([]); return }
        const timer = setTimeout(async () => {
            setLocLoading(true)
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locQuery)}&limit=5&addressdetails=1`,
                    { headers: { 'Accept-Language': 'en' } }
                )
                const data = await res.json()
                setLocResults(data)
                setShowLocDrop(true)
            } catch { setLocResults([]) }
            finally { setLocLoading(false) }
        }, 350)
        return () => clearTimeout(timer)
    }, [locQuery])

    // ─── debug ────────────────────────────────────────────────────────────────
    useEffect(() => {
        setDebug('TaskCreate', {
            step,
            name:      name || '—',
            date:      date || '—',
            time:      addTime ? (time || '—') : 'off',
            priority:  priority ?? '—',
            effort:    effort ?? '—',
            notes:     notesPrivate ? '[private]' : (notes ? `${notes.slice(0, 20)}${notes.length > 20 ? '…' : ''}` : '—'),
            aiSuggest,
            aiLoading,
            formStale,
            subtasks:  subtasks.length > 0 ? `${subtasks.length} confirmed` : '—',
            aiPending: aiPending.length > 0 ? `${aiPending.length} pending` : '—',
        })
    }, [step, name, date, time, addTime, priority, effort, notes, notesPrivate, aiSuggest, aiLoading, formStale, subtasks, aiPending])

    useEffect(() => () => setDebug('TaskCreate', null), [])

    // ─── AI suggestions ───────────────────────────────────────────────────────
    async function runAISuggestions() {
        setAiLoading(true)
        setAiPending([])
        const snap = { name, date, priority, effort, notes: notesPrivate ? null : notes, aiInstructions }
        setAiSnapshot(snap)
        setAiSubmitted(true)
        try {
            const task = {
                name,
                due:         date,
                time:        addTime ? time : null,
                priority,
                effort,
                description: notesPrivate ? null : notes,
                location,
            }
            const result = await generateSubtasks(task, aiInstructions || null)
            setAiOriginal(result)
            setAiPending(result.map(s => ({ ...s, id: s.id || crypto.randomUUID() })))
        } catch {
            // silently fail — user still has their manual subtasks
        } finally {
            setAiLoading(false)
        }
    }

    function handleAiToggle() {
        const next = !aiSuggest
        setAiSuggest(next)
        if (next && level >= 3) {
            runAISuggestions()
        } else if (!next) {
            setAiPending([])
            setAiSubmitted(false)
            setAiSnapshot(null)
        }
    }

    function acceptPending(id) {
        const s = aiPending.find(p => p.id === id)
        if (!s) return
        setSubtasks(prev => [...prev, s])
        setAiPending(prev => prev.filter(p => p.id !== id))
    }

    function acceptAllPending() {
        setSubtasks(prev => [...prev, ...aiPending])
        setAiPending([])
    }

    function dismissPending(id) {
        setAiPending(prev => prev.filter(p => p.id !== id))
    }

    // ─── validation ───────────────────────────────────────────────────────────
    function validate() {
        const e = {}
        if (!name.trim()) e.name     = 'Required'
        if (!date)        e.date     = 'Required'
        if (!priority)    e.priority = 'Required'
        if (!effort)      e.effort   = 'Required'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    // ─── create / save ────────────────────────────────────────────────────────
    function handleCreate() {
        if (!validate()) return
        if (isEdit) { handleSaveEdit(); return }

        if (aiSuggest && aiOriginal.length > 0) {
            useTaskTemplateStore.getState().saveTemplate({
                taskName:      name.trim(),
                aiSuggested:   aiOriginal,
                finalSubtasks: subtasks,
            })
        }

        const id = crypto.randomUUID()
        addTask({
            id,
            name:        name.trim(),
            due:         date,
            time:        addTime ? time : null,
            priority,
            effort,
            description: notes.trim(),
            status:      'todo',
            location:    location || null,
            repeat,
            timed,
            subtasks,
        })
        setCreatedId(id)
        setStep('confirm')
    }

    function handleSaveEdit() {
        if (!validate()) return
        updateTask(editId, {
            name:        name.trim(),
            due:         date,
            time:        addTime ? time : null,
            priority,
            effort,
            description: notes.trim(),
            location:    location || null,
            repeat,
            timed,
        })
        navigate(`/tasks/${editId}`, { replace: true })
    }

    // ─── subtask actions ──────────────────────────────────────────────────────
    function startEdit(subtask) { setEditingId(subtask.id); setEditLabel(subtask.label) }
    function commitEdit(id) {
        if (!editLabel.trim()) { cancelEdit(); return }
        setSubtasks(prev => prev.map(s =>
            s.id === id ? { ...s, label: editLabel.trim(), ai: false } : s
        ))
        cancelEdit()
    }
    function cancelEdit() { setEditingId(null); setEditLabel('') }
    function removeSubtask(id) { setSubtasks(prev => prev.filter(s => s.id !== id)) }
    function addNewSubtask() {
        if (!newSubtask.trim()) return
        setSubtasks(prev => [...prev, { id: crypto.randomUUID(), label: newSubtask.trim(), done: false, ai: false }])
        setNewSubtask('')
        setAddingNew(false)
    }

    function formatDate(dateStr) {
        if (!dateStr) return ''
        return new Date(dateStr + 'T00:00:00')
            .toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }

    // ─── confirm screen ───────────────────────────────────────────────────────
    if (step === 'confirm') {
        const p     = priorityMap[priority] ?? { label: priority?.toUpperCase(), color: 'var(--color-text-muted)' }
        const curXp = useRoboStore.getState().xp
        const lvl   = levelFromXp(curXp)
        return (
            <div style={{ color: 'var(--color-text)', minHeight: '100%', display: 'flex', flexDirection: 'column', paddingBottom: '96px' }}>
                <Header title="Add A New Task" />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '24px', padding: '32px 20px 20px' }}>

                    <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'color-mix(in srgb, var(--color-success) 20%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={36} color="var(--color-success)" />
                    </div>

                    <p style={{ margin: 0, fontSize: '26px', fontWeight: 800 }}>Task Created!</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                        <p style={{ margin: 0, fontSize: '16px', fontWeight: 800, letterSpacing: '0.06em' }}>{name.toUpperCase()}</p>
                        {date && <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)' }}>Due: {formatDate(date)}</p>}
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <span style={{ background: `color-mix(in srgb, ${p.color} 15%, transparent)`, color: p.color, fontSize: '11px', fontWeight: 700, padding: '4px 14px', borderRadius: '20px' }}>{p.label}</span>
                            {effort && <span style={{ background: 'var(--color-surface)', color: 'var(--color-primary)', fontSize: '11px', fontWeight: 700, padding: '4px 14px', borderRadius: '20px' }}>EFFORT: {effort}</span>}
                        </div>
                    </div>

                    <div style={{ background: 'var(--color-surface)', borderRadius: '16px', padding: '16px', width: '100%', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <Command size={18} color="var(--color-primary)" />
                            <p style={{ margin: 0, fontWeight: 700, fontSize: '14px' }}>Robo says:</p>
                        </div>
                        <p style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                            Great! I've added this to your plan. Let's tackle it together!
                        </p>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-accent)' }}>🔥 Streak kept</span>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-success)' }}>✦ Level {lvl}</span>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)' }}>{curXp} XP</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                        <button onClick={() => navigate(`/tasks/${createdId}`)} style={{ flex: 1, padding: '14px', background: 'none', border: '1.5px solid var(--color-surface-alt)', borderRadius: '14px', color: 'var(--color-text)', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                            View Task
                        </button>
                        <button onClick={() => navigate('/timer', { state: { taskId: createdId } })} style={{ flex: 1, padding: '14px', background: 'var(--color-primary)', border: 'none', borderRadius: '14px', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                            Start Task
                        </button>
                    </div>

                </div>
            </div>
        )
    }

    // ─── form ─────────────────────────────────────────────────────────────────
    return (
        <div style={{ color: 'var(--color-text)', position: 'relative', display: 'flex', flexDirection: 'column', paddingBottom: '96px' }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

            <Header
                title={isEdit ? 'Edit Task' : 'Add A New Task'}
                onBack={() => guardedNavigate(isEdit ? `/tasks/${editId}` : '/tasks')}
            />

            <FadeOverlay visible={showLeaveConfirm} />

            {showLeaveConfirm && (
                <ConfirmDialog
                    icon={<AlertTriangle size={24} color="var(--color-accent)" />}
                    title="DISCARD CHANGES?"
                    message="You have unsaved changes. If you leave now, all entered data will be lost."
                    confirmLabel="Discard"
                    confirmVariant="danger"
                    cancelLabel="Keep Editing"
                    onConfirm={() => {
                        setShowLeaveConfirm(false)
                        clearGuard()
                        if (pendingProceed) { pendingProceed(); setPendingProceed(null) }
                        else navigate(pendingNav ?? (isEdit ? `/tasks/${editId}` : '/tasks'), { replace: isEdit })
                    }}
                    onCancel={() => {
                        setShowLeaveConfirm(false)
                        setPendingNav(null)
                        setPendingProceed(null)
                    }}
                />
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', padding: '20px' }}>

                {/* task name */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={labelStyle}>TASK NAME <span style={{ color: 'var(--color-danger)' }}>*</span></span>
                        {errors.name && <span style={errorStyle}>{errors.name}</span>}
                    </div>
                    <Input value={name} onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: null })) }} placeholder="Task Name" />
                </div>

                {/* date + time + repeat */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={labelStyle}>DATE <span style={{ color: 'var(--color-danger)' }}>*</span></span>
                            {errors.date && <span style={errorStyle}>{errors.date}</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setAddTime(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: `2px solid ${addTime ? 'var(--color-primary)' : 'var(--color-surface-alt)'}`, background: addTime ? 'var(--color-primary)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                                    {addTime && <svg width="9" height="7" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                </div>
                                <span style={{ ...labelStyle, letterSpacing: '0.06em' }}>ADD TIME</span>
                            </button>
                            <button onClick={() => setRepeat(v => v ? null : { frequency: 'daily' })} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: `2px solid ${repeat ? 'var(--color-primary)' : 'var(--color-surface-alt)'}`, background: repeat ? 'var(--color-primary)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                                    {repeat && <svg width="9" height="7" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                </div>
                                <span style={{ ...labelStyle, letterSpacing: '0.06em' }}>REPEAT</span>
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="date" value={date} max="9999-12-31"
                            onChange={e => { setDate(e.target.value); setErrors(p => ({ ...p, date: null })) }}
                            style={{ flex: addTime ? '1.6' : '1', background: 'var(--color-surface)', border: '1.5px solid var(--color-surface-alt)', borderRadius: '12px', padding: '12px 14px', color: 'var(--color-text)', fontSize: '14px', outline: 'none', boxSizing: 'border-box', colorScheme: 'dark', minWidth: 0 }}
                        />
                        {addTime && (
                            <input
                                type="time" value={time}
                                onChange={e => setTime(e.target.value)}
                                style={{ flex: '1', background: 'var(--color-surface)', border: '1.5px solid var(--color-surface-alt)', borderRadius: '12px', padding: '12px 14px', color: 'var(--color-text)', fontSize: '14px', outline: 'none', boxSizing: 'border-box', colorScheme: 'dark', minWidth: 0 }}
                            />
                        )}
                    </div>

                    {repeat && <RepeatPicker value={repeat} onChange={setRepeat} />}
                </div>

                {/* priority */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={labelStyle}>PRIORITY <span style={{ color: 'var(--color-danger)' }}>*</span></span>
                        {errors.priority && <span style={errorStyle}>{errors.priority}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {priorities.map(p => {
                            const selected = priority === p
                            const color    = priorityColors[p]
                            return (
                                <button key={p} onClick={() => { setPriority(p); setErrors(prev => ({ ...prev, priority: null })) }}
                                        style={{ flex: 1, padding: '8px 0', borderRadius: '20px', border: `2px solid ${color}`, background: selected ? `color-mix(in srgb, ${color} 20%, transparent)` : 'none', color, fontWeight: 700, fontSize: '13px', cursor: 'pointer', letterSpacing: '0.04em' }}>
                                    {p.toUpperCase()}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* effort */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={labelStyle}>EFFORT <span style={{ color: 'var(--color-danger)' }}>*</span></span>
                        {errors.effort && <span style={errorStyle}>{errors.effort}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        {[1, 2, 3, 4, 5].map(n => {
                            const selected = effort === n
                            const color    = effortColors[n]
                            return (
                                <button key={n} onClick={() => { setEffort(n); setErrors(prev => ({ ...prev, effort: null })) }}
                                        style={{ width: '44px', height: '44px', borderRadius: '50%', border: `2px solid ${color}`, background: selected ? `color-mix(in srgb, ${color} 20%, transparent)` : 'none', color, fontWeight: 700, fontSize: '15px', cursor: 'pointer', flexShrink: 0 }}>
                                    {n}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* notes + private checkbox */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={labelStyle}>NOTES OR CONTEXT</span>
                        <button
                            onClick={() => setNotesPrivate(v => !v)}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                            <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: `2px solid ${notesPrivate ? 'var(--color-primary)' : 'var(--color-surface-alt)'}`, background: notesPrivate ? 'var(--color-primary)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                                {notesPrivate && <svg width="9" height="7" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            </div>
                            <Lock size={11} color={notesPrivate ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
                            <span style={{ ...labelStyle, letterSpacing: '0.06em', color: notesPrivate ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>PRIVATE</span>
                        </button>
                    </div>
                    <Input
                        multiline rows={4}
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder={notesPrivate ? 'Notes Hidden' : "Enter any information you'd like handy while viewing this task"}
                    />
                    {notesPrivate && (
                        <p style={{ margin: '6px 0 0', fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Lock size={10} /> These notes won't be shared with AI
                        </p>
                    )}
                </div>

                {/* location */}
                <div style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={labelStyle}>LOCATION</span>
                        {location && (
                            <button onClick={() => { setLocation(''); setLocQuery(''); setLocResults([]) }} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '8px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', padding: 0 }}>
                                <X size={13} />
                            </button>
                        )}
                    </div>
                    {location ? (
                        <div style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-primary)', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <MapPin size={16} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                            <span style={{ fontSize: '14px', color: 'var(--color-text)', flex: 1 }}>{location}</span>
                        </div>
                    ) : (
                        <>
                            <div style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-surface-alt)', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <MapPin size={16} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
                                <input
                                    value={locQuery}
                                    onChange={e => { setLocQuery(e.target.value); setShowLocDrop(true) }}
                                    onFocus={() => locResults.length > 0 && setShowLocDrop(true)}
                                    placeholder="Search for a location..."
                                    style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--color-text)', fontSize: '14px' }}
                                />
                                {locLoading && <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid var(--color-primary)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />}
                            </div>
                            {showLocDrop && locResults.length > 0 && (
                                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'var(--color-surface)', border: '1.5px solid var(--color-surface-alt)', borderRadius: '12px', overflow: 'hidden', zIndex: 50, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                                    {locResults.map((r, i) => {
                                        const locName = r.name || r.display_name.split(',')[0]
                                        const address = r.display_name.replace(locName + ', ', '')
                                        return (
                                            <button key={r.place_id} onClick={() => { setLocation(r.display_name); setLocQuery(''); setShowLocDrop(false); setLocResults([]) }}
                                                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: 'none', border: 'none', borderTop: i > 0 ? '1px solid var(--color-surface-alt)' : 'none', cursor: 'pointer', textAlign: 'left' }}>
                                                <MapPin size={15} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{locName}</p>
                                                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{address}</p>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* subtasks */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={labelStyle}>SUBTASKS</span>
                    </div>

                    {/* user's subtasks + spinner overlay */}
                    <div style={{ position: 'relative' }}>
                        <SubtaskDragList
                            subtasks={subtasks}
                            setSubtasks={setSubtasks}
                            editingId={editingId}
                            editLabel={editLabel}
                            setEditLabel={setEditLabel}
                            commitEdit={commitEdit}
                            cancelEdit={cancelEdit}
                            startEdit={startEdit}
                            removeSubtask={removeSubtask}
                            addingNew={addingNew}
                            setAddingNew={setAddingNew}
                            newSubtask={newSubtask}
                            setNewSubtask={setNewSubtask}
                            addNewSubtask={addNewSubtask}
                        />

                        {/* loading overlay */}
                        {aiLoading && (
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: 'color-mix(in srgb, var(--color-bg) 75%, transparent)',
                                borderRadius: '14px',
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center', gap: '10px',
                                backdropFilter: 'blur(2px)',
                            }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '3px solid var(--color-primary)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
                                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>Getting AI suggestions...</span>
                            </div>
                        )}
                    </div>

                    {/* AI pending suggestions */}
                    {aiPending.length > 0 && (
                        <div style={{ marginTop: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Command size={12} color="var(--color-primary)" />
                                    <span style={{ ...labelStyle, color: 'var(--color-primary)' }}>AI SUGGESTIONS</span>
                                </div>
                                <button onClick={acceptAllPending} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: '12px', fontWeight: 700, padding: 0 }}>
                                    Accept All
                                </button>
                            </div>
                            <div style={{ background: 'var(--color-surface)', borderRadius: '14px', overflow: 'hidden', border: '1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)' }}>
                                {aiPending.map((s, i) => (
                                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderBottom: i < aiPending.length - 1 ? '1px solid var(--color-surface-alt)' : 'none' }}>
                                        <Command size={11} color="var(--color-primary)" style={{ flexShrink: 0, opacity: 0.5 }} />
                                        <span style={{ flex: 1, fontSize: '14px', color: 'var(--color-text)' }}>{s.label}</span>
                                        <button onClick={() => acceptPending(s.id)} style={{ background: 'color-mix(in srgb, var(--color-success) 15%, transparent)', border: 'none', borderRadius: '8px', padding: '4px 10px', color: 'var(--color-success)', fontWeight: 700, fontSize: '12px', cursor: 'pointer', flexShrink: 0 }}>
                                            + Add
                                        </button>
                                        <button onClick={() => dismissPending(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '2px', flexShrink: 0 }}>
                                            <X size={13} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* use timer */}
                <div style={{ background: 'var(--color-surface)', borderRadius: '16px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ background: 'var(--color-surface-alt)', borderRadius: '12px', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <TimerIcon size={20} color="var(--color-primary)" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '13px', letterSpacing: '0.04em' }}>USE TIMER</p>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)' }}>Track time spent with Pomodoro</p>
                    </div>
                    <button onClick={() => setTimed(v => !v)} style={{ width: '48px', height: '28px', borderRadius: '999px', border: 'none', flexShrink: 0, cursor: 'pointer', background: timed ? 'var(--color-primary)' : 'var(--color-surface-alt)', position: 'relative', transition: 'background 0.2s' }}>
                        <span style={{ position: 'absolute', top: '4px', left: timed ? '24px' : '4px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                    </button>
                </div>

                {/* AI suggestions toggle — create mode only, Level 3+ */}
                {!isEdit && (
                    level >= 3 ? (
                        <div style={{ background: 'var(--color-surface)', borderRadius: '16px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ background: 'var(--color-surface-alt)', borderRadius: '12px', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Command size={20} color="var(--color-primary)" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: '13px', letterSpacing: '0.04em' }}>AI SUGGESTIONS</p>
                                <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)' }}>Breakdown and Time Estimate</p>
                            </div>
                            <button onClick={handleAiToggle} style={{ width: '48px', height: '28px', borderRadius: '999px', border: 'none', flexShrink: 0, cursor: 'pointer', background: aiSuggest ? 'var(--color-primary)' : 'var(--color-surface-alt)', position: 'relative', transition: 'background 0.2s' }}>
                                <span style={{ position: 'absolute', top: '4px', left: aiSuggest ? '24px' : '4px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                            </button>
                        </div>
                    ) : (
                        <div style={{ background: 'var(--color-surface)', borderRadius: '16px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px', border: '1px dashed color-mix(in srgb, var(--color-text-muted) 25%, transparent)', opacity: 0.75 }}>
                            <div style={{ background: 'var(--color-surface-alt)', borderRadius: '12px', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Lock size={20} color="var(--color-text-muted)" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: '13px', letterSpacing: '0.04em', color: 'var(--color-text-muted)' }}>AI SUGGESTIONS</p>
                                <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)' }}>Big Task Destroyer — unlock at Level 3</p>
                            </div>
                            <ChevronRight size={16} color="var(--color-text-muted)" />
                        </div>
                    )
                )}

                {/* Instructions for AI — only visible when AI Suggestions is on */}
                {!isEdit && aiSuggest && level >= 3 && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                            <Command size={11} color="var(--color-primary)" />
                            <span style={labelStyle}>INSTRUCTIONS FOR AI</span>
                        </div>
                        <Input
                            multiline rows={3}
                            value={aiInstructions}
                            onChange={e => setAiInstructions(e.target.value)}
                            placeholder="Optional: guide the AI — e.g. 'Focus on research steps only' or 'Keep it under 3 subtasks'. Your notes above won't be shared if marked private."
                        />

                    </div>
                )}

                {/* submit buttons */}
                {isEdit ? (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => setShowLeaveConfirm(true)} style={{ flex: 1, padding: '15px', background: 'none', border: '1.5px solid var(--color-surface-alt)', borderRadius: '14px', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                            Discard
                        </button>
                        <button onClick={handleCreate} style={{ flex: 2, padding: '15px', background: 'var(--color-primary)', border: 'none', borderRadius: '14px', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                            Save Changes
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {/* resubmit — only visible when form changed after an AI call */}
                        {formStale && (
                            <button
                                onClick={runAISuggestions}
                                style={{ width: '100%', padding: '14px', background: 'none', border: '1.5px solid var(--color-primary)', borderRadius: '14px', color: 'var(--color-primary)', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxSizing: 'border-box' }}
                            >
                                <Command size={15} /> Update AI Suggestions
                            </button>
                        )}
                        <button
                            onClick={handleCreate}
                            disabled={formStale}
                            style={{ width: '100%', padding: '15px', background: formStale ? 'var(--color-surface)' : 'var(--color-primary)', border: 'none', borderRadius: '14px', color: formStale ? 'var(--color-text-muted)' : 'white', fontWeight: 700, fontSize: '14px', cursor: formStale ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxSizing: 'border-box' }}
                        >
                            Create Task
                        </button>
                    </div>
                )}

            </div>
        </div>
    )
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function ActionBtn({ onClick, color, children }) {
    return (
        <button onClick={onClick} style={{ width: '26px', height: '26px', borderRadius: '8px', background: `color-mix(in srgb, ${color} 15%, transparent)`, border: 'none', cursor: 'pointer', color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {children}
        </button>
    )
}

function SubtaskDragList({
                             subtasks, setSubtasks,
                             editingId, editLabel, setEditLabel,
                             commitEdit, cancelEdit, startEdit, removeSubtask,
                             addingNew, setAddingNew, newSubtask, setNewSubtask, addNewSubtask,
                         }) {
    const { items, getDragProps, dragOverIndex } = useDragSort(subtasks, setSubtasks)

    return (
        <div style={{ background: 'var(--color-surface)', borderRadius: '14px', overflow: 'hidden' }}>
            {items.map((subtask, i) => (
                <div
                    key={subtask.id}
                    {...getDragProps(i)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderBottom: i < items.length - 1 ? '1px solid var(--color-surface-alt)' : 'none', opacity: dragOverIndex === i ? 0.4 : 1, transition: 'opacity 0.15s', cursor: 'grab' }}
                >
                    <GripVertical size={13} color="var(--color-text-muted)" style={{ flexShrink: 0, opacity: 0.5 }} />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', width: '14px', flexShrink: 0, textAlign: 'right' }}>{i + 1}</span>

                    {editingId === subtask.id ? (
                        <input autoFocus value={editLabel} onChange={e => setEditLabel(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') commitEdit(subtask.id); if (e.key === 'Escape') cancelEdit() }} style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--color-text)', fontSize: '14px' }} />
                    ) : (
                        <span style={{ flex: 1, fontSize: '14px', color: 'var(--color-text)' }}>{subtask.label}</span>
                    )}

                    {subtask.ai && editingId !== subtask.id && (
                        <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--color-primary-soft)', background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', padding: '2px 6px', borderRadius: '999px', flexShrink: 0 }}>AI</span>
                    )}

                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                        {editingId === subtask.id ? (
                            <>
                                <ActionBtn onClick={() => commitEdit(subtask.id)} color="var(--color-success)"><Check size={13} /></ActionBtn>
                                <ActionBtn onClick={cancelEdit} color="var(--color-text-muted)"><X size={13} /></ActionBtn>
                            </>
                        ) : (
                            <>
                                <ActionBtn onClick={() => startEdit(subtask)} color="var(--color-primary)"><Pencil size={13} /></ActionBtn>
                                <ActionBtn onClick={() => removeSubtask(subtask.id)} color="var(--color-danger)"><X size={13} /></ActionBtn>
                            </>
                        )}
                    </div>
                </div>
            ))}

            {addingNew ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderTop: items.length > 0 ? '1px solid var(--color-surface-alt)' : 'none' }}>
                    <input autoFocus value={newSubtask} onChange={e => setNewSubtask(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addNewSubtask(); if (e.key === 'Escape') setAddingNew(false) }} placeholder="New subtask..." style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--color-text)', fontSize: '14px' }} />
                    <button onClick={addNewSubtask} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 700, fontSize: '13px' }}>Add</button>
                    <button onClick={() => setAddingNew(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={14} /></button>
                </div>
            ) : (
                <button onClick={() => setAddingNew(true)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px', background: 'none', border: 'none', borderTop: items.length > 0 ? '1px solid var(--color-surface-alt)' : 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '13px', fontWeight: 600 }}>
                    <Plus size={14} /> ADD SUBTASK
                </button>
            )}
        </div>
    )
}

export default TaskCreate