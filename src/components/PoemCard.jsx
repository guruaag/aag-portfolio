import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import './PoemCard.css'

function PoemCard({ poem, index = 0 }) {
  return (
    <motion.article
      className="phoenix-poem-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ x: 8, transition: { duration: 0.2 } }}
    >
      <Link to={`/poem/${poem.id}`} className="phoenix-poem-link">
        <div className="phoenix-poem-header">
          <h3 className="phoenix-poem-heading">
            {poem.heading || `Poem ${poem.sort_order}`}
          </h3>
          {poem.description && (
            <p className="phoenix-poem-description">
              {poem.description}
            </p>
          )}
        </div>
        <div className="phoenix-poem-footer">
          <span className="phoenix-poem-read-more">
            Read →
          </span>
        </div>
      </Link>
    </motion.article>
  )
}

export default PoemCard
