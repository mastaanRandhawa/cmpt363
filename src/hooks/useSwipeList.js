// useSwipeList
// Coordinates swipe state across a list of TaskCards so only one card can be
// swiped open at a time. When a new card is swiped, the previously open card
// automatically snaps closed.
//
// Returns:
//   getSwipeProps(id) – call for each card, returns { swipeX, onSwipeChange }
//   closeAll()        – programmatically snap all cards closed (e.g. on navigation)
//
// Usage in Tasks.jsx:
//   const { getSwipeProps } = useSwipeList()
//
//   tasks.map(task => (
//     <TaskCard
//       key={task.id}
//       {...task}
//       {...getSwipeProps(task.id)}
//       onDelete={() => handleDelete(task.id)}
//       onEdit={() => navigate(`/tasks/${task.id}/edit`)}
//       onClick={() => navigate(`/tasks/${task.id}`)}
//     />
//   ))

import { useState, useCallback } from 'react'

function useSwipeList() {
    const [activeId, setActiveId] = useState(null)
    const [swipeX, setSwipeX]     = useState(0)

    const getSwipeProps = useCallback((id) => ({
        swipeX: activeId === id ? swipeX : 0,
        onSwipeChange: (x) => {
            setActiveId(id)
            setSwipeX(x)
        },
    }), [activeId, swipeX])

    const closeAll = useCallback(() => {
        setActiveId(null)
        setSwipeX(0)
    }, [])

    return { getSwipeProps, closeAll }
}

export default useSwipeList