// useAIStore
// Tracks the state of AI API calls for debugging and UI feedback.
// Not persisted — resets on page refresh.

import { create } from 'zustand'

const useAIStore = create((set) => ({
    status:       'idle',   // 'idle' | 'loading' | 'success' | 'error'
    lastPrompt:   null,     // string — the full prompt sent to the API
    lastResponse: null,     // string — raw text response from the API
    lastParsed:   null,     // array — parsed subtasks
    error:        null,     // string — error message if failed

    setLoading: (prompt) => set({
        status: 'loading',
        lastPrompt: prompt,
        lastResponse: null,
        lastParsed: null,
        error: null,
    }),

    setSuccess: (response, parsed) => set({
        status:       'success',
        lastResponse: response,
        lastParsed:   parsed,
        error:        null,
    }),

    setError: (error) => set({
        status: 'error',
        error,
    }),

    reset: () => set({
        status: 'idle',
        lastPrompt: null,
        lastResponse: null,
        lastParsed: null,
        error: null,
    }),
}))

export default useAIStore