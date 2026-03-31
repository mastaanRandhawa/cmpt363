// FadeOverlay
// A full-page dim overlay used during destructive pending actions like delete.
// Always rendered so CSS opacity transitions animate smoothly.
//
// Props:
//   visible    – boolean, dims to 60% opacity
//   navigating – boolean, goes to 100% opacity (full black) for page transition
//
// Usage:
//   <FadeOverlay visible={deletePending} navigating={navigating} />

function FadeOverlay({ visible, navigating, isModal = false }) {
// When navigating, we want to fade into the theme's background color
    // When just "dimming" for a modal, we use the theme's modal variable
    const backgroundColor = navigating
        ? 'var(--color-bg)'
        : (isModal ? 'var(--color-modal)' : 'rgba(0, 0, 0, 0.45)');

    return (
        <div style={{
            // Switch to fixed for full-screen centering
            position: isModal ? 'fixed' : 'absolute',
            inset: 0,
            background: backgroundColor,
            zIndex: isModal ? 1000 : 100, // Higher z-index for modals
            borderRadius: isModal ? 0 : 'inherit',

            // If it's a modal, we WANT pointer events to block clicking the background
            pointerEvents: (visible || navigating) ? 'auto' : 'none',

            opacity: (navigating || visible) ? 1 : 0,
            transition: navigating
                ? 'opacity 0.4s ease-in-out'
                : 'opacity 0.2s ease-out',

            // This centers the content if you put the Dialog inside this div
            display: isModal ? 'flex' : 'block',
            alignItems: 'center',
            justifyContent: 'center',
        }} />
    )
}

export default FadeOverlay