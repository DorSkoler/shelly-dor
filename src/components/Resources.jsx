import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'design', label: 'Design' },
  { id: 'repo', label: 'Repos' },
  { id: 'doc', label: 'Docs' },
  { id: 'reference', label: 'Reference' },
  { id: 'other', label: 'Other' },
]

function detectService(url) {
  try {
    const u = new URL(url)
    const h = u.hostname
    if (h.includes('github.com')) return { service: 'GitHub', icon: '\uD83D\uDCBB', color: '#24292e', defaultCat: 'repo' }
    if (h.includes('docs.google.com/document')) return { service: 'Google Docs', icon: '\uD83D\uDCC4', color: '#4285f4', defaultCat: 'doc' }
    if (h.includes('docs.google.com/spreadsheet')) return { service: 'Google Sheets', icon: '\uD83D\uDCCA', color: '#0f9d58', defaultCat: 'doc' }
    if (h.includes('docs.google.com/presentation')) return { service: 'Google Slides', icon: '\uD83D\uDCBD', color: '#f4b400', defaultCat: 'doc' }
    if (h.includes('drive.google.com')) return { service: 'Google Drive', icon: '\uD83D\uDCC1', color: '#f4b400', defaultCat: 'doc' }
    if (h.includes('figma.com')) return { service: 'Figma', icon: '\uD83C\uDFA8', color: '#a259ff', defaultCat: 'design' }
    if (h.includes('notion.so') || h.includes('notion.site')) return { service: 'Notion', icon: '\uD83D\uDCD3', color: '#000', defaultCat: 'doc' }
    if (h.includes('miro.com')) return { service: 'Miro', icon: '\uD83D\uDDBC\uFE0F', color: '#ffd02f', defaultCat: 'design' }
    if (h.includes('confluence')) return { service: 'Confluence', icon: '\uD83D\uDCD8', color: '#0052cc', defaultCat: 'doc' }
    if (h.includes('stackoverflow.com')) return { service: 'Stack Overflow', icon: '\uD83D\uDCDA', color: '#f48024', defaultCat: 'reference' }
    if (h.includes('npmjs.com')) return { service: 'npm', icon: '\uD83D\uDCE6', color: '#cb3837', defaultCat: 'reference' }
    if (h.includes('pypi.org')) return { service: 'PyPI', icon: '\uD83D\uDC0D', color: '#3775a9', defaultCat: 'reference' }
    if (h.includes('youtube.com') || h.includes('youtu.be')) return { service: 'YouTube', icon: '\u25B6\uFE0F', color: '#ff0000', defaultCat: 'reference' }
    return { service: h.replace('www.', ''), icon: '\uD83D\uDD17', color: '#007aff', defaultCat: 'other' }
  } catch {
    return { service: 'Link', icon: '\uD83D\uDD17', color: '#007aff', defaultCat: 'other' }
  }
}

function guessTitle(url) {
  try {
    const u = new URL(url)
    const h = u.hostname
    if (h.includes('github.com')) {
      const parts = u.pathname.split('/').filter(Boolean)
      if (parts.length >= 2) return `${parts[0]}/${parts[1]}`
      return 'GitHub Repository'
    }
    if (h.includes('docs.google.com')) return 'Google Document'
    if (h.includes('drive.google.com')) return 'Google Drive File'
    if (h.includes('figma.com')) return 'Figma Design'
    if (h.includes('notion')) return 'Notion Page'
    return u.hostname.replace('www.', '')
  } catch {
    return 'Link'
  }
}

export default function Resources() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    async function fetch() {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching resources:', error)
      } else {
        setResources(data || [])
      }
      setLoading(false)
    }

    fetch()

    const channel = supabase
      .channel('resources-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'resources' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setResources((prev) => {
            if (prev.find((r) => r.id === payload.new.id)) return prev
            return [payload.new, ...prev]
          })
        } else if (payload.eventType === 'UPDATE') {
          setResources((prev) => prev.map((r) => r.id === payload.new.id ? payload.new : r))
        } else if (payload.eventType === 'DELETE') {
          setResources((prev) => prev.filter((r) => r.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  async function handleAdd(resource) {
    if (!supabase) return
    const { data, error } = await supabase
      .from('resources')
      .insert(resource)
      .select()
      .single()

    if (error) {
      console.error('Error adding resource:', error)
      return
    }
    setResources((prev) => [data, ...prev])
    setShowAdd(false)
  }

  async function handleDelete(id) {
    if (!supabase) return
    const { error } = await supabase.from('resources').delete().eq('id', id)
    if (error) {
      console.error('Error deleting resource:', error)
      return
    }
    setResources((prev) => prev.filter((r) => r.id !== id))
  }

  const filtered = filter === 'all' ? resources : resources.filter((r) => r.category === filter)

  if (loading) return <div className="loading">Loading resources...</div>

  return (
    <div className="resources-page">
      <div className="board-header">
        <h1>Resources</h1>
        <p>Shared docs, repos, and references for the project</p>
      </div>
      <div className="board-toolbar">
        <div className="filter-group">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`filter-btn${filter === cat.id ? ' active' : ''}`}
              onClick={() => setFilter(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <button className="add-task-btn" onClick={() => setShowAdd(true)}>
          <span>+</span> Add Resource
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="resources-empty">
          <p>No resources yet. Add your first one!</p>
        </div>
      ) : (
        <div className="resources-grid">
          {filtered.map((r) => {
            const info = detectService(r.url)
            return (
              <a
                key={r.id}
                className="resource-card glass"
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="resource-card-icon" style={{ background: info.color + '15', color: info.color }}>
                  <span>{info.icon}</span>
                </div>
                <div className="resource-card-body">
                  <div className="resource-card-service">{info.service}</div>
                  <div className="resource-card-title">{r.title}</div>
                  {r.description && <div className="resource-card-desc">{r.description}</div>}
                </div>
                <button
                  className="resource-card-delete"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(r.id) }}
                  title="Remove"
                >
                  &#x2715;
                </button>
              </a>
            )
          })}
        </div>
      )}

      {showAdd && <AddResourceModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
    </div>
  )
}

function AddResourceModal({ onClose, onAdd }) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [autoDetected, setAutoDetected] = useState(null)

  function handleUrlChange(val) {
    setUrl(val)
    if (val.startsWith('http')) {
      const info = detectService(val)
      setAutoDetected(info)
      if (!title) setTitle(guessTitle(val))
      if (!category) setCategory(info.defaultCat)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!url.trim()) return
    onAdd({
      url: url.trim(),
      title: title.trim() || guessTitle(url),
      description: description.trim() || null,
      category: category || autoDetected?.defaultCat || 'other',
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal glass" onClick={(e) => e.stopPropagation()}>
        <div className="modal-top-bar">
          <span className="modal-task-id">New Resource</span>
          <button className="modal-close" onClick={onClose}>&#x2715;</button>
        </div>

        {autoDetected && url.startsWith('http') && (
          <div className="resource-preview glass">
            <div className="resource-card-icon" style={{ background: autoDetected.color + '15', color: autoDetected.color }}>
              <span>{autoDetected.icon}</span>
            </div>
            <div>
              <div className="resource-card-service">{autoDetected.service}</div>
              <div className="resource-card-title">{title || guessTitle(url)}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="modal-field" style={{ marginBottom: '0.75rem' }}>
            <label>URL</label>
            <input
              className="modal-title-input"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://..."
              autoFocus
            />
          </div>
          <div className="modal-field" style={{ marginBottom: '0.75rem' }}>
            <label>Title</label>
            <input
              className="modal-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Auto-detected from URL..."
            />
          </div>
          <div className="modal-fields">
            <div className="modal-field">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="design">Design</option>
                <option value="repo">Repos</option>
                <option value="doc">Docs</option>
                <option value="reference">Reference</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <label className="modal-desc-label">Description (optional)</label>
          <textarea
            className="modal-desc-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="What is this resource about?"
          />
          <div className="modal-actions">
            <button type="submit" className="modal-save">Add Resource</button>
            <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
