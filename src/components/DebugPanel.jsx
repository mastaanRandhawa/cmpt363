// DebugPanel
// Development-only panel displayed outside the phone frame showing live app state.
// Shows task store contents, toast state, and quick stats.
// Remove or conditionally render this before shipping to production.

import useTaskStore from '../data/useTaskStore'
import useToastStore from '../data/useToastStore'
import useDebugStore from '../data/useDebugStore'
import { useState } from 'react'

const s = {
    panel: {
        width: '280px',
        background: '#111',
        border: '1px solid #2a2a2a',
        borderRadius: '12px',
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#888',
        overflow: 'hidden',
        flexShrink: 0,
        alignSelf: 'flex-start',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        background: '#1a1a1a',
        borderBottom: '1px solid #2a2a2a',
        cursor: 'pointer',
        userSelect: 'none',
    },
    headerLabel: {
        color: '#555',
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '0.12em',
    },
    section: {
        borderBottom: '1px solid #1e1e1e',
        padding: '10px 14px',
    },
    sectionTitle: {
        color: '#444',
        fontSize: '9px',
        fontWeight: 700,
        letterSpacing: '0.14em',
        marginBottom: '8px',
    },
    row: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '8px',
        marginBottom: '4px',
        lineHeight: 1.4,
    },
    key: { color: '#555', flexShrink: 0 },
    val: { color: '#888', textAlign: 'right', wordBreak: 'break-all' },
    badge: (color) => ({
        display: 'inline-block',
        padding: '1px 6px',
        borderRadius: '4px',
        fontSize: '10px',
        fontWeight: 700,
        background: color + '22',
        color: color,
    }),
}

const PRIORITY_COLOR = { high: '#E07070', med: '#E8C97E', low: '#7BAE8F' }
const STATUS_COLOR   = { completed: '#7BAE8F', 'in-progress': '#E8C97E', todo: '#555' }

function DebugPanel() {
    const tasks      = useTaskStore(state => state.tasks)
    const toast      = useToastStore(state => state.toast)
    const debugPages = useDebugStore(state => state.pages)
    const [collapsed, setCollapsed] = useState(false)
    const [expandedId, setExpandedId] = useState(null)

    const total     = tasks.length
    const completed = tasks.filter(t => t.status === 'completed').length
    const inProg    = tasks.filter(t => t.status === 'in-progress').length
    const todo      = tasks.filter(t => t.status === 'todo').length
    const highPri   = tasks.filter(t => t.priority === 'high').length

    return (
        <div style={s.panel}>

            {/* header */}
            <div style={s.header} onClick={() => setCollapsed(c => !c)}>
                <span style={s.headerLabel}>⬡ DEBUG</span>
                <span style={{ color: '#333', fontSize: '10px' }}>{collapsed ? '▼' : '▲'}</span>
            </div>

            {!collapsed && (
                <>
                    {/* active page state — only shown when a page is reporting */}
                    {Object.entries(debugPages).map(([page, data]) => (
                        <div key={page} style={s.section}>
                            <div style={{ ...s.sectionTitle, color: '#5a8a5a' }}>{page.toUpperCase()}</div>
                            {Object.entries(data).map(([key, val]) => (
                                <div key={key} style={s.row}>
                                    <span style={s.key}>{key}</span>
                                    <span style={{
                                        ...s.val,
                                        color: val === '—' ? '#333'
                                            : key === 'step' ? '#7C6FCD'
                                                : key === 'aiSuggest' ? (val ? '#7BAE8F' : '#E07070')
                                                    : '#888',
                                    }}>
                                        {String(val)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ))}
                    {/* summary stats */}
                    <div style={s.section}>
                        <div style={s.sectionTitle}>TASK STORE</div>
                        <div style={s.row}>
                            <span style={s.key}>total</span>
                            <span style={s.val}>{total}</span>
                        </div>
                        <div style={s.row}>
                            <span style={s.key}>todo</span>
                            <span style={{ ...s.badge(STATUS_COLOR.todo) }}>{todo}</span>
                        </div>
                        <div style={s.row}>
                            <span style={s.key}>in-progress</span>
                            <span style={{ ...s.badge(STATUS_COLOR['in-progress']) }}>{inProg}</span>
                        </div>
                        <div style={s.row}>
                            <span style={s.key}>completed</span>
                            <span style={{ ...s.badge(STATUS_COLOR.completed) }}>{completed}</span>
                        </div>
                        <div style={s.row}>
                            <span style={s.key}>high priority</span>
                            <span style={{ ...s.badge(PRIORITY_COLOR.high) }}>{highPri}</span>
                        </div>
                    </div>

                    {/* toast state */}
                    <div style={s.section}>
                        <div style={s.sectionTitle}>TOAST</div>
                        {toast ? (
                            <>
                                <div style={s.row}>
                                    <span style={s.key}>message</span>
                                    <span style={{ ...s.val, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {toast.message}
                                    </span>
                                </div>
                                <div style={s.row}>
                                    <span style={s.key}>progress</span>
                                    <span style={s.val}>{Math.round(toast.progress ?? 0)}%</span>
                                </div>
                            </>
                        ) : (
                            <span style={{ color: '#333' }}>—</span>
                        )}
                    </div>

                    {/* task list */}
                    <div style={{ ...s.section, borderBottom: 'none', maxHeight: '480px', overflowY: 'auto', scrollbarWidth: 'none' }}>
                        <div style={s.sectionTitle}>TASKS</div>
                        {tasks.map(task => (
                            <div key={task.id} style={{ marginBottom: '8px' }}>
                                <div
                                    onClick={() => setExpandedId(id => id === task.id ? null : task.id)}
                                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}
                                >
                                    <span style={{ color: '#333', fontSize: '9px' }}>{expandedId === task.id ? '▼' : '▶'}</span>
                                    <span style={{ color: '#666', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {task.name}
                                    </span>
                                    <span style={s.badge(PRIORITY_COLOR[task.priority] ?? '#555')}>
                                        {task.priority}
                                    </span>
                                    <span style={s.badge(STATUS_COLOR[task.status] ?? '#555')}>
                                        {task.status}
                                    </span>
                                </div>

                                {expandedId === task.id && (
                                    <div style={{ paddingLeft: '14px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <div style={s.row}><span style={s.key}>id</span><span style={{ ...s.val, color: '#444' }}>{task.id}</span></div>
                                        <div style={s.row}><span style={s.key}>due</span><span style={s.val}>{task.due || '—'}</span></div>
                                        <div style={s.row}><span style={s.key}>time</span><span style={s.val}>{task.time || '—'}</span></div>
                                        <div style={s.row}><span style={s.key}>effort</span><span style={s.val}>{task.effort}</span></div>
                                        <div style={s.row}><span style={s.key}>repeat</span><span style={s.val}>{task.repeat ? task.repeat.frequency : '—'}</span></div>
                                        <div style={s.row}>
                                            <span style={s.key}>subtasks</span>
                                            <span style={s.val}>
                                                {task.subtasks.length > 0
                                                    ? `${task.subtasks.filter(s => s.done).length}/${task.subtasks.length} done`
                                                    : '—'
                                                }
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default DebugPanel