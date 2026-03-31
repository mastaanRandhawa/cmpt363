import { useState, useRef, useEffect } from 'react'
import useBottomTrayStore from '../data/useBottomTrayStore'

// BottomTrayModal
// Persistent bottom tray. Renders whatever contents are set using the
// bottomTrayStore hook and can be swiped away to dismiss.
// Sticks to the bottom of the phone frame via position: sticky and sits above
// the tab bar.
//
// When aboveNav is true the tray's bottom edge is positioned using the
// --bottom-nav-height CSS custom property that BottomNav publishes on the
// phone-frame element. This keeps the tray flush with the nav's top edge
// on every device profile without any hard-coded pixel offsets.

// Bottom tray as blocking modal.
export function BottomTrayModal(props) {
    const { dismiss } = useBottomTrayStore()
    const _modalRef = useRef(null)
    return (
        <div
            ref={_modalRef}
            className='modal-backdrop'
            onClick={(e) => {
                e.stopPropagation()
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

export function BottomTray({ children, id, style, _parentRef, onDismiss, aboveNav }) {
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

        const trayHeight        = trayRef.current?.clientHeight
        const dismissActivation = trayHeight * 0.6

        if (lastDiff.current > dismissActivation) {
            trayRef.current?.setAttribute('data-swipe-mode', 'dismiss');
            trayRef.current?.style.setProperty('--tray-offset-y', `${trayHeight + 20}px`);
            setDismissing(true)
            setTimeout(dismiss, 150)
            return
        }

        trayRef.current?.setAttribute('data-swipe-mode', 'reset');
        trayRef.current?.style.setProperty('--tray-offset-y', `0`);
    }

    useEffect(() => {
        const parent = _parentRef?.current
        parent?.addEventListener('touchstart', onTouchStart)
        parent?.addEventListener('touchmove',  onTouchMove)
        parent?.addEventListener('touchend',   onTouchEnd)
        return () => {
            parent?.removeEventListener('touchstart', onTouchStart)
            parent?.removeEventListener('touchmove',  onTouchMove)
            parent?.removeEventListener('touchend',   onTouchEnd)
        }
    }, [_parentRef])

    // When the tray sits above the nav bar, place its bottom edge exactly at
    // the nav's top edge using the CSS variable BottomNav publishes.
    // Fall back to 0 if the variable is not yet set (first paint).
    const bottomOffset = aboveNav ? 'var(--bottom-nav-height, 0px)' : '0px'

    return (
        <div
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onClick={e => e.stopPropagation()}
            ref={trayRef}
            id={id}
            className='bottom-tray'
            style={{
                position: 'absolute',
                width: '100%',
                background: 'var(--color-card)',
                borderTop: '1px solid var(--color-divider)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'start',
                alignItems: 'center',
                padding: '12px 0 24px',
                minHeight: 200,
                maxHeight: '75%',
                transform: 'translateY(var(--tray-offset-y))',
                // Caller overrides (strip aboveNav-related keys to avoid conflicts)
                ...(style ?? {}),
                // Re-assert the computed values so caller can't accidentally clobber them
                bottom: bottomOffset,
                zIndex: aboveNav ? 49 : (style?.zIndex ?? 100),
            }}
        >
            <BottomTrayHandle />
            {children}
        </div>
    )
}

function BottomTrayHandle() {
    return (
        <div style={{
            height: 6,
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
    const iconSize = 20;
    return (
        <button
            onClick={onClick}
            style={{
                display: 'block',
                width: '100%',
                background: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-main)',
                padding: '0px 24px',
                border: 'none',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 0',
                    borderBottom: '1px solid var(--color-divider)',
                }}
            >
                <Icon
                    size={iconSize}
                    strokeWidth={2}
                    style={{
                        flex: '0 0 auto',
                        width: iconSize,
                        color: 'var(--color-text-mid)'
                    }}
                />
                <div
                    className="label-bold"
                    style={{
                        flex: '1 1',
                        textAlign: 'center'
                    }}
                >
                    {label}
                </div>

                { RightIcon && <RightIcon
                    size={16}
                    strokeWidth={2}
                    style={{
                        flex: '0 0 auto',
                        width: 16,
                        color: 'var(--color-text-secondary-muted)',
                    }}
                />
                }
                { !RightIcon && <div style={{ width: 16 }} /> }
            </div>
        </button>
    )
}

export default BottomTrayModal