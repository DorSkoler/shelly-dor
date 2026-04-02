import { useRef } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const assigneeClass = {
  dor: 'dor',
  shelly: 'shelly',
  both: 'both',
}

const assigneeLabel = {
  dor: 'Dor',
  shelly: 'Shelly',
  both: 'Both',
}

export default function TaskCard({ task, onClick }) {
  const pointerStart = useRef(null)
  const wasDragged = useRef(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const combinedListeners = listeners
    ? {
        ...listeners,
        onPointerDown: (e) => {
          pointerStart.current = { x: e.clientX, y: e.clientY }
          wasDragged.current = false
          listeners.onPointerDown(e)
        },
      }
    : {}

  function handleClick() {
    if (wasDragged.current) return
    if (!pointerStart.current) return
    if (onClick) onClick(task)
  }

  function handlePointerMove(e) {
    if (!pointerStart.current) return
    const dx = Math.abs(e.clientX - pointerStart.current.x)
    const dy = Math.abs(e.clientY - pointerStart.current.y)
    if (dx > 5 || dy > 5) {
      wasDragged.current = true
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card task-card--${task.assignee || 'both'}${isDragging ? ' dragging' : ''}`}
      {...attributes}
      {...combinedListeners}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
    >
      <div className="task-card-id">{task.task_id}</div>
      <div className="task-card-title">{task.title}</div>
      {task.description && (
        <div className="task-card-desc">{task.description}</div>
      )}
      <div className="task-card-footer">
        <span className={`ap ${assigneeClass[task.assignee] || ''}`}>
          {assigneeLabel[task.assignee] || task.assignee}
        </span>
      </div>
    </div>
  )
}
