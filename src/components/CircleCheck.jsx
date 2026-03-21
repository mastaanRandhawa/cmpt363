// CircleCheck
// Circular checkbox used to mark tasks and subtasks as complete.
// Used in TaskCard, TaskDetail subtask list, and Focus Timer steps.
//
// Props:
//   checked   – boolean, controlled checked state
//   onChange  – (checked: boolean) => void
//   size      – number, diameter in px (default 22)
//
// Usage examples:
//   // TaskCard
//   <CircleCheck checked={task.completed} onChange={val => updateTask(task.id, { completed: val })} />
//
//   // Subtask row in TaskDetail / Focus Timer
//   <CircleCheck checked={subtask.done} onChange={val => updateSubtask(subtask.id, val)} size={18} />

function CircleCheck({ checked, onChange, size = 22 }) {
    return (
        <div
            onClick={e => { e.stopPropagation(); onChange(!checked) }}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                border: `3px solid ${checked ? 'var(--color-success)' : 'var(--color-surface-alt)'}`,
                background: checked ? 'var(--color-success)' : 'none',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
                cursor: 'pointer',
            }}
        >
            {checked && (
                <svg
                    width={size * 0.45}
                    height={size * 0.36}
                    viewBox="0 0 10 8"
                    fill="none"
                >
                    <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="white"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            )}
        </div>
    )
}

export default CircleCheck