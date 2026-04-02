import { useNavigate } from 'react-router-dom'
import useOnboardingStore from '../data/useOnboardingStore'
import Header from '../components/Header'

function Help() {
    const navigate = useNavigate()

    function handleStartTour() {
        navigate('/')
        setTimeout(() => useOnboardingStore.getState().start(), 150)
    }

    return (
        <div style={{ color: 'var(--color-text-main)', paddingBottom: '24px' }}>
            <Header title="Help" onBack={() => navigate(-1)} />

            <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* App Tour card */}
                <div style={{
                    background:   'var(--color-card)',
                    border:       '1px solid var(--color-divider)',
                    borderRadius: '20px',
                    padding:      '20px',
                }}>
                    <h2 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                        App Tour
                    </h2>
                    <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.55 }}>
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
                        Take the Tour
                    </button>
                </div>

            </div>
        </div>
    )
}

export default Help