import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { sanitizeText } from '../lib/dataSanitizer'
import { renderFormattedText } from '../utils/textFormatter'
import './PoemCard.css'

/**
 * PoemCard
 *
 * When `onOpenFocus` is provided (e.g. from the category grid),
 * clicking the card opens the PoetryFocusView overlay instead of
 * navigating to /poem/:id.  The direct /poem/:id route is still
 * reachable for share links and the "Read →" affordance keeps its
 * href for right-click / open-in-new-tab.
 */
function PoemCard({ poem, index = 0, hideBadge = false, onOpenFocus }) {
  const { i18n } = useTranslation()
  const isHi = i18n.language === 'hi'
  
  const title = sanitizeText(
    isHi 
      ? (poem.heading_hi || poem.heading || poem.heading_en || `काव्य ${poem.sort_order || ''}`)
      : (poem.heading_en || poem.heading || poem.heading_hi || `Poem ${poem.sort_order || ''}`)
  )
  
  const excerpt = sanitizeText(poem.description || poem.body_text_hi || poem.body_text_en)
  const categoryTag = hideBadge ? null : (poem.category_name || (isHi ? 'कविता' : 'Poetry'))

  const handleClick = (e) => {
    if (onOpenFocus) {
      e.preventDefault()
      onOpenFocus(poem.id)
    }
  }

  return (
    <motion.article
      className="phoenix-poem-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Link to={`/poem/${poem.id}`} className="phoenix-poem-link" onClick={handleClick}>
        <div>
          {categoryTag && (
            <span className="phoenix-poem-category-tag">{categoryTag}</span>
          )}
          <h3 className="phoenix-poem-card-title">
            {title}
          </h3>
          {excerpt && (
            <div className="phoenix-poem-card-excerpt">
              {renderFormattedText(excerpt)}
            </div>
          )}
        </div>
        <div className="phoenix-poem-card-footer">
          <span className="phoenix-poem-read-more">
            {isHi ? 'पढ़ें →' : 'Read →'}
          </span>
        </div>
      </Link>
    </motion.article>
  )
}

export default PoemCard
