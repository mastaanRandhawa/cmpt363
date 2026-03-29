// useSwipeDelete
// Encapsulates the swipe-to-delete flow: pending confirmation state, toast with
// undo, and the ConfirmDialog element to render.
//
// Usage:
//   const { handleSwipeDelete, confirmDialog } = useSwipeDelete({ closeAll })
//
//   <TaskCard onDelete={() => handleSwipeDelete(task)} ... />
//   {confirmDialog}

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import ConfirmDialog from '../components/ConfirmDialog'
import useTaskStore from '../data/useTaskStore'
import useToastStore from '../data/useToastStore'

function useSwipeDelete({ closeAll }) {
    const { softDeleteTask, cancelSoftDelete, deleteTask } = useTaskStore()
    const { show: showToast, dismiss: dismissToast } = useToastStore()
    const [pendingTask, setPendingTask]              = useState(null)

    function confirm() {
        const task = pendingTask
        setPendingTask(null)
        showToast({
            message:     `"${task.name}" deleted`,
            icon:        <Trash2 size={16} color="var(--color-danger)" />,
            barColor:    'var(--color-danger)',
            actionLabel: 'Undo',
            onAction:    () => dismissToast(),
            onExpire:    () => deleteTask(task.id),
            duration:    5000,
        })
    }

    const confirmDialog = pendingTask ? (
        <ConfirmDialog
            icon={<Trash2 size={24} color="var(--color-danger)" />}
            title="DELETE TASK?"
            message={`"${pendingTask.name}" will be permanently removed.`}
            confirmLabel="Delete Task"
            confirmVariant="danger"
            onConfirm={confirm}
            onCancel={() => setPendingTask(null)}
        />
    ) : null

    function handleSwipeDelete(task) {
        closeAll?.()
        softDeleteTask(task.id)

        showToast({
            message:     `"${task.name}" deleted`,
            icon:        <Trash2 size={16} color="var(--color-danger)" />,
            barColor:    'var(--color-danger)',
            actionLabel: 'Undo',
            onAction: () => {
                cancelSoftDelete(task.id)
                dismissToast()
            },
            onExpire: () => deleteTask(task.id),
            duration: 5000,
        })
    }

    return { handleSwipeDelete }
}

export default useSwipeDelete