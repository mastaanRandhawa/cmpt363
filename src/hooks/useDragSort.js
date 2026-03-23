// useDragSort
// Hook that adds drag-to-reorder behaviour to a list rendered with map().
// Uses the HTML5 drag-and-drop API — no extra dependencies.
//
// Usage:
//   const { items, getDragProps, dragOverIndex } = useDragSort(subtasks, setSubtasks)
//
//   {items.map((item, i) => (
//     <div key={item.id} {...getDragProps(i)} style={{ opacity: dragOverIndex === i ? 0.4 : 1 }}>
//       <GripVertical {...getDragHandleProps()} />   ← optional handle
//       {item.label}
//     </div>
//   ))}
//
// getDragProps(index) — spread onto each row div
// dragOverIndex      — index of the row currently being dragged over (for visual feedback)

import { useRef, useState } from 'react'

export default function useDragSort(items, setItems) {
    const dragIndex  = useRef(null)
    const [dragOverIndex, setDragOverIndex] = useState(null)

    function getDragProps(index) {
        return {
            draggable: true,
            onDragStart: (e) => {
                dragIndex.current = index
                e.dataTransfer.effectAllowed = 'move'
                // Needed on some browsers to allow drag to start
                e.dataTransfer.setData('text/plain', index)
            },
            onDragOver: (e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
                if (dragOverIndex !== index) setDragOverIndex(index)
            },
            onDragEnter: (e) => {
                e.preventDefault()
                setDragOverIndex(index)
            },
            onDragLeave: () => {
                // Only clear if leaving to outside the list entirely
                // (child elements trigger this too, so we leave it to onDrop to clean up)
            },
            onDrop: (e) => {
                e.preventDefault()
                const from = dragIndex.current
                const to   = index
                if (from === null || from === to) { setDragOverIndex(null); return }

                const next = [...items]
                const [moved] = next.splice(from, 1)
                next.splice(to, 0, moved)
                setItems(next)

                dragIndex.current = null
                setDragOverIndex(null)
            },
            onDragEnd: () => {
                dragIndex.current = null
                setDragOverIndex(null)
            },
        }
    }

    return { items, getDragProps, dragOverIndex }
}