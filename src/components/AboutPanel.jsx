import { marked } from 'marked'

function AboutPanel({ aboutContent, categoryName }) {
  if (!aboutContent) return null

  const htmlContent = aboutContent.body_text 
    ? marked.parse(aboutContent.body_text)
    : ''

  return (
    <div>
      <h1 style={{ color: 'var(--accent)', marginBottom: '24px', fontSize: '24px' }}>
        {categoryName || aboutContent.title || 'About Gurupratap Sharma'}
      </h1>
      <div 
        className="markdown-content"
        style={{
          lineHeight: '1.8',
          maxHeight: 'calc(100vh - 200px)',
          overflowY: 'auto'
        }}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  )
}

export default AboutPanel

