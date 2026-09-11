import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { sanitizeText } from '../lib/dataSanitizer'
import './PoemCard.css'

function PoemCard({ poem, index = 0 }) {
  const { i18n } = useTranslation()
  const isHi = i18n.language === 'hi'
  
  const title = sanitizeText(
    isHi 
      ? (poem.heading_hi || poem.heading || poem.heading_en || `काव्य ${poem.sort_order || ''}`)
      : (poem.heading_en || poem.heading || poem.heading_hi || `Poem ${poem.sort_order || ''}`)
  )
  
  const description = sanitizeText(poem.description || poem.body_text_hi || poem.body_text_en)
  const categoryTag = poem.category_name || (isHi ? 'कविता' : 'Poetry')

  return (
    <motion.article
      className="phoenix-poem-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      <Link to={`/poem/${poem.id}`} className="phoenix-poem-link">
        <div className="phoenix-poem-header">
          {categoryTag && (
            <span className="phoenix-poem-category-tag">{categoryTag}</span>
          )}
          <h3 className="phoenix-poem-heading">
            {title}
          </h3>
          {description && (
            <p className="phoenix-poem-description">
              {description}
            </p>
          )}
        </div>
        <div className="phoenix-poem-footer">
          <span className="phoenix-poem-read-more">
            {isHi ? 'पढ़ें →' : 'Read →'}
          </span>
        </div>
      </Link>
    </motion.article>
  )
}

export default PoemCard
