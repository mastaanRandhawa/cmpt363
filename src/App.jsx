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

const themes = [
    { value: 'lavender', label: 'Lavender Mist' },
    { value: 'ocean',    label: 'Midnight Ocean' },
    { value: 'arctic',   label: 'Arctic Dusk' },
    { value: 'matcha',   label: 'Matcha Latte' },
]

function App() {
    const [theme, setTheme] = useState(() => {
        document.documentElement.setAttribute('data-theme', 'lavender')
        return 'lavender'
    })

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

            {/* theme picker */}
            <select
                value={theme}
                onChange={e => handleTheme(e.target.value)}
                style={{
                    marginBottom: '16px',
                    background: '#1a1a1a',
                    color: '#888',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    outline: 'none',
                }}
            >
                {themes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                ))}
            </select>

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
                    <BottomNav />
                </BrowserRouter>

            </div>
        </div>
    )
}

export default App