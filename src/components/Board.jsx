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
import TaskCard from './TaskCard'
import TaskModal from './TaskModal'

// Prefer column droppables over task sortables
function customCollision(args) {
  const pointerHits = pointerWithin(args)
  // Filter to only column droppables first
  const columnIds = new Set(COLUMNS.map((c) => c.id))
  const columnHits = pointerHits.filter((h) => columnIds.has(h.id))
  if (columnHits.length > 0) return columnHits
  // Fall back to rect intersection for edge cases
  return rectIntersection(args)
}

const COLUMNS = [
  { id: 'research', label: 'Research' },
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
]

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

function DroppableColumn({ id, label, tasks, onTaskClick }) {
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
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

export default function Board() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTask, setActiveTask] = useState(null)
  const [modalTask, setModalTask] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  // Load tasks
  useEffect(() => {
    if (!supabase) {
      setTasks(DEFAULT_TASKS)
      setLoading(false)
      return
    }

    async function fetchTasks() {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('position', { ascending: true })

      if (error) {
        console.error('Error fetching tasks:', error)
        setTasks(DEFAULT_TASKS)
      } else {
        setTasks(data.length > 0 ? data : DEFAULT_TASKS)
      }
      setLoading(false)
    }

    fetchTasks()

    // Real-time subscription
    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setTasks((prev) =>
            prev.map((t) => (t.id === payload.new.id ? payload.new : t))
          )
        } else if (payload.eventType === 'INSERT') {
          setTasks((prev) => [...prev, payload.new])
        } else if (payload.eventType === 'DELETE') {
          setTasks((prev) => prev.filter((t) => t.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  function getColumnTasks(columnId) {
    return tasks.filter((t) => t.status === columnId)
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
    // Determine the target column: if dropped on a column, use its id; if dropped on a task, use that task's status
    let newStatus = over.id
    if (!COLUMNS.find((c) => c.id === over.id)) {
      const overTask = tasks.find((t) => t.id === over.id)
      if (overTask) newStatus = overTask.status
      else return
    }

    const task = tasks.find((t) => t.id === taskId)
    if (!task || task.status === newStatus) return

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    )

    // Persist to Supabase
    if (supabase) {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', taskId)

      if (error) {
        console.error('Error updating task:', error)
        // Revert on error
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

  if (loading) {
    return <div className="loading">Loading tasks...</div>
  }

  return (
    <div className="board-page">
      <div className="board-header">
        <h1>Sprint 0 — Task Board</h1>
        <p>Drag tasks between columns. Changes sync in real-time.{!supabase && ' (Demo mode — connect Supabase for persistence)'}</p>
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
        />
      )}
    </div>
  )
}
