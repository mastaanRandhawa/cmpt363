// taskRecommendation.js
// Calls the backend recommendation endpoint with live task + mood + streak data.

import { api } from './api'

export async function getRecommendedTask({ tasks, moodIndex, streak, personalities = [] }) {
    try {
        const result = await api.recommend({ tasks, moodIndex, streak, personalities })
        return result  // { taskId, reason } or null
    } catch {
        return null
    }
}
