import { useState, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { supabase } from '../lib/supabase'
import { getCached, setCache } from '../lib/cache'
import TaskCard from './TaskCard'
import TaskModal from './TaskModal'

const COLUMNS = [
  { id: 'research', label: 'Research' },
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
]

// Prefer column droppables over task sortables
function customCollision(args) {
  const pointerHits = pointerWithin(args)
  const columnIds = new Set(COLUMNS.map((c) => c.id))
  const columnHits = pointerHits.filter((h) => columnIds.has(h.id))
  if (columnHits.length > 0) return columnHits
  return rectIntersection(args)
}

const DEFAULT_TASKS = [
  { id: '1', task_id: 'SEC-001', title: 'Read MCP Specification & SDK Docs', description: 'Go through modelcontextprotocol.io. Understand server lifecycle, tool definitions, transports, client discovery.', assignee: 'dor', status: 'research' },
  { id: '2', task_id: 'SEC-002', title: 'Study 3 Existing MCP Servers', description: 'Pick 3 well-built servers from GitHub. Note patterns for tool defs, error handling, output formatting.', assignee: 'dor', status: 'research' },
  { id: '3', task_id: 'SEC-003', title: 'Build "Hello World" MCP Server', description: 'Minimal server with one tool. Register in Claude Code. Verify AI can call it.', assignee: 'dor', status: 'todo' },
  { id: '4', task_id: 'SEC-004', title: 'TypeScript vs Python Decision', description: 'Compare SDKs — maturity, CLI wrapping ease, packaging. Security tools are mostly Python/Go.', assignee: 'both', status: 'research' },
  { id: '5', task_id: 'SEC-005', title: 'Design Monorepo Structure', description: 'Create GitHub repo. Workspace config, shared utils, per-server dirs, CI pipeline, README template.', assignee: 'dor', status: 'todo' },
  { id: '6', task_id: 'SEC-006', title: 'Research & Select Recon Tools', description: 'Investigate Subfinder, httpx, Amass, Nmap, Wappalyzer. Check JSON output, install ease, speed, licenses.', assignee: 'both', status: 'research' },
  { id: '7', task_id: 'SEC-007', title: 'Design Fuzzer Payload Strategy', description: 'Per vuln class: top 20–50 payloads, detection logic, testing order. Document as JSON/YAML config.', assignee: 'shelly', status: 'research' },
  { id: '8', task_id: 'SEC-008', title: 'Detection Logic per Vulnerability', description: 'How to programmatically confirm a vuln. Per type: what to check in the HTTP response.', assignee: 'shelly', status: 'research' },
  { id: '9', task_id: 'SEC-009', title: 'Build vs Wrap: Web Fuzzer', description: 'Custom Python fuzzer (more control) or wrap ffuf/wfuzz (faster)? Evaluate pros/cons.', assignee: 'both', status: 'research' },
  { id: '10', task_id: 'SEC-010', title: 'Nuclei Deep Dive', description: 'Install Nuclei. Run against test target. Study JSON output. Browse templates.', assignee: 'shelly', status: 'research' },
  { id: '11', task_id: 'SEC-011', title: 'Build Vulnerable Test App', description: 'Dockerized Flask/PHP with known vulns at documented endpoints. Becomes our regression test suite.', assignee: 'shelly', status: 'todo' },
  { id: '12', task_id: 'SEC-012', title: 'LLM-Friendly Output Schema', description: 'Standard JSON for all tools. Fields: severity, type, url, evidence, confidence, next_steps.', assignee: 'both', status: 'todo' },
  { id: '13', task_id: 'SEC-013', title: 'MCP Cross-Training for Shelly', description: 'Run Dor\'s hello-world server, read MCP overview, practice writing tool descriptions.', assignee: 'shelly', status: 'todo' },
  { id: '14', task_id: 'SEC-014', title: 'Ethical & Legal Guidelines', description: 'Write USAGE.md with disclaimers. Consider --confirm flag or target allowlist.', assignee: 'both', status: 'todo' },
]

function DroppableColumn({ id, label, tasks, onTaskClick, allTasks }) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`board-column${isOver ? ' drag-over' : ''}`}
    >
      <div className="column-header">
        <span className="column-title">{label}</span>
        <span className="column-count">{tasks.length}</span>
      </div>
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="task-list">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} allTasks={allTasks} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

function getNextTaskId(tasks) {
  let max = 0
  for (const t of tasks) {
    const match = t.task_id?.match(/SEC-(\d+)/)
    if (match) {
      const num = parseInt(match[1], 10)
      if (num > max) max = num
    }
  }
  return `SEC-${String(max + 1).padStart(3, '0')}`
}

export default function Board() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTask, setActiveTask] = useState(null)
  const [modalTask, setModalTask] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [filter, setFilter] = useState('all')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  useEffect(() => {
    if (!supabase) {
      setTasks(DEFAULT_TASKS)
      setLoading(false)
      return
    }

    // Load from cache instantly, then refresh in background
    const cached = getCached('tasks')
    if (cached && cached.length > 0) {
      setTasks(cached)
      setLoading(false)
    }

    async function fetchTasks() {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('position', { ascending: true })

      if (error) {
        console.error('Error fetching tasks:', error)
        if (!cached) setTasks(DEFAULT_TASKS)
      } else {
        const result = data.length > 0 ? data : DEFAULT_TASKS
        setTasks(result)
        setCache('tasks', result)
      }
      setLoading(false)
    }

    fetchTasks()

    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setTasks((prev) =>
            prev.map((t) => (t.id === payload.new.id ? payload.new : t))
          )
        } else if (payload.eventType === 'INSERT') {
          setTasks((prev) => {
            if (prev.find((t) => t.id === payload.new.id)) return prev
            return [...prev, payload.new]
          })
        } else if (payload.eventType === 'DELETE') {
          setTasks((prev) => prev.filter((t) => t.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Keep cache in sync
  useEffect(() => {
    if (tasks.length > 0 && tasks[0].id !== '1') {
      setCache('tasks', tasks)
    }
  }, [tasks])

  function getColumnTasks(columnId) {
    return tasks.filter((t) => {
      if (t.status !== columnId) return false
      if (filter === 'all') return true
      if (filter === 'dor') return t.assignee === 'dor' || t.assignee === 'both'
      if (filter === 'shelly') return t.assignee === 'shelly' || t.assignee === 'both'
      return true
    })
  }

  function handleDragStart(event) {
    const task = tasks.find((t) => t.id === event.active.id)
    setActiveTask(task || null)
  }

  async function handleDragEnd(event) {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const taskId = active.id
    let newStatus = over.id
    if (!COLUMNS.find((c) => c.id === over.id)) {
      const overTask = tasks.find((t) => t.id === over.id)
      if (overTask) newStatus = overTask.status
      else return
    }

    const task = tasks.find((t) => t.id === taskId)
    if (!task || task.status === newStatus) return

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    )

    if (supabase) {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', taskId)

      if (error) {
        console.error('Error updating task:', error)
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: task.status } : t))
        )
      }
    }
  }

  function handleTaskClick(task) {
    setModalTask(task)
  }

  function handleModalUpdate(updatedTask) {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    )
    setModalTask(updatedTask)
  }

  async function handleAddTask(newTask) {
    const taskId = getNextTaskId(tasks)
    const position = tasks.length + 1
    const task = {
      task_id: taskId,
      title: newTask.title,
      description: newTask.description || '',
      assignee: newTask.assignee,
      status: newTask.status,
      position,
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single()

      if (error) {
        console.error('Error adding task:', error)
        return
      }
      setTasks((prev) => [...prev, data])
    } else {
      setTasks((prev) => [...prev, { ...task, id: String(prev.length + 1) }])
    }
    setShowAddForm(false)
  }

  async function handleDeleteTask(taskId) {
    if (supabase) {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) {
        console.error('Error deleting task:', error)
        return
      }
    }
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    setModalTask(null)
  }

  if (loading) {
    return <div className="loading">Loading tasks...</div>
  }

  return (
    <div className="board-page">
      <div className="board-header">
        <h1>Sprint 0 — Task Board</h1>
        <p>Drag tasks between columns. Changes sync in real-time.{!supabase && ' (Demo mode — connect Supabase for persistence)'}</p>
      </div>
      <div className="board-toolbar">
        <div className="filter-group">
          <button className={`filter-btn${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>All</button>
          <button className={`filter-btn filter-dor${filter === 'dor' ? ' active' : ''}`} onClick={() => setFilter('dor')}>Dor</button>
          <button className={`filter-btn filter-shelly${filter === 'shelly' ? ' active' : ''}`} onClick={() => setFilter('shelly')}>Shelly</button>
        </div>
        <button className="add-task-btn" onClick={() => setShowAddForm(true)}>
          <span>+</span> New Task
        </button>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={customCollision}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="board">
          {COLUMNS.map((col) => (
            <DroppableColumn
              key={col.id}
              id={col.id}
              label={col.label}
              tasks={getColumnTasks(col.id)}
              onTaskClick={handleTaskClick}
              allTasks={tasks}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
      {modalTask && (
        <TaskModal
          task={modalTask}
          onClose={() => setModalTask(null)}
          onUpdate={handleModalUpdate}
          onDelete={handleDeleteTask}
          allTasks={tasks}
        />
      )}
      {showAddForm && (
        <AddTaskModal
          nextId={getNextTaskId(tasks)}
          onClose={() => setShowAddForm(false)}
          onAdd={handleAddTask}
        />
      )}
    </div>
  )
}

function AddTaskModal({ nextId, onClose, onAdd }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignee, setAssignee] = useState('dor')
  const [status, setStatus] = useState('todo')

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({ title: title.trim(), description: description.trim(), assignee, status })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal glass" onClick={(e) => e.stopPropagation()}>
        <div className="modal-top-bar">
          <span className="modal-task-id">{nextId}</span>
          <button className="modal-close" onClick={onClose}>&#x2715;</button>
        </div>
        <h2 className="modal-title" style={{ marginBottom: '1rem' }}>New Task</h2>
        <form onSubmit={handleSubmit}>
          <div className="modal-field" style={{ marginBottom: '0.75rem' }}>
            <label>Title</label>
            <input
              className="modal-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title..."
              autoFocus
            />
          </div>
          <div className="modal-fields">
            <div className="modal-field">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="research">Research</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="modal-field">
              <label>Assignee</label>
              <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                <option value="dor">Dor</option>
                <option value="shelly">Shelly</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
          <label className="modal-desc-label">Description</label>
          <textarea
            className="modal-desc-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe the task..."
          />
          <div className="modal-actions">
            <button type="submit" className="modal-save">Create Task</button>
            <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
