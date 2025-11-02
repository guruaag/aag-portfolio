import { Link } from 'react-router-dom'

function PoemCard({ poem }) {
  return (
    <div className="poem-item">
      <Link to={`/poem/${poem.id}`}>
        {poem.heading || `Poem ${poem.sort_order}`}
      </Link>
    </div>
  )
}

export default PoemCard

