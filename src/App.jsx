import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Tasks from './pages/Tasks'
import TaskDetail from './pages/TaskDetail'
import TaskCreate from './pages/TaskCreate'
import Robo from './pages/Robo'
import Calendar from './pages/Calendar'
import More from './pages/More'
import BottomNav from './components/BottomNav'
import Timer from './pages/Timer'
import Toast from './components/Toast'
import useToastStore from './data/useToastStore'
import useTaskStore from './data/useTaskStore'
import DebugPanel from './components/DebugPanel'

const themes = [
    { value: 'lavender', label: 'Lavender Mist' },
    { value: 'ocean',    label: 'Midnight Ocean' },
    { value: 'arctic',   label: 'Arctic Dusk' },
    { value: 'matcha',   label: 'Matcha Latte' },
]

const devControlStyle = {
    background: '#1a1a1a',
    color: '#888',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '13px',
    cursor: 'pointer',
    outline: 'none',
}

function App() {
    const [theme, setTheme] = useState(() => {
        document.documentElement.setAttribute('data-theme', 'lavender')
        return 'lavender'
    })
    const toast       = useToastStore(s => s.toast)
    const resetToSeed = useTaskStore(s => s.resetToSeed)

    function handleTheme(value) {
        setTheme(value)
        document.documentElement.setAttribute('data-theme', value)
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0a0a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 0',
        }}>

            {/* dev controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <select
                    value={theme}
                    onChange={e => handleTheme(e.target.value)}
                    style={devControlStyle}
                >
                    {themes.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                </select>

                <button onClick={resetToSeed} style={devControlStyle}>
                    ↺ Reset Tasks
                </button>
            </div>

            {/* phone + debug panel side by side */}
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

                {/* iPhone frame */}
                <div style={{
                    width: '440px',
                    height: '956px',
                    background: 'var(--color-bg)',
                    borderRadius: '56px',
                    border: '8px solid #2a2a2a',
                    boxShadow: '0 0 0 1px #444, 0 32px 80px rgba(0,0,0,0.6)',
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                }}>

                    {/* Dynamic Island */}
                    <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '126px',
                        height: '36px',
                        background: '#0a0a0a',
                        borderRadius: '20px',
                        zIndex: 10,
                    }} />

                    <BrowserRouter>
                        <div
                            className="phone-scroll"
                            style={{
                                flex: 1,
                                overflowY: 'auto',
                                paddingTop: '60px',
                                paddingLeft: '8px',
                                paddingRight: '8px',
                                msOverflowStyle: 'none',
                                scrollbarWidth: 'none',
                            }}
                        >
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/tasks" element={<Tasks />} />
                                <Route path="/tasks/create" element={<TaskCreate />} />
                                <Route path="/tasks/:id" element={<TaskDetail />} />
                                <Route path="/robo" element={<Robo />} />
                                <Route path="/calendar" element={<Calendar />} />
                                <Route path="/more" element={<More />} />
                                <Route path="/timer" element={<Timer />} />
                            </Routes>
                        </div>

                        {/* Global toast — rendered above BottomNav so it persists across routes */}
                        {toast && (
                            <Toast
                                message={toast.message}
                                icon={toast.icon}
                                progress={toast.progress}
                                barColor={toast.barColor}
                                actionLabel={toast.actionLabel}
                                onAction={toast.onAction}
                            />
                        )}

                        <BottomNav />
                    </BrowserRouter>

                </div>

                <DebugPanel />

            </div>
        </div>
    )
}

export default App