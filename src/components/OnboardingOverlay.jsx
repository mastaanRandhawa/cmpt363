import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import useOnboardingStore, { ONBOARDING_STEPS } from '../data/useOnboardingStore.js'

// ── Constants ──────────────────────────────────────────────────────────────
const OVERLAY_BG  = 'rgba(0, 0, 0, 0.50)'
const CARD_W      = 320
const CARD_H_EST  = 200   // estimated card height for positioning math
const SPOTLIGHT_R = 16    // spotlight border-radius
const SPOTLIGHT_BORDER_WIDTH = 1.5 // spotlight border width
const SPOTLIGHT_SHADOW_SIZE = 3 // spotlight box-shadow inset size
const PAD         = 8     // extra padding around each spotlight rect

// ── Sub-components ─────────────────────────────────────────────────────────

class SVGCoord {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(dx, dy) { return new SVGCoord(this.x + dx, this.y + dy) }
    withX(x)    { return new SVGCoord(x, this.y) }
    withY(y)    { return new SVGCoord(this.x, y) }

    toString() {
        return `${this.x} ${this.y}`
    }
}

/** Four dark panels that surround the spotlight cutout */
function DarkPanels({ sp, phoneW, phoneH, offset: off = 0 }) {
    const style = (extra) => ({
        position:      'absolute',
        pointerEvents: 'all',
        ...extra,
    })

    if (!sp) {
        return <div style={style({ inset: 0, background: OVERLAY_BG })} />
    }

    const rad = SPOTLIGHT_R
    const radCurve = off

    const xy_topLeft = new SVGCoord(sp.x, sp.y)
    const xy_topRight = new SVGCoord(sp.x + sp.w, sp.y)
    const xy_botRight = new SVGCoord(sp.x + sp.w, sp.y + sp.h)
    const xy_botLeft = new SVGCoord(sp.x, sp.y + sp.h)

    return (
        <svg
            style={style({ top: 0, left: 0, width: '100%', height: '100%' })}
            xmlns="http://www.w3.org/2000/svg"
        >
            <path fill={OVERLAY_BG} d={[
                // Below top left → Above top left
                `M ${xy_topLeft.add(-off, rad)}`,
                `S ${xy_topLeft.add(-radCurve, -radCurve)}, ${xy_topLeft.add(rad, -off)}`,

                // Above top left → Above top right → Below top right
                `L ${xy_topRight.add(-rad, -off)}`,
                `S ${xy_topRight.add(radCurve, -radCurve)}, ${xy_topRight.add(off, rad)}`,
                
                // Below top right → Above bottom right → Below bottom right
                `L ${xy_botRight.add(off, -rad)}`,
                `S ${xy_botRight.add(radCurve, radCurve)}, ${xy_botRight.add(-rad, off)}`,

                // Below bottom right → Below bottom left → Above bottom left
                `L ${xy_botLeft.add(rad, off)}`,
                `S ${xy_botLeft.add(-radCurve, radCurve)}, ${xy_botLeft.add(-off, -rad)}`,

                // Above bottom left → below top left
                `L ${xy_topLeft.add(-off, rad)}`,

                // Below top left → absolute left
                `L ${xy_topLeft.add(-off, rad).withX(0)}`,

                // Counter-clockwise across entire phone dimensions to cut out above shape.
                `L 0 ${phoneH}`,
                `L ${phoneW} ${phoneH}`,
                `L ${phoneW} ${phoneH}`,
                `L ${phoneW} 0`,
                `L 0 0`,
                `L ${xy_topLeft.add(-off, rad).withX(0)}`,
            ].join(' ')} />
        </svg>
    )
}

/** Glow border drawn on top of the spotlight area */
function SpotlightBorder({ sp }) {
    if (!sp) return null
    return (
        <div style={{
            position:      'absolute',
            top:           sp.y,
            left:          sp.x,
            width:         sp.w,
            height:        sp.h,
            borderRadius:  SPOTLIGHT_R,
            border:        `${SPOTLIGHT_BORDER_WIDTH}px solid color-mix(in srgb, var(--color-accent) 75%, transparent`,
            boxShadow:     `0 0 5px ${SPOTLIGHT_SHADOW_SIZE}px color-mix(in srgb, var(--color-accent) 35%, transparent), inset 0 0 24px color-mix(in srgb, var(--color-primary) 6%, transparent)`,
            pointerEvents: 'none',
            zIndex:        1,
        }} />
    )
}

/** Progress dots row */
function StepDots({ current, total }) {
    return (
        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginBottom: '14px' }}>
            {Array.from({ length: total }).map((_, i) => (
                <div
                    key={i}
                    style={{
                        width:        i === current ? '20px' : '6px',
                        height:       '6px',
                        borderRadius: '3px',
                        background:   i === current ? 'var(--color-primary)'
                            : i < current  ? 'color-mix(in srgb, var(--color-primary) 40%, transparent)'
                                : 'var(--color-divider)',
                        transition:   'width 0.28s ease, background 0.28s ease',
                    }}
                />
            ))}
        </div>
    )
}

/** The floating tooltip/action card */
function TooltipCard({ step, stepData, total, sp, phoneW, phoneH, onNext, onPrev, onFinish, ref, className }) {
    const { tooltipSide, title, body, isLast } = stepData

    // Card x: centred in the phone
    const cardX = (phoneW - CARD_W) / 2

    // Card y: prefer tooltipSide, clamp to stay on screen
    let cardY
    if (!sp || tooltipSide === 'center') {
        cardY = (phoneH - CARD_H_EST) / 2 - 20
    } else if (tooltipSide === 'below') {
        cardY = sp.y + sp.h + 16
        if (cardY + CARD_H_EST > phoneH - 96) {
            cardY = sp.y - CARD_H_EST - 16
        }
    } else {
        // above
        cardY = sp.y - CARD_H_EST - 16
        if (cardY < 58) {
            cardY = sp.y + sp.h + 16
        }
    }

    // Clamp
    cardY = Math.max(58, Math.min(phoneH - CARD_H_EST - 16, cardY))

    return (
        <div ref={ref} className={className} style={{
            position:      'absolute',
            left:          cardX,
            top:           cardY,
            width:         CARD_W,
            background:    'var(--color-card)',
            border:        '1px solid color-mix(in srgb, var(--color-primary) 28%, transparent)',
            borderRadius:  '20px',
            padding:       '20px 20px 16px',
            boxShadow:     '0 12px 40px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04)',
            zIndex:        2,
            pointerEvents: 'all',
        }}>
            <StepDots current={step} total={total} />

            <h3 style={{
                margin:        '0 0 8px',
                fontSize:      '16px',
                fontWeight:    800,
                color:         'var(--color-text-main)',
                letterSpacing: '0.01em',
                lineHeight:    1.25,
            }}>
                {title}
            </h3>

            <p style={{
                margin:     '0 0 18px',
                fontSize:   '13px',
                color:      'var(--color-text-muted)',
                lineHeight: 1.55,
            }}>
                {body}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Skip */}
                <button
                    onClick={onFinish}
                    style={{
                        background:    'none',
                        border:        'none',
                        color:         'var(--color-text-secondary)',
                        fontSize:      '12px',
                        fontWeight:    600,
                        cursor:        'pointer',
                        padding:       '8px 6px',
                        letterSpacing: '0.04em',
                        flexShrink:    0,
                    }}
                >
                    Skip
                </button>

                {/* Back */}
                {step > 0 && (
                    <button
                        onClick={onPrev}
                        style={{
                            flex:           1,
                            padding:        '10px 0',
                            background:     'var(--color-divider)',
                            border:         '1px solid color-mix(in srgb, var(--color-text-muted) 30%, transparent)',
                            borderRadius:   '12px',
                            color:          'var(--color-text-muted)',
                            fontSize:       '13px',
                            fontWeight:     700,
                            cursor:         'pointer',
                            display:        'flex',
                            alignItems:     'center',
                            justifyContent: 'center',
                            gap:            '2px',
                        }}
                    >
                        <ChevronLeft size={14} />
                        Back
                    </button>
                )}

                {/* Next / Get Started */}
                <button
                    onClick={isLast ? onFinish : onNext}
                    style={{
                        flex:           step > 0 ? 2 : 3,
                        padding:        '10px 0',
                        background:     'var(--color-primary)',
                        border:         'none',
                        borderRadius:   '12px',
                        color:          'white',
                        fontSize:       '13px',
                        fontWeight:     700,
                        cursor:         'pointer',
                        display:        'flex',
                        alignItems:     'center',
                        justifyContent: 'center',
                        gap:            '4px',
                        letterSpacing:  '0.02em',
                    }}
                >
                    {isLast    ? '🚀 Get Started'
                        : step === 0 ? 'Begin Tour'
                            : 'Next'}
                    {!isLast && <ChevronRight size={14} />}
                </button>
            </div>
        </div>
    )
}

// ── Main component ──────────────────────────────────────────────────────────

function OnboardingOverlay() {
    const active   = useOnboardingStore(s => s.active)
    const step     = useOnboardingStore(s => s.step)
    const next     = useOnboardingStore(s => s.next)
    const prev     = useOnboardingStore(s => s.prev)
    const finish   = useOnboardingStore(s => s.finish)
    const navigate = useNavigate()

    const stepData = ONBOARDING_STEPS[step]
    const total    = ONBOARDING_STEPS.length

    const [spotlight, setSpotlight] = useState(null)
    const [phoneDims, setPhoneDims] = useState({ w: 440, h: 956 })
    const [remeasureNumber, setRemeasureNumber] = useState(0)
    const tooltipRef = useRef(null)

    // Navigate to the correct route when step changes
    useEffect(() => {
        if (active && stepData?.route) {
            navigate(stepData.route)
        }
    }, [active, step]) // eslint-disable-line

    // Trigger a re-measure of target element after render settle
    useEffect(() => {
        const id = setTimeout(() => {
            setRemeasureNumber(remeasureNumber + 1)
        }, 150)

        return () => {
            clearInterval(id)
        }
    }, [active, step]) // eslint-disable-line

    // Measure target element after navigation, viewport resize
    useEffect(() => {
        if (!active) return
        if (!stepData?.selector) {
            setSpotlight(null)
            // Still update phone dims
            const frame = document.querySelector('[data-phone-frame]')
            if (frame) {
                setPhoneDims({ w: frame.offsetWidth, h: frame.offsetHeight })
            }
            return
        }

        const frame = document.querySelector('[data-phone-frame]')
        const el    = document.querySelector(stepData.selector)
        if (!frame) return

        setPhoneDims({ w: frame.offsetWidth, h: frame.offsetHeight })

        if (!el) { setSpotlight(null); return }

        const fr = frame.getBoundingClientRect()
        const er = el.getBoundingClientRect()

        const spotlight = {
            x: er.left - fr.left - PAD * 2,
            y: er.top  - fr.top  - PAD,
            w: er.width  + PAD * 2,
            h: er.height + PAD,
        }

        // Compensate for CSS scale of phone frame.
        let scaleStr = getComputedStyle(frame).getPropertyValue('--scale')
        if (scaleStr == null || scaleStr === '') {
            scaleStr = "1"
        }

        const scale = parseFloat(scaleStr)
        if (!isNaN(scale) && scale !== 0) {
            const scaleRecip = 1/scale
            spotlight.x *= scaleRecip
            spotlight.y *= scaleRecip
            spotlight.w *= scaleRecip
            spotlight.h *= scaleRecip
        }

        setSpotlight(spotlight)
    }, [active, step, remeasureNumber, window.innerWidth, window.innerHeight]) // eslint-disable-line

    // Fade popup temporarily to mask jumping during layout change
    const lastRoute = useRef(stepData?.route)
    useEffect(() => {
        if (tooltipRef.current == null) return
        if (stepData.route === lastRoute.current) return
        lastRoute.current = stepData.route

        const el = tooltipRef.current
        el.setAttribute('data-fade', 'out')

        const id = setTimeout(() => {
            el.setAttribute('data-fade', 'in')
        }, 500)

        return () => clearTimeout(id)
    }, [active, step, tooltipRef])

    if (!active || !stepData) return null

    return (
        <div
            aria-modal="true"
            role="dialog"
            aria-label={`Onboarding step ${step + 1} of ${total}: ${stepData.title}`}
            style={{
                position:      'absolute',
                inset:         0,
                zIndex:        1001,
                pointerEvents: 'none',
            }}
        >
            <DarkPanels sp={spotlight} phoneW={phoneDims.w} phoneH={phoneDims.h} />
            <SpotlightBorder sp={spotlight} />
            <TooltipCard
                step={step}
                stepData={stepData}
                total={total}
                sp={spotlight}
                phoneW={phoneDims.w}
                phoneH={phoneDims.h}
                onNext={next}
                onPrev={prev}
                onFinish={finish}
                className="onboarding-card"
                ref={tooltipRef}
            />
        </div>
    )
}

export default OnboardingOverlay
