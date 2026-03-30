import { useNavigate, useLocation } from 'react-router-dom'
import Header from '../components/Header'

function Timer() {
    const navigate = useNavigate()
    const location = useLocation()
    const task = location.state?.task

    return (
        <div className="flex flex-col pb-24" style={{ color: 'var(--colour-text-main)' }}>
            <Header
                subtitle="FOCUS MODE"
                title={task?.name || 'Task'}
                onBack={() => navigate(-1)}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, marginTop: '120px' }}>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Timer coming soon</p>
            </div>
        </div>
    )
}

export default Timer