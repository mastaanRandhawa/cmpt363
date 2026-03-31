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

import React from 'react';
import { createPortal } from 'react-dom';
import FadeOverlay from './FadeOverlay';

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
    const activeSoftColor    = confirmSoftColors[confirmVariant] || confirmSoftColors.danger;
    const phoneFrame         = document.getElementById('phone-frame') ?? document.body;

    return createPortal(
        <>
            {/* Backdrop — FadeOverlay with position:absolute stays clipped to #phone-frame */}
            <FadeOverlay visible={true} />

            {/* Centering layer — sits above the backdrop, dismisses on outside click */}
            <div
                onClick={onCancel}
                style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '32px',
                }}
            >
                {/* Card — stopPropagation so clicks inside don't dismiss */}
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
                            width: '80px',
                            height: '80px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '20px',
                        }}>
                            {React.cloneElement(icon, { color: activeConfirmColor, size: '32px' })}
                        </div>
                    )}

                    <h2 className="h3" style={{
                        margin: '0 0 8px 0',
                        textAlign: 'center',
                        color: 'var(--color-text-main)',
                    }}>
                        {title}
                    </h2>

                    <p className="body" style={{
                        margin: '0 0 28px 0',
                        paddingLeft: '10px',
                        paddingRight: '10px',
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
                                cursor: 'pointer',
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
                                cursor: 'pointer',
                            }}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </>
        , phoneFrame)
}

export default ConfirmDialog