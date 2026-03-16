import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Tasks from './pages/Tasks'
import BottomNav from './components/BottomNav'
import Robo from './pages/Robo'
import Calendar from './pages/Calendar'
import More from './pages/More'
import TaskCreate from './pages/TaskCreate'
import TaskDetail from './pages/TaskDetail'

function App() {
  const [theme, setTheme] = useState(() => {
    document.documentElement.setAttribute('data-theme', 'dark')
    return 'dark'
  })

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
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

        {/* theme toggle outside the phone */}
        <button
            onClick={toggleTheme}
            style={{
              color: '#888',
              marginBottom: '16px',
              fontSize: '13px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
        >
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>

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
                {/* scrollable content */}
                <div
                    className="phone-scroll"
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        paddingTop: '60px',
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none',
                    }}
                >
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/tasks/create" element={<TaskCreate />} />
                        <Route path="/tasks/:id" element={<TaskDetail />} />
                        <Route path="/tasks" element={<Tasks />} />
                        <Route path="/robo" element={<Robo />} />
                        <Route path="/calendar" element={<Calendar />} />
                        <Route path="/more" element={<More />} />
                    </Routes>
                </div>

                <BottomNav />
            </BrowserRouter>
        </div>
      </div>
  )
}

export default App