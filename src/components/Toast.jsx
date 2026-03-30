// Toast
// A floating bottom toast with an optional timed progress bar and an optional action button.
// Used for confirmations, undo prompts, and brief feedback messages.
//
// Props:
//   message      – string, main toast text
//   icon         – ReactNode, small icon on the left (optional)
//   progress     – number 0–100, fills the progress bar (optional — omit to hide the bar)
//   barColor     – CSS color string for the progress bar fill (default 'var(--color-primary)')
//   actionLabel  – string, label for the right-side action button (optional)
//   onAction     – () => void, called when the action button is tapped (optional)
//
// The progress bar and action button are both optional and independent:
//   - Progress bar only (auto-dismiss, no action): pass progress, omit actionLabel
//   - Undo pattern: pass progress + actionLabel + onAction
//   - Simple confirmation (no timer, no action): omit all three
//
// Usage examples:
//   // Undo complete (TaskDetail)
//   <Toast
//     message="Task marked complete"
//     icon={<CheckCircle size={16} color="var(--color-success)" />}
//     progress={undoProgress}
//     barColor="var(--color-primary)"
//     actionLabel="Undo"
//     onAction={handleUndo}
//   />
//
//   // Undo delete (TaskDetail)
//   <Toast
//     message="Task deleted"
//     icon={<Trash2 size={16} color="var(--color-danger)" />}
//     progress={deleteProgress}
//     barColor="var(--color-danger)"
//     actionLabel="Undo"
//     onAction={handleUndoDelete}
//   />
//
//   // Simple confirmation (TaskCreate — no undo needed)
//   <Toast
//     message="Task created"
//     icon={<CheckCircle size={16} color="var(--color-success)" />}
//     progress={dismissProgress}
//   />

function Toast({ message, icon, progress, barColor = 'var(--color-accent)', actionLabel, onAction }) {
    const showBar = progress !== undefined

    return (
        <div style={{
            position: 'absolute',
            bottom: '90px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--color-card)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
            zIndex: 500,
            whiteSpace: 'nowrap',
            border: '1px solid var(--color-divider)',
            minWidth: '260px',
        }}>
            {/* progress bar */}
            {showBar && (
                <div style={{ height: '3px', background: 'var(--color-surface-alt)' }}>
                    <div style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: barColor,
                        transition: 'width 0.05s linear',
                    }} />
                </div>
            )}

            {/* content */}
            <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                {icon && icon}
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', flex: 1 }}>
                    {message}
                </span>
                {actionLabel && onAction && (
                    <button
                        onClick={onAction}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--color-primary)', fontWeight: 700,
                            fontSize: '13px', padding: 0,
                        }}
                    >
                        {actionLabel}
                    </button>
                )}
            </div>
        </div>
    )
}

export default Toast