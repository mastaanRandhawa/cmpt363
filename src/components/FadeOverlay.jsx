function FadeOverlay({ visible, navigating }) {
    // When navigating, we want to fade into the theme's background color
    // When just "dimming" for a delete action, we use a standard dark overlay
    const backgroundColor = navigating ? 'var(--color-bg)' : 'rgba(0, 0, 0, 0.45)';

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            background: backgroundColor,
            zIndex: 100,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            // If navigating to a new page, go 100% opaque
            // If just showing a delete state, go 100% (since the color is already 0.45 alpha)
            opacity: (navigating || visible) ? 1 : 0,
            transition: navigating
                ? 'opacity 0.4s ease-in-out'
                : 'opacity 0.2s ease-out',
        }} />
    )
}

export default FadeOverlay