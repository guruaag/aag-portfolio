import { marked } from 'marked'

function AboutPanel({ aboutContent, categoryName }) {
  if (!aboutContent) return null

  const htmlContent = aboutContent.body_text 
    ? marked.parse(aboutContent.body_text)
    : ''

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ 
        color: '#1a1a1a', 
        marginBottom: '24px', 
        fontSize: '32px',
        fontFamily: 'Georgia, Times New Roman, serif',
        fontWeight: 700,
        lineHeight: 1.2
      }}>
        {categoryName || aboutContent.title || 'About Gurupratap Sharma'}
      </h1>
      <div 
        className="markdown-content"
        style={{
          lineHeight: '2',
          color: '#2a2a2a',
          fontSize: '17px'
        }}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  )
}

export default AboutPanel

