import { Link } from 'react-router-dom'

function CategoryCard({ category, preview, children }) {
  return (
    <div className="category-card">
      <h2>{category.name_display || category.name_en}</h2>
      {preview && <div className="preview-text">{preview}</div>}
      {children}
      <Link to={`/category/${category.id}`} className="link">
        View more (link)
      </Link>
    </div>
  )
}

export default CategoryCard

