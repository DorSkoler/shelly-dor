import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getCached, setCache } from '../lib/cache'

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'design', label: 'Design' },
  { id: 'repo', label: 'Repos' },
  { id: 'doc', label: 'Docs' },
  { id: 'reference', label: 'Reference' },
  { id: 'other', label: 'Other' },
]

// SVG icon components
const ICONS = {
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
  ),
  gdocs: (
    <svg viewBox="0 0 24 24" width="24" height="24"><path fill="#4285F4" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zM7 13h10v1.5H7V13zm0 3h10v1.5H7V16zm0-6h4v1.5H7V10z"/></svg>
  ),
  gsheets: (
    <svg viewBox="0 0 24 24" width="24" height="24"><path fill="#0F9D58" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zM7 13h3v2H7v-2zm0 3h3v2H7v-2zm4-3h6v2h-6v-2zm0 3h6v2h-6v-2z"/></svg>
  ),
  gslides: (
    <svg viewBox="0 0 24 24" width="24" height="24"><path fill="#F4B400" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zM8 13h8c.55 0 1 .45 1 1v4c0 .55-.45 1-1 1H8c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1z"/></svg>
  ),
  gdrive: (
    <svg viewBox="0 0 24 24" width="24" height="24"><path fill="#F4B400" d="M8.01 18.5L3 10l4.99-8h8.02L21 10l-4.99 8.5H8.01z" opacity=".3"/><path fill="#4285F4" d="M21 10l-4.99 8.5H8.01L3 10h4.99"/><path fill="#0F9D58" d="M8.01 2.5h8.02L21 10H8.01z" opacity=".3"/><path fill="#EA4335" d="M3 10l5.01-7.5L12.98 10H3z"/></svg>
  ),
  figma: (
    <svg viewBox="0 0 24 24" width="24" height="24"><path fill="#F24E1E" d="M8 24c2.2 0 4-1.8 4-4v-4H8c-2.2 0-4 1.8-4 4s1.8 4 4 4z"/><path fill="#A259FF" d="M4 12c0-2.2 1.8-4 4-4h4v8H8c-2.2 0-4-1.8-4-4z"/><path fill="#F24E1E" d="M4 4c0-2.2 1.8-4 4-4h4v8H8C5.8 8 4 6.2 4 4z"/><path fill="#FF7262" d="M12 0h4c2.2 0 4 1.8 4 4s-1.8 4-4 4h-4V0z"/><path fill="#1ABCFE" d="M20 12c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4 4 1.8 4 4z"/></svg>
  ),
  notion: (
    <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L18.29 2.14c-.42-.326-.98-.7-2.055-.607L3.36 2.611c-.466.046-.56.28-.374.466l1.473 1.131zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.84-.046.933-.56.933-1.167V6.354c0-.606-.233-.933-.747-.886l-15.177.886c-.56.047-.746.327-.746.934zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.746 0-.933-.234-1.494-.934l-4.577-7.186v6.952l1.448.327s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.455-.233 4.764 7.279v-6.44l-1.214-.14c-.094-.514.28-.886.747-.933l3.222-.187z"/></svg>
  ),
  miro: (
    <svg viewBox="0 0 24 24" width="24" height="24"><path fill="#FFD02F" d="M17.392 2H14.61l3.478 5.804L14.61 2h-2.783l3.478 8.696L11.826 2H9.044l3.478 11.587L9.044 2H6.26l6.087 20L6.261 2h-.87C3.626 2 2 3.627 2 5.391v13.218C2 20.373 3.627 22 5.391 22h13.218C20.373 22 22 20.373 22 18.609V5.391C22 3.627 20.373 2 18.609 2h-1.217z"/></svg>
  ),
  python: (
    <svg viewBox="0 0 24 24" width="24" height="24"><path fill="#3776AB" d="M11.914 0C5.82 0 6.2 2.656 6.2 2.656l.007 2.752h5.814v.826H3.9S0 5.789 0 11.969c0 6.18 3.403 5.96 3.403 5.96h2.03v-2.867s-.109-3.403 3.35-3.403h5.766s3.24.052 3.24-3.134V3.2S18.28 0 11.913 0zM8.708 1.85c.578 0 1.046.468 1.046 1.046s-.468 1.046-1.046 1.046-1.046-.468-1.046-1.046.468-1.046 1.046-1.046z"/><path fill="#FFD43B" d="M12.086 24c6.094 0 5.714-2.656 5.714-2.656l-.007-2.752h-5.814v-.826H20.1s3.9.445 3.9-5.735c0-6.18-3.403-5.96-3.403-5.96h-2.03v2.867s.109 3.403-3.35 3.403H9.451s-3.24-.052-3.24 3.134v5.325S5.72 24 12.087 24zm3.206-1.85c-.578 0-1.046-.468-1.046-1.046s.468-1.046 1.046-1.046 1.046.468 1.046 1.046-.468 1.046-1.046 1.046z"/></svg>
  ),
  yaml: (
    <svg viewBox="0 0 24 24" width="24" height="24"><rect fill="#CB171E" rx="3" width="24" height="24"/><text x="12" y="15.5" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="700" fontFamily="sans-serif">YML</text></svg>
  ),
  xml: (
    <svg viewBox="0 0 24 24" width="24" height="24"><rect fill="#E37933" rx="3" width="24" height="24"/><text x="12" y="15.5" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="700" fontFamily="sans-serif">XML</text></svg>
  ),
  code: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>
  ),
  npm: (
    <svg viewBox="0 0 24 24" width="24" height="24"><rect fill="#CB3837" width="24" height="24" rx="3"/><path fill="#fff" d="M4 4h16v16H4V4zm2 2v12h5V8h3v10h4V6H6z"/></svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" width="24" height="24"><path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
  ),
  stackoverflow: (
    <svg viewBox="0 0 24 24" width="24" height="24"><path fill="#BCB5AA" d="M18.986 21.865v-6.404h2.134V24H1.844v-8.539h2.13v6.404h15.012z"/><path fill="#F48024" d="M6.111 17.551l10.424 2.178.442-2.116-10.424-2.178-.442 2.116zm1.38-5.084l9.652 4.493.927-1.99-9.652-4.494-.927 1.991zm2.677-4.849l8.187 6.812 1.36-1.635-8.187-6.812-1.36 1.635zm5.291-5.028l-1.715 1.276 6.359 8.558 1.715-1.276-6.359-8.558zM5.967 19.886h10.67v-2.15H5.967v2.15z"/></svg>
  ),
  link: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
  ),
  pdf: (
    <svg viewBox="0 0 24 24" width="24" height="24"><rect fill="#E53935" rx="3" width="24" height="24"/><text x="12" y="15.5" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="700" fontFamily="sans-serif">PDF</text></svg>
  ),
  confluence: (
    <svg viewBox="0 0 24 24" width="24" height="24"><path fill="#0052CC" d="M1.26 17.15c-.32.54-.63 1.14-.89 1.63a.74.74 0 00.26 1.01l4.42 2.71a.74.74 0 001.01-.23c.22-.4.53-.93.87-1.5 2.37-3.95 4.75-3.5 9.09-1.37l4.41 2.17a.74.74 0 00.99-.31l2.18-4.56a.74.74 0 00-.34-1c-1.42-.68-4.24-2.04-7.05-3.41-6.41-3.14-11.78-2.9-14.95 4.86zm21.48-10.3c.32-.54.63-1.14.89-1.63a.74.74 0 00-.26-1.01L18.95 1.5a.74.74 0 00-1.01.23c-.22.4-.53.93-.87 1.5-2.37 3.95-4.75 3.5-9.09 1.37L3.57 2.43a.74.74 0 00-.99.31L.4 7.3a.74.74 0 00.34 1c1.42.68 4.24 2.04 7.05 3.41 6.41 3.14 11.78 2.9 14.95-4.86z"/></svg>
  ),
}

function detectService(url) {
  try {
    const u = new URL(url)
    const h = u.hostname
    const path = u.pathname.toLowerCase()

    // File extension detection from path
    const ext = path.match(/\.(py|yaml|yml|xml|json|js|ts|md|pdf|csv|html|css|go|rs|java|c|cpp|sh|bat|sql|toml|ini|cfg|env)(\?|$)/i)?.[1]?.toLowerCase()

    if (h.includes('github.com')) return { service: 'GitHub', icon: 'github', color: '#24292e', defaultCat: 'repo' }
    if (h.includes('docs.google.com/document')) return { service: 'Google Docs', icon: 'gdocs', color: '#4285f4', defaultCat: 'doc' }
    if (h.includes('docs.google.com/spreadsheet')) return { service: 'Google Sheets', icon: 'gsheets', color: '#0f9d58', defaultCat: 'doc' }
    if (h.includes('docs.google.com/presentation')) return { service: 'Google Slides', icon: 'gslides', color: '#f4b400', defaultCat: 'doc' }
    if (h.includes('drive.google.com')) {
      // Try to detect file type from URL params or path
      if (path.includes('/file/') || url.includes('export=')) {
        if (ext === 'py') return { service: 'Python File', icon: 'python', color: '#3776AB', defaultCat: 'repo' }
        if (ext === 'yaml' || ext === 'yml') return { service: 'YAML File', icon: 'yaml', color: '#CB171E', defaultCat: 'doc' }
        if (ext === 'xml') return { service: 'XML File', icon: 'xml', color: '#E37933', defaultCat: 'doc' }
        if (ext === 'pdf') return { service: 'PDF Document', icon: 'pdf', color: '#E53935', defaultCat: 'doc' }
        if (ext === 'json' || ext === 'js' || ext === 'ts' || ext === 'go' || ext === 'rs' || ext === 'java' || ext === 'c' || ext === 'cpp' || ext === 'sh' || ext === 'sql')
          return { service: `${ext.toUpperCase()} File`, icon: 'code', color: '#607d8b', defaultCat: 'repo' }
      }
      return { service: 'Google Drive', icon: 'gdrive', color: '#f4b400', defaultCat: 'doc' }
    }
    if (h.includes('figma.com')) return { service: 'Figma', icon: 'figma', color: '#a259ff', defaultCat: 'design' }
    if (h.includes('notion.so') || h.includes('notion.site')) return { service: 'Notion', icon: 'notion', color: '#000', defaultCat: 'doc' }
    if (h.includes('miro.com')) return { service: 'Miro', icon: 'miro', color: '#ffd02f', defaultCat: 'design' }
    if (h.includes('confluence')) return { service: 'Confluence', icon: 'confluence', color: '#0052cc', defaultCat: 'doc' }
    if (h.includes('stackoverflow.com')) return { service: 'Stack Overflow', icon: 'stackoverflow', color: '#f48024', defaultCat: 'reference' }
    if (h.includes('npmjs.com')) return { service: 'npm', icon: 'npm', color: '#cb3837', defaultCat: 'reference' }
    if (h.includes('pypi.org')) return { service: 'PyPI', icon: 'python', color: '#3775a9', defaultCat: 'reference' }
    if (h.includes('youtube.com') || h.includes('youtu.be')) return { service: 'YouTube', icon: 'youtube', color: '#ff0000', defaultCat: 'reference' }

    // Detect by file extension in any URL
    if (ext === 'py') return { service: 'Python File', icon: 'python', color: '#3776AB', defaultCat: 'repo' }
    if (ext === 'yaml' || ext === 'yml') return { service: 'YAML File', icon: 'yaml', color: '#CB171E', defaultCat: 'doc' }
    if (ext === 'xml') return { service: 'XML File', icon: 'xml', color: '#E37933', defaultCat: 'doc' }
    if (ext === 'pdf') return { service: 'PDF Document', icon: 'pdf', color: '#E53935', defaultCat: 'doc' }
    if (ext) return { service: `${ext.toUpperCase()} File`, icon: 'code', color: '#607d8b', defaultCat: 'repo' }

    return { service: h.replace('www.', ''), icon: 'link', color: '#007aff', defaultCat: 'other' }
  } catch {
    return { service: 'Link', icon: 'link', color: '#007aff', defaultCat: 'other' }
  }
}

function ServiceIcon({ name, color }) {
  const icon = ICONS[name] || ICONS.link
  return (
    <div className="resource-card-icon" style={{ background: color + '15', color }}>
      {icon}
    </div>
  )
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
    if (h.includes('docs.google.com/document')) return 'Google Doc'
    if (h.includes('docs.google.com/spreadsheet')) return 'Google Sheet'
    if (h.includes('docs.google.com/presentation')) return 'Google Slides'
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
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    const cached = getCached('resources')
    if (cached && cached.length > 0) {
      setResources(cached)
      setLoading(false)
    }

    async function fetchResources() {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching resources:', error)
      } else {
        setResources(data || [])
        setCache('resources', data || [])
      }
      setLoading(false)
    }

    fetchResources()

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

  useEffect(() => {
    if (resources.length > 0) {
      setCache('resources', resources)
    }
  }, [resources])

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

  function startEdit(r, e) {
    e.preventDefault()
    e.stopPropagation()
    setEditingId(r.id)
    setEditTitle(r.title)
  }

  async function saveEdit(id) {
    const trimmed = editTitle.trim()
    if (!trimmed) {
      setEditingId(null)
      return
    }
    if (supabase) {
      const { error } = await supabase
        .from('resources')
        .update({ title: trimmed })
        .eq('id', id)
      if (error) {
        console.error('Error updating resource:', error)
        setEditingId(null)
        return
      }
    }
    setResources((prev) => prev.map((r) => r.id === id ? { ...r, title: trimmed } : r))
    setEditingId(null)
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
                href={editingId === r.id ? undefined : r.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={editingId === r.id ? (e) => e.preventDefault() : undefined}
              >
                <ServiceIcon name={info.icon} color={info.color} />
                <div className="resource-card-body">
                  <div className="resource-card-service">{info.service}</div>
                  {editingId === r.id ? (
                    <input
                      className="resource-edit-input"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(r.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      onBlur={() => saveEdit(r.id)}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div className="resource-card-title">{r.title}</div>
                  )}
                  {r.description && <div className="resource-card-desc">{r.description}</div>}
                </div>
                <div className="resource-card-actions">
                  {editingId !== r.id && (
                    <button
                      className="resource-card-edit"
                      onClick={(e) => startEdit(r, e)}
                      title="Rename"
                    >
                      &#x270E;
                    </button>
                  )}
                  <button
                    className="resource-card-delete"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(r.id) }}
                    title="Remove"
                  >
                    &#x2715;
                  </button>
                </div>
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
            <ServiceIcon name={autoDetected.icon} color={autoDetected.color} />
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
