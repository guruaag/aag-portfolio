import { useNavigate } from 'react-router-dom'

function PublicationCard({ publication, supabaseUrl }) {
  const navigate = useNavigate()
  
  const imageUrl = publication.image_path
    ? `${supabaseUrl}/storage/v1/object/public/public-assets/${publication.image_path}`
    : null

  const handleClick = () => {
    navigate(`/publication/${publication.id}`)
  }

  return (
    <div className="publication-card" onClick={handleClick}>
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={publication.image_alt || publication.title}
          onError={(e) => {
            e.target.style.display = 'none'
            e.target.nextSibling.style.display = 'block'
          }}
        />
      ) : null}
      <div 
        className="placeholder" 
        style={{ display: imageUrl ? 'none' : 'block' }}
      >
        {publication.title || 'Image not available'}
      </div>
    </div>
  )
}

export default PublicationCard

