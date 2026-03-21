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

function FadeOverlay({ visible, navigating }) {
    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--color-bg)',
            zIndex: 50,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            opacity: navigating ? 1 : visible ? 0.6 : 0,
            transition: navigating ? 'opacity 0.35s ease' : 'opacity 0.2s ease',
        }} />
    )
}

export default FadeOverlay