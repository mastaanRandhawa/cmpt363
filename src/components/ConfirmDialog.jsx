// ConfirmDialog
// A modal confirmation dialog with a dimmed backdrop, icon, title, message,
// and two action buttons. Used for destructive actions like delete and
// partial-completion warnings.
//
// Props:
//   icon           – ReactNode, displayed at the top of the card
//   title          – string, bold heading (e.g. 'DELETE TASK?')
//   message        – string, supporting text below the title
//   confirmLabel   – string, confirm button text (default 'Confirm')
//   confirmVariant – 'danger' | 'success' | 'primary' (default 'danger')
//   cancelLabel    – string, cancel button text (default 'Cancel')
//   onConfirm      – () => void
//   onCancel       – () => void
//
// Usage examples:
//   // Delete confirm (TaskDetail / Tasks)
//   <ConfirmDialog
//     icon={<Trash2 size={24} color="var(--color-danger)" />}
//     title="DELETE TASK?"
//     message="This task will be permanently removed."
//     confirmLabel="Delete Task"
//     confirmVariant="danger"
//     onConfirm={handleDelete}
//     onCancel={() => setShowDeleteConfirm(false)}
//   />
//
//   // Incomplete subtasks warning (TaskDetail)
//   <ConfirmDialog
//     icon={<CheckCircle size={24} color="var(--color-accent)" />}
//     title="NOT QUITE DONE?"
//     message={`${completedCount} of ${subtasks.length} subtasks complete. Mark everything done anyway?`}
//     confirmLabel="Mark Done"
//     confirmVariant="success"
//     onConfirm={markComplete}
//     onCancel={() => setShowCompleteConfirm(false)}
//   />

const confirmColors = {
    danger:  'var(--color-danger)',
    success: 'var(--color-success)',
    primary: 'var(--color-primary)',
}

function ConfirmDialog({
                           icon,
                           title,
                           message,
                           confirmLabel   = 'Confirm',
                           confirmVariant = 'danger',
                           cancelLabel    = 'Cancel',
                           onConfirm,
                           onCancel,
                       }) {
    return (
        <div
            onClick={onCancel}
            style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 100, padding: '32px',
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: 'var(--color-surface)',
                    borderRadius: '24px',
                    padding: '28px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    maxWidth: '320px',
                    color: 'var(--color-text)',
                }}
            >
                {/* icon bubble */}
                {icon && (
                    <div style={{
                        background: `color-mix(in srgb, ${confirmColors[confirmVariant]} 12%, transparent)`,
                        borderRadius: '16px',
                        width: '52px',
                        height: '52px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        {icon}
                    </div>
                )}

                <p style={{ margin: 0, fontWeight: 800, fontSize: '18px', letterSpacing: '0.04em', textAlign: 'center' }}>
                    {title}
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
                    {message}
                </p>

                <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '8px' }}>
                    <button
                        onClick={onCancel}
                        style={{ flex: 1, padding: '14px', background: 'var(--color-surface-alt)', border: 'none', borderRadius: '14px', color: 'var(--color-text)', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{ flex: 1, padding: '14px', background: confirmColors[confirmVariant], border: 'none', borderRadius: '14px', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmDialog