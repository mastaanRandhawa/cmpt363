import Button from '../components/Button'
import Chip from '../components/Chip'
import Toggle from '../components/Toggle'
import TaskCard from '../components/TaskCard'

function Home() {
    return (
        <div className="page flex flex-col gap-4 p-6 min-h-screen">
            <div className="flex gap-2">
                <Chip label="PRD" color="primary" />
                <Chip label="DESIGN" color="accent" />
                <Chip label="URGENT" color="danger" />
                <Chip label="DONE" color="success" />
            </div>
            <Toggle label="AI Assistant" defaultOn={true} />
            <Toggle label="Notifications" defaultOn={false} />
            <TaskCard
                title="Study for CMPT363 Midterm"
                due="Tue 7th · Jan 2025"
                priority="high"
                tags={[
                    { label: 'STUDY', color: 'primary' },
                    { label: 'URGENT', color: 'danger' },
                ]}
            />
            <TaskCard
                title="Grocery Shopping"
                due="Tue 7th · Jan 2025"
                priority="med"
                tags={[
                    { label: 'PERSONAL', color: 'success' },
                ]}
            />
            <Button label="Start Task" variant="primary" />
            <Button label="Dismiss" variant="secondary" />
            <Button label="Delete Task" variant="destructive" />
            <Button label="Breakdown" variant="outline" />
        </div>
    )
}

export default Home