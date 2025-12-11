import { useState } from 'react'
import { FileCode, Folder, File, ChevronRight, ChevronDown, Copy, Check } from 'lucide-react'
import './FileViewer.css'

function FileViewer({ files = [], title = "Files" }) {
  const [activeFile, setActiveFile] = useState(files[0]?.name || null)
  const [expandedFolders, setExpandedFolders] = useState(new Set())
  const [copied, setCopied] = useState(false)

  const toggleFolder = (folderPath) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath)
    } else {
      newExpanded.add(folderPath)
    }
    setExpandedFolders(newExpanded)
  }

  const handleCopyContent = () => {
    const file = files.find(f => f.name === activeFile)
    if (file) {
      navigator.clipboard.writeText(file.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getFileIcon = (filename) => {
    if (filename.endsWith('.tf')) return '🔧'
    if (filename.endsWith('.yaml') || filename.endsWith('.yml')) return '📋'
    if (filename.endsWith('.json')) return '📦'
    if (filename.endsWith('.sh')) return '🔨'
    if (filename.endsWith('.py')) return '🐍'
    if (filename.endsWith('.js')) return '📜'
    if (filename.endsWith('.dockerfile') || filename === 'Dockerfile') return '🐳'
    return '📄'
  }

  const activeFileData = files.find(f => f.name === activeFile)

  return (
    <div className="file-viewer-container">
      <div className="file-viewer-header">
        <FileCode size={20} />
        <span>{title}</span>
      </div>

      <div className="file-viewer-body">
        {/* File Tree Sidebar */}
        <div className="file-tree">
          <div className="file-tree-header">Files</div>
          <div className="file-tree-list">
            {files.map((file, index) => {
              const isFolder = file.type === 'folder'
              const isExpanded = expandedFolders.has(file.name)
              const isActive = activeFile === file.name

              return (
                <div key={index} className="file-tree-item-container">
                  <div
                    className={`file-tree-item ${isActive ? 'active' : ''} ${isFolder ? 'folder' : ''}`}
                    onClick={() => {
                      if (isFolder) {
                        toggleFolder(file.name)
                      } else {
                        setActiveFile(file.name)
                      }
                    }}
                  >
                    {isFolder ? (
                      <>
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        <Folder size={16} />
                      </>
                    ) : (
                      <>
                        <File size={16} className="file-icon" />
                      </>
                    )}
                    <span className="file-name">{getFileIcon(file.name)} {file.name}</span>
                  </div>

                  {/* Show children if folder is expanded */}
                  {isFolder && isExpanded && file.children && (
                    <div className="file-tree-children">
                      {file.children.map((child, childIndex) => (
                        <div
                          key={childIndex}
                          className={`file-tree-item child ${activeFile === child.name ? 'active' : ''}`}
                          onClick={() => setActiveFile(child.name)}
                        >
                          <File size={16} className="file-icon" />
                          <span className="file-name">{getFileIcon(child.name)} {child.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* File Content Area */}
        <div className="file-content">
          {activeFileData ? (
            <>
              <div className="file-content-header">
                <div className="file-info">
                  <span className="file-icon-large">{getFileIcon(activeFileData.name)}</span>
                  <span className="file-name-display">{activeFileData.name}</span>
                  {activeFileData.language && (
                    <span className="file-language">{activeFileData.language}</span>
                  )}
                </div>
                <button
                  className="copy-file-button"
                  onClick={handleCopyContent}
                  title="Copy file contents"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              
              <div className="file-content-body">
                <pre>
                  <code className={activeFileData.language || 'plaintext'}>
                    {activeFileData.content}
                  </code>
                </pre>
              </div>
            </>
          ) : (
            <div className="file-content-empty">
              <FileCode size={48} />
              <p>Select a file to view its contents</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FileViewer
