// taskBreakdown.js
// Calls the backend AI breakdown endpoint and returns subtasks.

import useAIStore from './useAIStore'
import { api } from './api'

export async function generateSubtasks(task, instructions) {
    const { setLoading, setSuccess, setError } = useAIStore.getState()
    setLoading(`breakdown: ${task.name}`)

    try {
        const { subtasks } = await api.breakdown(task, instructions)
        setSuccess(JSON.stringify(subtasks, null, 2), subtasks)
        return subtasks
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        setError(msg)
        throw err
    }
}
