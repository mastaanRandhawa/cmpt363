import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import {
    Command,
    X,
    Pencil,
    Check,
    Plus,
    CheckCircle,
    MapPin,
    AlertTriangle,
    GripVertical,
    Lock,
    ChevronRight,
    Gauge,
    Timer as TimerIcon,
    Trash2
} from 'lucide-react'
import useTaskStore from '../data/useTaskStore'
import useDebugStore from '../data/useDebugStore'
import useNavGuardStore from '../data/useNavGuardStore'
import useRoboStore, { levelFromXp } from '../data/useRoboStore'
import useSettingsStore from '../data/useSettingsStore'
import useDragSort from '../hooks/useDragSort'
import { generateSubtasks } from '../data/taskBreakdown'
import useTaskTemplateStore from '../data/useTaskTemplateStore'
import Header from '../components/Header'
import Input from '../components/Input'
import Button from '../components/Button'
import RepeatPicker from '../components/RepeatPicker'
import ConfirmDialog from '../components/ConfirmDialog'
import FadeOverlay from '../components/FadeOverlay'
import { priority as priorityMap, effort as effortMap } from '../data/chipColors.js'

const priorities = ['low', 'med', 'high']

const effortLevels = [1, 2, 3, 4, 5]

const labelStyle = {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: 'var(--color-text-muted)',
}

const errorStyle = {
    fontSize: '12px',
    color: 'var(--color-important)',
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
    const xp               = useRoboStore(s => s.xp)
    const level            = levelFromXp(xp)
    const aiPersonalities  = useSettingsStore(s => s.aiPersonalities)

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
    const [notes, setNotes]         = useState(typeof editTask?.notes === 'string' ? editTask.notes : '')
    const [privateNotes, setNotesPrivate] = useState(editTask?.privateNotes ?? false)
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
    const [subtasks, setSubtasks]     = useState(editTask?.subtasks ?? [])
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
    const [aiInstructions, setAiInstructions] = useState(editTask?.aiInstructions ?? '')      // user directions to the AI
    const [useAI, setUseAI]               = useState(editTask?.useAI ?? false)              // edit mode: AI on/off for this task

    // ─── confirm step ─────────────────────────────────────────────────────────
    const [step, setStep]           = useState('form')
    const [createdId, setCreatedId] = useState(null)

    // ─── formStale: form changed after last AI submission ─────────────────────
    const formStale = aiSubmitted && aiSnapshot !== null && (
        name         !== aiSnapshot.name         ||
        date         !== aiSnapshot.date         ||
        priority     !== aiSnapshot.priority     ||
        effort       !== aiSnapshot.effort       ||
        privateNotes !== aiSnapshot.privateNotes ||
        (!privateNotes && notes !== aiSnapshot.notes) ||
        aiInstructions !== aiSnapshot.aiInstructions
    )

    // ─── unsaved changes guard ────────────────────────────────────────────────
    const isDirty = step === 'form' && (() => {
        if (isEdit && editTask) {
            return (
                name.trim()       !== (editTask.name           ?? '') ||
                date              !== (editTask.due            ?? '') ||
                time              !== (editTask.time           ?? '') ||
                addTime           !== !!(editTask.time)               ||
                priority          !== (editTask.priority       ?? null) ||
                effort            !== (editTask.effort         ?? null) ||
                notes.trim()      !== (editTask.notes    ?? '') ||
                privateNotes      !== (editTask.privateNotes   ?? false) ||
                aiInstructions.trim() !== (editTask.aiInstructions ?? '') ||
                (location||'')    !== (typeof editTask.location === 'string' ? editTask.location : editTask.location?.label ?? '') ||
                JSON.stringify(repeat) !== JSON.stringify(editTask.repeat ?? null) ||
                timed             !== (editTask.timed          ?? false)
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
            notes:     privateNotes ? '[private]' : (notes ? `${notes.slice(0, 20)}${notes.length > 20 ? '…' : ''}` : '—'),
            aiSuggest,
            aiLoading,
            formStale,
            subtasks:  subtasks.length > 0 ? `${subtasks.length} confirmed` : '—',
            aiPending: aiPending.length > 0 ? `${aiPending.length} pending` : '—',
        })
    }, [step, name, date, time, addTime, priority, effort, notes, privateNotes, aiSuggest, aiLoading, formStale, subtasks, aiPending])

    useEffect(() => () => setDebug('TaskCreate', null), [])

    // ─── AI suggestions ───────────────────────────────────────────────────────
    async function runAISuggestions() {
        setAiLoading(true)
        setAiPending([])
        const snap = { name, date, priority, effort, privateNotes, notes: privateNotes ? null : notes, aiInstructions }
        setAiSnapshot(snap)
        setAiSubmitted(true)
        try {
            const task = {
                name,
                due:             date,
                time:            addTime ? time : null,
                priority,
                effort,
                notes:     privateNotes ? null : notes,
                notesArePrivate: privateNotes || undefined,
                location,
            }
            const result = await generateSubtasks(task, aiInstructions || null, aiPersonalities)
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
            name:           name.trim(),
            due:            date,
            time:           addTime ? time : null,
            priority,
            effort,
            notes:    notes.trim(),
            privateNotes,
            aiInstructions: aiInstructions.trim() ||'',
            status:         'todo',
            location:       location || null,
            repeat,
            timed,
            subtasks,
        })
        setCreatedId(id)
        setStep('confirm')
    }

    async function handleSaveEdit() {
        if (!validate()) return
        // When AI is toggled off, strip the AI badge from all existing subtasks
        const subtasksPayload = !useAI
            ? subtasks.map(s => ({ ...s, ai: false }))
            : undefined
        await updateTask(editId, {
            name:           name.trim(),
            due:            date,
            time:           addTime ? time : null,
            priority,
            effort,
            notes:          notes.trim(),
            privateNotes,
            aiInstructions: aiInstructions.trim() || '',
            location:       location || null,
            repeat,
            timed,
            useAI,
            ...(subtasksPayload !== undefined && { subtasks: subtasksPayload }),
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
        const p = priorityMap[priority]
        const e = effortMap[effort]
        const lvl = levelFromXp(xp)
        return (
            <div style={{ color: 'var(--color-text-main)', minHeight: '100dvh', background: 'var(--color-bg)' }}>
                <Header title="Success" />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '24px', padding: '40px 20px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-success-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={40} color="var(--color-success)" />
                    </div>

                    <h1 className="h2" style={{ margin: 0 }}>Task Created!</h1>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                        <p className="body-semibold" style={{ margin: 0, textTransform: 'uppercase' }}>{name}</p>
                        <div className="caption" style={{ color: 'var(--color-text-secondary)' }}>Due: {formatDate(date)}</div>

                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <span className="label-bold" style={{ background: `var(--color-${p.chipColor}-soft)`, color: p.color, padding: '4px 12px', borderRadius: '100px' }}>
                                {p.label}
                            </span>
                            <span className="label-bold" style={{ background: e.soft, color: e.color, padding: '4px 12px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Gauge size={14} /> {e.label}
                            </span>
                        </div>
                    </div>

                    <div style={{ background: 'var(--color-card)', borderRadius: '20px', padding: '20px', width: '100%', textAlign: 'left', border: '1px solid var(--color-divider)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--color-primary)' }}>
                            <Command size={18} />
                            <span className="label-bold">ROBO FEEDBACK</span>
                        </div>
                        <p className="caption" style={{ color: 'var(--color-text-mid)', margin: '0 0 16px', lineHeight: '1.5' }}>
                            I've scheduled this into your plan. Taking small steps is the key to big progress!
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <span className="label-caps" style={{ color: 'var(--color-success)' }}>✦ Level {lvl}</span>
                            <span className="label-caps" style={{ color: 'var(--color-primary)' }}>{xp} XP</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: 'auto' }}>
                        <Button onClick={() => navigate('/tasks')} variant="secondary" style={{ flex: 1 }}>Back to List</Button>
                        <Button onClick={() => navigate(`/tasks/${createdId}`)} variant="primary" style={{ flex: 1 }}>View Task</Button>
                    </div>
                </div>
            </div>
        )
    }

    // ─── form ─────────────────────────────────────────────────────────────────
    return (
        <div style={{ color: 'var(--color-text-main)', position: 'relative', display: 'flex', flexDirection: 'column', paddingBottom: '96px' }}>
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

                {/* Task Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label className="label-bold" style={{ color: 'var(--color-secondary)' }}>
                            TASK NAME <span style={{ color: 'var(--color-important)' }}>*</span>
                        </label>
                        {errors.name && (
                            <span className="label-bold" style={{ color: 'var(--color-important)' }}>
                REQUIRED
            </span>
                        )}
                    </div>
                    <Input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="What needs to be done?"
                        className="body-semibold"
                    />
                </div>

                {/* date + time + repeat */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {/* Header matches the "Notes" style using theme secondary color */}
                            <label className="label-bold" style={{ color: 'var(--color-secondary)' }}>
                                DATE <span style={{ color: 'var(--color-important)' }}>*</span>
                            </label>
                            {errors.date && (
                                <span className="label-bold" style={{ color: 'var(--color-important)', marginLeft: '8px' }}>
                    {errors.date}
                </span>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            {/* Add Time Toggle */}
                            <button onClick={() => setAddTime(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                <div style={{
                                    width: '18px', height: '18px', borderRadius: '6px',
                                    border: `2px solid ${addTime ? 'var(--color-primary)' : 'var(--color-divider)'}`,
                                    background: addTime ? 'var(--color-primary)' : 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s'
                                }}>
                                    {addTime && <Check size={12} color="white" strokeWidth={3} />}
                                </div>
                                <span className="label-bold" style={{ color: addTime ? 'var(--color-primary)' : 'var(--color-text-mid)' }}>ADD TIME</span>
                            </button>

                            {/* Repeat Toggle */}
                            <button onClick={() => setRepeat(v => v ? null : { frequency: 'daily' })} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                <div style={{
                                    width: '18px', height: '18px', borderRadius: '6px',
                                    border: `2px solid ${repeat ? 'var(--color-primary)' : 'var(--color-divider)'}`,
                                    background: repeat ? 'var(--color-primary)' : 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s'
                                }}>
                                    {repeat && <Check size={12} color="white" strokeWidth={3} />}
                                </div>
                                <span className="label-bold" style={{ color: repeat ? 'var(--color-primary)' : 'var(--color-text-mid)' }}>REPEAT</span>
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="date"
                            value={date}
                            max="3000-12-31"
                            onChange={e => { setDate(e.target.value); setErrors(p => ({ ...p, date: null })) }}
                            className="body"
                            style={{
                                flex: addTime ? '1.6' : '1',
                                background: 'var(--color-card)',
                                border: '1px solid var(--color-divider)',
                                borderRadius: '12px',
                                padding: '12px 14px',
                                color: 'var(--color-text-main)',
                                outline: 'none',
                                boxSizing: 'border-box',
                                colorScheme: 'dark',
                                minWidth: 0
                            }}
                        />
                        {addTime && (
                            <input
                                type="time"
                                value={time}
                                onChange={e => setTime(e.target.value)}
                                className="body"
                                style={{
                                    flex: '1',
                                    background: 'var(--color-card)',
                                    border: '1px solid var(--color-divider)',
                                    borderRadius: '12px',
                                    padding: '12px 14px',
                                    color: 'var(--color-text-main)',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    colorScheme: 'dark',
                                    minWidth: 0
                                }}
                            />
                        )}
                    </div>

                    {repeat && <RepeatPicker value={repeat} onChange={setRepeat} />}
                </div>

                {/* Priority Selection */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label className="label-bold" style={{ color: 'var(--color-secondary)' }}>
                            PRIORITY <span style={{ color: 'var(--color-important)' }}>*</span>
                        </label>
                        {errors.priority && (
                            <span className="label-bold" style={{ color: 'var(--color-important)' }}>
                REQUIRED
            </span>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {priorities.map(key => {
                            const selected = priority === key;
                            const cfg = priorityMap[key];
                            return (
                                <button
                                    key={key}
                                    onClick={() => { setPriority(key); setErrors(prev => ({ ...prev, priority: null })); }}
                                    style={{
                                        flex: 1, padding: '8px 0', borderRadius: '20px',
                                        border: `2px solid ${cfg.color}`,
                                        background: selected ? `var(--color-${cfg.chipColor}-soft)` : 'none',
                                        color: cfg.color, fontWeight: 700, fontSize: '13px', cursor: 'pointer'
                                    }}
                                >
                                    {cfg.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Effort Selection */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label className="label-bold" style={{ color: 'var(--color-secondary)' }}>
                            EFFORT <span style={{ color: 'var(--color-important)' }}>*</span>
                        </label>
                        {errors.effort && (
                            <span className="label-bold" style={{ color: 'var(--color-important)' }}>
                REQUIRED
            </span>
                        )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                        {effortLevels.map((num) => {
                            const selected = effort === num;
                            const cfg = effortMap[num];
                            return (
                                <button
                                    key={num}
                                    onClick={() => { setEffort(num); setErrors(prev => ({ ...prev, effort: null })); }}
                                    style={{
                                        flex: 1, padding: '8px 0', borderRadius: '20px',
                                        border: `2px solid ${cfg.color}`,
                                        background: selected ? cfg.soft : 'none',
                                        color: cfg.color, fontWeight: 700, fontSize: '13px', cursor: 'pointer'
                                    }}
                                >
                                    {cfg.label}
                                </button>
                            );
                        })}
                    </div>
                </div>


                {/* Notes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label  className="label-bold" style={{ color: 'var(--color-secondary)' }}>Notes</label>
                        <button
                            type="button"
                            onClick={() => setNotesPrivate(!privateNotes)}
                            className="label-bold"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0', // Critical: removes internal button spacing
                                margin: '0',  // Critical: removes external button spacing
                                color: privateNotes ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                transition: 'color 0.2s ease'
                            }}
                        >
                            {/* Checkbox Square */}
                            <div style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '5px',
                                border: `1.5px solid ${privateNotes ? 'var(--color-primary)' : 'var(--color-divider)'}`,
                                background: privateNotes ? 'var(--color-primary)' : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease'
                            }}>
                                {privateNotes && (
                                    <div style={{
                                        width: '4px',
                                        height: '8px',
                                        border: 'solid white',
                                        borderWidth: '0 2px 2px 0',
                                        transform: 'rotate(45deg)',
                                        marginBottom: '2px'
                                    }} />
                                )}
                            </div>

                            <span style={{ fontSize: '13px', letterSpacing: '0.5px' }}>
            PRIVATE
        </span>
                        </button>
                    </div>
                    <Input
                        multiline
                        rows={3}
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Add details or context..."
                        className="caption"
                    />
                </div>

                {/* location */}
                <div style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <span className="label-bold" style={{ color: 'var(--color-secondary)' }}>LOCATION</span>
                        {location && (
                            <button
                                onClick={() => { setLocation(''); setLocQuery(''); setLocResults([]) }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '8px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', padding: 0 }}
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {location ? (
                        <div style={{
                            background: 'var(--color-card)',
                            border: '1.5px solid var(--color-primary)',
                            borderRadius: '14px',
                            padding: '12px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <MapPin size={18} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                            <span className="body-semibold" style={{ color: 'var(--color-text-main)', flex: 1 }}>{location}</span>
                        </div>
                    ) : (
                        <>
                            <div style={{
                                background: 'var(--color-card)',
                                border: '1px solid var(--color-divider)',
                                borderRadius: '14px',
                                padding: '12px 14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <MapPin size={18} color="var(--color-text-secondary)" style={{ flexShrink: 0 }} />
                                <input
                                    className="body"
                                    value={locQuery}
                                    onChange={e => { setLocQuery(e.target.value); setShowLocDrop(true) }}
                                    onFocus={() => locResults.length > 0 && setShowLocDrop(true)}
                                    placeholder="Search for a location..."
                                    style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--color-text-main)' }}
                                />
                                {locLoading && (
                                    <div style={{
                                        width: '16px', height: '16px', borderRadius: '50%',
                                        border: '2px solid var(--color-primary)',
                                        borderTopColor: 'transparent',
                                        animation: 'spin 0.7s linear infinite',
                                        flexShrink: 0
                                    }} />
                                )}
                            </div>

                            {showLocDrop && locResults.length > 0 && (
                                <div style={{
                                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                                    background: 'var(--color-card)',
                                    border: '1px solid var(--color-divider)',
                                    borderRadius: '14px',
                                    overflow: 'hidden',
                                    zIndex: 50,
                                    boxShadow: '0 12px 30px rgba(0,0,0,0.4)'
                                }}>
                                    {locResults.map((r, i) => {
                                        const locName = r.name || r.display_name.split(',')[0]
                                        const address = r.display_name.replace(locName + ', ', '')
                                        return (
                                            <button
                                                key={r.place_id}
                                                onClick={() => { setLocation(r.display_name); setLocQuery(''); setShowLocDrop(false); setLocResults([]) }}
                                                style={{
                                                    width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                                                    padding: '14px', background: 'none', border: 'none',
                                                    borderTop: i > 0 ? '1px solid var(--color-divider)' : 'none',
                                                    cursor: 'pointer', textAlign: 'left'
                                                }}
                                            >
                                                <MapPin size={16} color="var(--color-text-secondary)" style={{ flexShrink: 0 }} />
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p className="caption-medium" style={{ margin: 0, color: 'var(--color-text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {locName}
                                                    </p>
                                                    <p className="label-caps" style={{ margin: 0, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '11px' }}>
                                                        {address}
                                                    </p>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="label-bold" style={{ color: 'var(--color-secondary)' }}>SUBTASKS</span>
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
                                position: 'absolute',
                                inset: 0,
                                background: 'color-mix(in srgb, var(--color-bg) 80%, transparent)',
                                borderRadius: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                backdropFilter: 'blur(4px)',
                                zIndex: 10,
                                border: '1px solid var(--color-divider)'
                            }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    border: '3px solid var(--color-primary)',
                                    borderTopColor: 'transparent',
                                    animation: 'spin 0.7s linear infinite'
                                }} />
                                <span className="label-bold" style={{ color: 'var(--color-primary)', letterSpacing: '0.05em' }}> Getting AI suggestions...</span>
                            </div>
                        )}
                    </div>

                    {/* AI pending suggestions */}
                    {aiPending.length > 0 && (
                        <div style={{ marginTop: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Command size={14} color="var(--color-primary)" />
                                    <span className="label-bold" style={{ color: 'var(--color-secondary)' }}>AI SUGGESTIONS</span>
                                </div>

                                {/* Accept All Button */}
                                <button
                                    onClick={acceptAllPending}
                                    className="label-bold"
                                    style={{
                                        background: 'var(--color-success-soft)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '6px 12px',
                                        color: 'var(--color-success)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    Accept All
                                </button>
                            </div>

                            <div style={{
                                background: 'var(--color-card)',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                border: '1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)'
                            }}>
                                {aiPending.map((s, i) => (
                                    <div key={s.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '14px 16px',
                                        borderBottom: i < aiPending.length - 1 ? '1px solid var(--color-divider)' : 'none'
                                    }}>
                                        {/* Label (No icon on the left) */}
                                        <span className='body-light`' style={{ flex: 1, color: 'var(--color-text-main)' }}>
                        {s.label}
                    </span>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {/* Individual Add Button */}
                                            <button
                                                onClick={() => acceptPending(s.id)}
                                                className="label-bold"
                                                style={{
                                                    background: 'var(--color-success-soft)',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    padding: '6px 12px',
                                                    color: 'var(--color-success)',
                                                    cursor: 'pointer',
                                                    flexShrink: 0
                                                }}
                                            >
                                                Add
                                            </button>

                                            {/* Dismiss Button */}
                                            <button
                                                onClick={() => dismissPending(s.id)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: '4px', flexShrink: 0 }}
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* use timer */}
                <div style={{
                    background: 'var(--color-card)',
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    border: '1px solid var(--color-divider)'
                }}>
                    <div style={{
                        background: 'var(--color-primary-soft)',
                        borderRadius: '12px',
                        width: '44px',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <TimerIcon size={22} color="var(--color-primary)" />
                    </div>

                    <div style={{ flex: 1 }}>
                        <p className="label-bold" style={{ margin: 0, color: 'var(--color-text-main)' }}>USE TIMER</p>
                        <p className="caption" style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Track time spent with Pomodoro</p>
                    </div>

                    {/* Toggle Switch */}
                    <button
                        onClick={() => setTimed(v => !v)}
                        style={{
                            width: '48px',
                            height: '26px',
                            borderRadius: '999px',
                            border: 'none',
                            flexShrink: 0,
                            cursor: 'pointer',
                            background: timed ? 'var(--color-primary)' : 'var(--color-divider)',
                            position: 'relative',
                            transition: 'background 0.2s'
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: '3px',
                            left: timed ? '25px' : '3px',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: 'white',
                            transition: 'left 0.2s',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                        }} />
                    </button>
                </div>

                {/* AI suggestions toggle — edit mode, Level 3+ */}
                {isEdit && level >= 3 && (
                    <div style={{
                        background: 'var(--color-card)',
                        borderRadius: '16px',
                        padding: '16px',
                        border: '1px solid var(--color-divider)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{
                                background: useAI ? 'var(--color-primary-soft)' : 'var(--color-divider)',
                                borderRadius: '12px',
                                width: '44px',
                                height: '44px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                transition: 'background 0.2s',
                            }}>
                                <Command size={22} color={useAI ? 'var(--color-primary)' : 'var(--color-text-secondary)'} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p className="label-bold" style={{ margin: 0, color: 'var(--color-text-main)' }}>AI SUGGESTIONS</p>
                                <p className="caption" style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Breakdown and Time Estimate</p>
                            </div>
                            <button
                                onClick={() => {
                                    const next = !useAI
                                    setUseAI(next)
                                    if (next) {
                                        setAiSuggest(true)
                                        runAISuggestions()
                                    } else {
                                        setAiSuggest(false)
                                        setAiPending([])
                                        setAiSubmitted(false)
                                        setAiSnapshot(null)
                                    }
                                }}
                                style={{
                                    width: '48px',
                                    height: '26px',
                                    borderRadius: '999px',
                                    border: 'none',
                                    flexShrink: 0,
                                    cursor: 'pointer',
                                    background: useAI ? 'var(--color-primary)' : 'var(--color-divider)',
                                    position: 'relative',
                                    transition: 'background 0.2s',
                                }}
                            >
                                <div style={{
                                    position: 'absolute',
                                    top: '3px',
                                    left: useAI ? '25px' : '3px',
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    background: 'white',
                                    transition: 'left 0.2s',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                }} />
                            </button>
                        </div>
                        {!useAI && subtasks.some(s => s.ai) && (
                            <p className="caption" style={{ margin: '10px 0 0', color: 'var(--color-text-secondary)' }}>
                                AI badges will be removed from existing subtasks when saved.
                            </p>
                        )}
                    </div>
                )}

                {/* AI suggestions toggle — create mode only, Level 3+ */}
                {!isEdit && (
                    level >= 3 ? (
                        <div style={{
                            background: 'var(--color-card)',
                            borderRadius: '16px',
                            padding: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            border: '1px solid var(--color-divider)'
                        }}>
                            <div style={{
                                background: 'var(--color-primary-soft)',
                                borderRadius: '12px',
                                width: '44px',
                                height: '44px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <Command size={22} color="var(--color-primary)" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p className="label-bold" style={{ margin: 0, color: 'var(--color-text-main)' }}>AI SUGGESTIONS</p>
                                <p className="caption" style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Breakdown and Time Estimate</p>
                            </div>
                            <button
                                onClick={handleAiToggle}
                                style={{
                                    width: '48px',
                                    height: '26px',
                                    borderRadius: '999px',
                                    border: 'none',
                                    flexShrink: 0,
                                    cursor: 'pointer',
                                    background: aiSuggest ? 'var(--color-primary)' : 'var(--color-divider)',
                                    position: 'relative',
                                    transition: 'background 0.2s'
                                }}
                            >
                                <div style={{
                                    position: 'absolute',
                                    top: '3px',
                                    left: aiSuggest ? '25px' : '3px',
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    background: 'white',
                                    transition: 'left 0.2s',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                                }} />
                            </button>
                        </div>
                    ) : (
                        <div style={{
                            background: 'var(--color-card)',
                            borderRadius: '16px',
                            padding: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            border: '1px dashed var(--color-divider)',
                            opacity: 0.6
                        }}>
                            <div style={{
                                background: 'var(--color-divider)',
                                borderRadius: '12px',
                                width: '44px',
                                height: '44px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <Lock size={20} color="var(--color-text-secondary)" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p className="label-bold" style={{ margin: 0, color: 'var(--color-text-secondary)' }}>AI SUGGESTIONS</p>
                                <p className="caption" style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Big Task Destroyer — unlock at Lvl 3</p>
                            </div>
                            <ChevronRight size={18} color="var(--color-text-secondary-muted)" />
                        </div>
                    )
                )}

                {/* Instructions for AI — visible when AI Suggestions is on (create) or AI is enabled in edit */}
                {((isEdit && useAI) || (aiSuggest && level >= 3)) && (
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* resubmit — only visible when form changed after an AI call in edit mode */}
                        {formStale && useAI && (
                            <button
                                onClick={runAISuggestions}
                                className="label-bold"
                                style={{
                                    width: '100%',
                                    height: '52px',
                                    background: 'none',
                                    border: '1.5px solid var(--color-primary)',
                                    borderRadius: '16px',
                                    color: 'var(--color-primary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxSizing: 'border-box'
                                }}
                            >
                                <Command size={16} /> Update AI Suggestions
                            </button>
                        )}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setShowLeaveConfirm(true)}
                                className="label-bold"
                                style={{
                                    flex: 1,
                                    height: '56px',
                                    background: 'none',
                                    border: '1px solid var(--color-divider)',
                                    borderRadius: '16px',
                                    color: 'var(--color-text-secondary)',
                                    cursor: 'pointer'
                                }}
                            >
                                Discard
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={formStale && useAI}
                                className="h3"
                                style={{
                                    flex: 2,
                                    height: '56px',
                                    background: (formStale && useAI) ? 'var(--color-card)' : 'var(--color-primary)',
                                    border: (formStale && useAI) ? '1px solid var(--color-divider)' : 'none',
                                    borderRadius: '16px',
                                    color: (formStale && useAI) ? 'var(--color-text-secondary-muted)' : 'white',
                                    fontWeight: 700,
                                    cursor: (formStale && useAI) ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                    boxSizing: 'border-box'
                                }}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* resubmit — only visible when form changed after an AI call */}
                        {formStale && (
                            <button
                                onClick={runAISuggestions}
                                className="label-bold"
                                style={{
                                    width: '100%',
                                    height: '52px',
                                    background: 'none',
                                    border: '1.5px solid var(--color-primary)',
                                    borderRadius: '16px',
                                    color: 'var(--color-primary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxSizing: 'border-box'
                                }}
                            >
                                <Command size={16} /> Update AI Suggestions
                            </button>
                        )}

                        <button
                            onClick={handleCreate}
                            disabled={formStale}
                            className="h3"
                            style={{
                                width: '100%',
                                height: '56px',
                                background: formStale ? 'var(--color-card)' : 'var(--color-primary)',
                                border: formStale ? '1px solid var(--color-divider)' : 'none',
                                borderRadius: '16px',
                                color: formStale ? 'var(--color-text-secondary-muted)' : 'white',
                                fontWeight: 700,
                                cursor: formStale ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                boxSizing: 'border-box'
                            }}
                        >
                            Create Task
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

function ActionBtn({ onClick, color, children }) {
    return (
        <button
            onClick={onClick}
            style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                // Uses the soft variant of the passed color (e.g., var(--color-primary-soft))
                background: `var(--color-${color}-soft)`,
                border: 'none',
                cursor: 'pointer',
                // Uses the main variant (e.g., var(--color-primary))
                color: `var(--color-${color})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'transform 0.1s active'
            }}
        >
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
        <div style={{ background: 'var(--color-card)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--color-divider)' }}>
            {items.map((subtask, i) => (
                <div
                    key={subtask.id}
                    {...getDragProps(i)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px 16px',
                        borderBottom: i < items.length - 1 ? '1px solid var(--color-divider)' : 'none',
                        opacity: dragOverIndex === i ? 0.4 : 1,
                        transition: 'opacity 0.15s',
                        cursor: 'grab'
                    }}
                >
                    <GripVertical size={20} color="var(--color-text-secondary)" style={{ flexShrink: 0 }} />

                    <span className="h3" style={{ color: 'var(--color-text-secondary)', width: '14px', flexShrink: 0, textAlign: 'left', fontSize: '14px' }}>
                        {i + 1}
                    </span>

                    {editingId === subtask.id ? (
                        <input
                            autoFocus
                            value={editLabel}
                            onChange={e => setEditLabel(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') commitEdit(subtask.id); if (e.key === 'Escape') cancelEdit() }}
                            className="body"
                            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--color-text-main)' }}
                        />
                    ) : (
                        <span className="body-light" style={{ flex: 1, color: 'var(--color-text-main)' }}>
                            {subtask.label}
                        </span>
                    )}

                    {subtask.ai && editingId !== subtask.id && (
                        <span className="label-default" style={{
                            fontSize: '10px',
                            color: 'var(--color-primary)',
                            background: 'var(--color-primary-soft)',
                            padding: '2px 8px',
                            borderRadius: '999px',
                            flexShrink: 0
                        }}>
                            AI
                        </span>
                    )}

                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        {editingId === subtask.id ? (
                            <>
                                <ActionBtn onClick={() => commitEdit(subtask.id)} color="success">
                                    <Check size={14} strokeWidth={3} />
                                </ActionBtn>
                                <ActionBtn onClick={cancelEdit} color="secondary">
                                    <X size={14} strokeWidth={3} />
                                </ActionBtn>
                            </>
                        ) : (
                            <>
                                <ActionBtn onClick={() => startEdit(subtask)} color="secondary">
                                    <Pencil size={14} />
                                </ActionBtn>
                                <ActionBtn onClick={() => removeSubtask(subtask.id)} color="important">
                                    <X size={14} />
                                </ActionBtn>
                            </>
                        )}
                    </div>
                </div>
            ))}

            {addingNew ? (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    background: 'color-mix(in srgb, var(--color-primary) 5%, transparent)',
                    borderTop: items.length > 0 ? '1px solid var(--color-divider)' : 'none'
                }}>
                    <input
                        autoFocus
                        value={newSubtask}
                        onChange={e => setNewSubtask(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') addNewSubtask(); if (e.key === 'Escape') setAddingNew(false) }}
                        placeholder="New subtask..."
                        className="body"
                        style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--color-text-main)' }}
                    />
                    <button onClick={addNewSubtask} className="label-bold" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}>
                        Add
                    </button>
                    <button onClick={() => setAddingNew(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                        <X size={18} />
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setAddingNew(true)}
                    className="label-bold"
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '16px',
                        background: 'none',
                        border: 'none',
                        borderTop: items.length > 0 ? '1px solid var(--color-divider)' : 'none',
                        cursor: 'pointer',
                        color: 'var(--color-text-secondary)'
                    }}
                >
                    <Plus size={16} /> ADD SUBTASK
                </button>
            )}
        </div>
    )
}

export default TaskCreate