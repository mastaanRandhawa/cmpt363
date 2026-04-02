import { useState } from "react"
import { useNavigate } from 'react-router-dom'
import useOnboardingStore from '../data/useOnboardingStore'
import Header from "../components/Header"

const resetButtonStates = [
    { background: 'var(--color-important)', color: '#FFFFFF',                    border: 'none',                                  label: 'Reset Demo' },
    { background: 'transparent',            color: 'var(--color-important)',      border: '1px solid var(--color-important)',       label: 'Are you sure?' },
    { background: 'var(--color-important)', color: '#FFFFFF',                    border: 'none',                                  label: 'Are you REALLY sure?' },
    { background: 'var(--color-primary-soft)', color: 'var(--color-text-main)', border: 'none',                                  label: 'Reset Completed!' },
]

function Help() {
    const navigate = useNavigate()
    const [resetButtonStateIndex, setResetButtonStateIndex] = useState(0)
    const resetButtonCurrentState = resetButtonStates[resetButtonStateIndex]

    function handleStartTour() {
        navigate('/')
        setTimeout(() => useOnboardingStore.getState().start(), 150)
    }

    function doReset() {
        console.error("Unimplemented")
    }

    function onResetClick() {
        const stateNumLastChance = resetButtonStates.length - 2
        const stateNumAfterReset = resetButtonStates.length - 1

        if (resetButtonStateIndex >= stateNumAfterReset) return

        if (resetButtonStateIndex === stateNumLastChance) {
            doReset()
            setResetButtonStateIndex(stateNumAfterReset)
            return
        }

        setResetButtonStateIndex(resetButtonStateIndex + 1)
    }

    const cardStyle = {
        background:   'var(--color-card)',
        border:       '1px solid var(--color-divider)',
        borderRadius: '20px',
        padding:      '20px',
    }

    const titleStyle = {
        margin:     '0 0 6px',
        fontSize:   '16px',
        fontWeight: 800,
        color:      'var(--color-text-main)',
    }

    const descStyle = {
        margin:     '0 0 16px',
        fontSize:   '13px',
        color:      'var(--color-text-muted)',
        lineHeight: 1.55,
    }

    return (
        <div style={{ color: 'var(--color-text-main)', paddingBottom: 'calc(var(--bottom-nav-height, 80px) + 24px)' }}>
            <Header title="Help" onBack={() => navigate(-1)} />

            <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* App Tour card */}
                <div style={cardStyle}>
                    <h2 style={titleStyle}>App Tour</h2>
                    <p style={descStyle}>
                        New here? Take a guided walkthrough of RoboPlan to learn where everything lives.
                    </p>
                    <button
                        onClick={handleStartTour}
                        style={{
                            width:         '100%',
                            padding:       '12px',
                            background:    'var(--color-primary)',
                            border:        'none',
                            borderRadius:  '14px',
                            color:         'white',
                            fontSize:      '14px',
                            fontWeight:    700,
                            cursor:        'pointer',
                            letterSpacing: '0.02em',
                        }}
                    >
                        Launch Onboarding
                    </button>
                </div>

                {/* Reset Demo card */}
                <div style={cardStyle}>
                    <h2 style={titleStyle}>Reset Demo</h2>
                    <p style={descStyle}>
                        This demo comes with pre-populated tasks and data. Would you like to restore the original demo data?
                    </p>
                    <button
                        onClick={onResetClick}
                        style={{
                            width:         '100%',
                            padding:       '12px',
                            background:    resetButtonCurrentState.background,
                            border:        resetButtonCurrentState.border,
                            borderRadius:  '14px',
                            color:         resetButtonCurrentState.color,
                            fontSize:      '14px',
                            fontWeight:    700,
                            cursor:        'pointer',
                            letterSpacing: '0.02em',
                        }}
                    >
                        {resetButtonCurrentState.label}
                    </button>
                </div>

                {/* Documentation card */}
                <div style={cardStyle}>
                    <h2 style={titleStyle}>Documentation</h2>
                    <p style={descStyle}>
                        Would you like to visit the online help page? This will open in your default browser.
                    </p>
                    <button
                        style={{
                            width:         '100%',
                            padding:       '12px',
                            background:    'transparent',
                            border:        '1px solid var(--color-divider)',
                            borderRadius:  '14px',
                            color:         'var(--color-text-mid)',
                            fontSize:      '14px',
                            fontWeight:    700,
                            cursor:        'not-allowed',
                            letterSpacing: '0.02em',
                        }}
                    >
                        View Documentation
                    </button>
                </div>

            </div>
        </div>
    )
}

export default Help
