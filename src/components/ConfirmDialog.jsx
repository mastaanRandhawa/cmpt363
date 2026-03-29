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

import React from 'react';

// Using your specific theme variables: important = Red, success = Green, primary = Blue
const confirmColors = {
    danger:  'var(--color-important)',
    success: 'var(--color-success)',
    primary: 'var(--color-primary)',
}

const confirmSoftColors = {
    danger:  'var(--color-important-soft)',
    success: 'var(--color-success-soft)',
    primary: 'var(--color-primary-soft)',
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
    const activeConfirmColor = confirmColors[confirmVariant] || confirmColors.danger;
    const activeSoftColor = confirmSoftColors[confirmVariant] || confirmSoftColors.danger;

    return (
        <div
            onClick={onCancel}
            style={{
                position: 'absolute',
                inset: 0,
                background: 'var(--color-modal-shade)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '32px',
                backdropFilter: 'blur(4px)',
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: 'var(--color-card)',
                    borderRadius: '28px',
                    padding: '32px 24px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    maxWidth: '320px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                }}
            >
                {/* Icon Bubble */}
                {icon && (
                    <div style={{
                        background: activeSoftColor,
                        borderRadius: '20px',
                        width: '64px',
                        height: '64px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '20px',
                    }}>
                        {/* Injecting the color into the icon itself
                           to ensure Lucide icons pick up the theme color
                        */}
                        {React.cloneElement(icon, { color: activeConfirmColor })}
                    </div>
                )}

                <h2 className="h3" style={{
                    margin: '0 0 8px 0',
                    textAlign: 'center',
                    color: 'var(--color-text-main)',
                }}>
                    {title}
                </h2>

                <p className="label-medium" style={{
                    margin: '0 0 28px 0',
                    color: 'var(--color-text-mid)',
                    textAlign: 'center',
                    lineHeight: 1.5,
                }}>
                    {message}
                </p>

                <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                    <button
                        onClick={onCancel}
                        className="label-bold"
                        style={{
                            flex: 1,
                            padding: '16px',
                            background: 'var(--color-divider)',
                            border: 'none',
                            borderRadius: '16px',
                            color: 'var(--color-text-main)',
                            cursor: 'pointer'
                        }}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="label-bold"
                        style={{
                            flex: 1,
                            padding: '16px',
                            background: activeConfirmColor,
                            border: 'none',
                            borderRadius: '16px',
                            color: '#FFFFFF',
                            cursor: 'pointer'
                        }}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmDialog