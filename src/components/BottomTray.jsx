import { useState, useRef, useEffect } from 'react'
import useBottomTrayStore from '../data/useBottomTrayStore'

// BottomTrayModal
// Persistent bottom tray. Renders whatever contents are set using the
// bottomTrayStore hook and can be swiped away to dismiss.
// Sticks to the bottom of the phone frame via position: sticky and sits above
// the tab bar.

// Bottom tray as blocking modal.
export function BottomTrayModal(props) {
    const { dismiss } = useBottomTrayStore()
    const _modalRef = useRef(null)
    return (
        <div
            ref={_modalRef}
            className='modal-backdrop'
            onClick={(e) => {
                e.stopPropagation() // Don't allow clicking anything underneath
                props.onDismiss?.()
                dismiss()
            }}
            style={{
                position: 'absolute',
                zIndex: (props.style?.zIndex ?? 100),
                bottom: 0,
                width: '100%',
                height: '100%',
            }}
        >
            <BottomTray _parentRef={_modalRef} {...props} />
        </div>
    )
}

export function BottomTray({ children, style, _parentRef, onDismiss }) {
    const bottomTrayStore = useBottomTrayStore()

    const [ dismissing, setDismissing ] = useState(false);
    const startY = useRef(null)
    const lastDiff = useRef(0)
    const trayRef = useRef(null)
    const THRESHOLD = 60

    function dismiss() {
        onDismiss?.()
        bottomTrayStore.dismiss()
    }

    function onTouchStart(e) {
        if (dismissing) return;
        startY.current = e.touches[0].clientY
        lastDiff.current = 0
    }

    function onTouchMove(e) {
        if (dismissing) return;
        if (startY.current === null) return
        const diff = e.touches[0].clientY - startY.current
        if (diff > THRESHOLD) {
            const diffPastActivation = diff - THRESHOLD
            lastDiff.current = diffPastActivation
            trayRef.current?.setAttribute('data-swipe-mode', 'touching');
            trayRef.current?.style.setProperty('--tray-offset-y', `${diffPastActivation}px`);
        }
    }

    function onTouchEnd() {
        if (dismissing) return;
        startY.current = null

        const trayHeight = trayRef.current?.clientHeight
        const dismissActivation = trayHeight * 0.6

        // If tray swiped down by 60%, dismiss it.
        if (lastDiff.current > dismissActivation) {
            trayRef.current?.setAttribute('data-swipe-mode', 'dismiss');
            trayRef.current?.style.setProperty('--tray-offset-y', `${trayHeight + 20}px`);
            setDismissing(true)
            setTimeout(dismiss, 150 /* should be same as in index.css */)
            return
        }

        // Otherwise, reset it to original position.
        trayRef.current?.setAttribute('data-swipe-mode', 'reset');
        trayRef.current?.style.setProperty('--tray-offset-y', `0`);
    }

    // Listen for touch events on the parent element so swiping down on the blocking modal
    // is treated the same as swiping down on the tray itself.
    useEffect(() => {
        const parent = _parentRef?.current;
        parent?.addEventListener('touchstart', onTouchStart)
        parent?.addEventListener('touchmove', onTouchMove)
        parent?.addEventListener('touchend', onTouchEnd)
        return () => {
            parent?.removeEventListener('touchstart', onTouchStart)
            parent?.removeEventListener('touchmove', onTouchMove)
            parent?.removeEventListener('touchend', onTouchEnd)
        }
    }, [_parentRef])

    return (
        <div 
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onClick={e => e.stopPropagation()}
            ref={trayRef}
            className='bottom-tray'
            style={{
                position: 'absolute',
                zIndex: 100,
                bottom: 0,
                width: '100%',
                background: 'var(--color-surface)',
                borderTop: '1px solid var(--color-surface-alt)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'start',
                alignItems: 'center',
                padding: '12px 0 28px',
                minHeight: 200,
                maxHeight: '75%',

                // Slide the tray around when dragging
                transform: 'translateY(var(--tray-offset-y))',

                // Merge styles.
                ...(style ?? {})
            }}
        >
            <BottomTrayHandle/>
            {children}
        </div>
    )
}

function BottomTrayHandle() {
    return (
        <div style={{
            height: 8,
            width: '10%',
            borderRadius: 8,
            margin: '8px 0 20px 0',
            background: 'var(--color-primary-soft)',
        }} />
    )
}

export function BottomTrayItem({ label, icon, rightIcon, onClick }) {
    const Icon = icon;
    const RightIcon = rightIcon;
    const iconSize = 18;
    return (
        <button
            onClick={onClick}
            style={{
                display: 'block',
                width: '100%',
                background: 'none',
                cursor: 'pointer',
                color: 'var(--color-text)',
                padding: '0px 24px',
                border: 'none',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '14px',
                    borderBottom: 'var(--color-separator) 2px solid',
                }}
            >
                <Icon
                    size={iconSize}
                    strokeWidth={1.8}
                    style={{
                        flex: '0 0 auto',
                        width: iconSize,
                    }}
                />
                <div
                    style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        flex: '1 1',
                    }}
                >
                    {label}
                </div>

                { /* The right icon or an empty space in its place. */ }
                { RightIcon && <RightIcon
                            size={iconSize}
                            strokeWidth={1.8}
                            style={{
                                flex: '0 0 auto',
                                width: iconSize,
                                opacity: '0.6',
                            }}
                        />
                }
                { !RightIcon && <div style={{ width: iconSize }} /> }
            </div>
        </button>
    )
}

export default BottomTrayModal
