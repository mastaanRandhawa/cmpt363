import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function Header({ title, subtitle, onBack, rightAction, 'data-onboarding': dataOnboarding }) {
    const navigate = useNavigate()

    function handleBack() {
        if (typeof onBack === 'function') onBack()
        else navigate(-1)
    }

    return (
        <div data-onboarding={dataOnboarding} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            height: '72px',
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            zIndex: 10,
            // Glass effect: matches bg but adds a subtle bottom boundary
            background: 'var(--color-bg)',
            borderBottom: '1px solid var(--color-divider)',
        }}>

            {/* text column */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, minWidth: 0 }}>

                {/* subtitle — visibility logic maintained */}
                <p className="label-caps" style={{
                    color: 'var(--color-text-secondary)',
                    marginTop: 0,
                    marginBottom: 0,
                    marginLeft: 0,
                    marginRight: 0,
                    height: '16px',
                    lineHeight: '16px',
                    paddingLeft: '26px',
                    visibility: subtitle ? 'visible' : 'hidden',
                    userSelect: 'none',
                }}>
                    {subtitle || 'X'}
                </p>

                {/* title row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <div style={{ width: '26px', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                        {onBack && (
                            <button
                                onClick={handleBack}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--color-text-main)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0',
                                }}
                            >
                                <ChevronLeft size={22} />
                            </button>
                        )}
                    </div>

                    {title && (
                        <h1 className="h3" style={{
                            fontWeight: 700,
                            color: 'var(--color-text-main)',
                            margin: 0,
                            lineHeight: 1.15,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            textTransform: 'none',
                        }}>
                            {title}
                        </h1>
                    )}
                </div>

            </div>

            {/* right side */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexShrink: 0,
                visibility: rightAction ? 'visible' : 'hidden',
            }}>
                {rightAction || <span style={{ width: '44px', height: '44px' }} />}
            </div>

        </div>
    )
}

export default Header