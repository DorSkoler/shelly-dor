import { useState } from 'react'
import { supabase } from '../lib/supabase'

const assigneeLabel = { dor: 'Dor', shelly: 'Shelly', both: 'Both' }
const assigneeClass = { dor: 'dor', shelly: 'shelly', both: 'both' }
const statusLabel = { research: 'Research', todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' }

export default function TaskModal({ task, onClose, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [status, setStatus] = useState(task.status)
  const [assignee, setAssignee] = useState(task.assignee)
  const [links, setLinks] = useState(task.links || [])
  const [newLinkUrl, setNewLinkUrl] = useState('')
  const [newLinkLabel, setNewLinkLabel] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleSave() {
    setSaving(true)
    const updates = {
      title,
      description,
      status,
      assignee,
      links,
      updated_at: new Date().toISOString(),
    }

    if (supabase) {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', task.id)

      if (error) {
        console.error('Error updating task:', error)
        setSaving(false)
        return
      }
    }

    onUpdate({ ...task, ...updates })
    setEditing(false)
    setSaving(false)
  }

  function handleCancel() {
    setTitle(task.title)
    setDescription(task.description || '')
    setStatus(task.status)
    setAssignee(task.assignee)
    setLinks(task.links || [])
    setEditing(false)
  }

  function handleAddLink() {
    const url = newLinkUrl.trim()
    if (!url) return
    const label = newLinkLabel.trim() || guessLabel(url)
    setLinks((prev) => [...prev, { url, label }])
    setNewLinkUrl('')
    setNewLinkLabel('')
  }

  function handleRemoveLink(index) {
    setLinks((prev) => prev.filter((_, i) => i !== index))
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    onDelete(task.id)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal glass" onClick={(e) => e.stopPropagation()}>
        <div className="modal-top-bar">
          <span className="modal-task-id">{task.task_id}</span>
          <button className="modal-close" onClick={onClose}>&#x2715;</button>
        </div>

        {editing ? (
          <>
            <input
              className="modal-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
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
              rows={6}
              placeholder="Add a description..."
            />

            <div className="modal-links-section">
              <label className="modal-desc-label">Links</label>
              {links.map((link, i) => (
                <div key={i} className="link-edit-row">
                  <span className="link-icon">{getLinkIcon(link.url)}</span>
                  <span className="link-edit-label">{link.label}</span>
                  <span className="link-edit-url">{link.url}</span>
                  <button className="link-remove" onClick={() => handleRemoveLink(i)}>&#x2715;</button>
                </div>
              ))}
              <div className="link-add-row">
                <input
                  className="link-input"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  placeholder="https://..."
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLink())}
                />
                <input
                  className="link-input link-input-label"
                  value={newLinkLabel}
                  onChange={(e) => setNewLinkLabel(e.target.value)}
                  placeholder="Label (optional)"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLink())}
                />
                <button className="link-add-btn" onClick={handleAddLink}>Add</button>
              </div>
            </div>

            <div className="modal-actions">
              <button className="modal-save" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button className="modal-cancel" onClick={handleCancel}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            <h2 className="modal-title">{task.title}</h2>
            <div className="modal-meta">
              <span className={`ap ${assigneeClass[task.assignee] || ''}`}>
                {assigneeLabel[task.assignee] || task.assignee}
              </span>
              <span className="modal-status">{statusLabel[task.status] || task.status}</span>
            </div>
            <div className="modal-section">
              <h4>Description</h4>
              <p className="modal-desc">
                {task.description || 'No description yet.'}
              </p>
            </div>

            {links.length > 0 && (
              <div className="modal-section">
                <h4>Links</h4>
                <div className="link-list">
                  {links.map((link, i) => (
                    <a key={i} className="link-item" href={link.url} target="_blank" rel="noopener noreferrer">
                      <span className="link-icon">{getLinkIcon(link.url)}</span>
                      <span className="link-label">{link.label}</span>
                      <span className="link-arrow">&#x2197;</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {task.created_at && (
              <div className="modal-timestamps">
                Created {new Date(task.created_at).toLocaleDateString()}
                {task.updated_at && task.updated_at !== task.created_at && (
                  <> &middot; Updated {new Date(task.updated_at).toLocaleDateString()}</>
                )}
              </div>
            )}
            <div className="modal-actions">
              <button className="modal-edit" onClick={() => setEditing(true)}>Edit</button>
              <button
                className="modal-delete"
                onClick={handleDelete}
              >
                {confirmDelete ? 'Confirm Delete' : 'Delete'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function getLinkIcon(url) {
  if (url.includes('github.com')) return '\uD83D\uDCBB'
  if (url.includes('docs.google.com')) return '\uD83D\uDCC4'
  if (url.includes('figma.com')) return '\uD83C\uDFA8'
  if (url.includes('notion.so') || url.includes('notion.site')) return '\uD83D\uDCD3'
  if (url.includes('drive.google.com')) return '\uD83D\uDCC1'
  return '\uD83D\uDD17'
}

function guessLabel(url) {
  try {
    const u = new URL(url)
    if (u.hostname.includes('github.com')) {
      const parts = u.pathname.split('/').filter(Boolean)
      return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : 'GitHub'
    }
    if (u.hostname.includes('docs.google.com')) return 'Google Doc'
    if (u.hostname.includes('drive.google.com')) return 'Google Drive'
    if (u.hostname.includes('figma.com')) return 'Figma'
    if (u.hostname.includes('notion')) return 'Notion'
    return u.hostname.replace('www.', '')
  } catch {
    return url
  }
}
