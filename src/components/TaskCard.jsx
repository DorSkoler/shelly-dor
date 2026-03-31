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

export default function TaskCard({ task }) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card${isDragging ? ' dragging' : ''}`}
      {...attributes}
      {...listeners}
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
