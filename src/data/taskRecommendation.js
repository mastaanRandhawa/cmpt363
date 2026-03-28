// taskRecommendation.js
// Calls the backend recommendation endpoint with live task + mood + streak data.

import { api } from './api'

export async function getRecommendedTask({ tasks, moodIndex, streak }) {
    try {
        const result = await api.recommend({ tasks, moodIndex, streak })
        return result  // { taskId, reason } or null
    } catch {
        return null
    }
}
