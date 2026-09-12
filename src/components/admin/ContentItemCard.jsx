import React, { useState } from 'react';

export default function ContentItemCard({
  id,
  title,
  subtitle,
  badgeText,
  badgeColor,
  onEdit,
  onMoveUp,
  onMoveDown,
  onDelete,
  canMoveUp = true,
  canMoveDown = true,
  customActions = [], // Array of { label, onClick, className, title }
  lang = 'hi'
}) {
  const [isHovered, setIsHovered] = useState(false);
  const isEn = lang === 'en' || lang === 'EN';

  return (
    <li
      className={`admin-item-card poem-hover-card ${isHovered ? 'is-hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
        <div>
          <div className="admin-item-title">{title || (isEn ? 'Untitled' : 'बिना शीर्षक')}</div>
          {subtitle && <div className="admin-item-sub">{subtitle}</div>}
          {badgeText && (
            <span
              className="admin-item-badge"
              style={badgeColor ? { borderColor: badgeColor, color: badgeColor } : {}}
            >
              {badgeText}
            </span>
          )}
        </div>
      </div>

      {/* Hover Action Bar with Pure Text-Only Badges (Zero Icons) */}
      <div className={`poem-card-hover-actions ${isHovered ? 'visible' : ''}`}>
        {customActions.map((action, idx) => (
          <button
            key={idx}
            type="button"
            className={`poem-hover-badge ${action.className || 'badge-edit'}`}
            onClick={action.onClick}
            title={action.title || action.label}
          >
            {action.label}
          </button>
        ))}

        {onEdit && (
          <button
            type="button"
            className="poem-hover-badge badge-edit"
            onClick={onEdit}
            title={isEn ? 'Edit Item' : 'बदलें'}
          >
            {isEn ? 'Edit' : 'बदलें'}
          </button>
        )}

        {onMoveUp && (
          <button
            type="button"
            className="poem-hover-badge badge-move"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            title={isEn ? 'Move Up' : 'ऊपर'}
          >
            {isEn ? 'Move Up' : 'ऊपर'}
          </button>
        )}

        {onMoveDown && (
          <button
            type="button"
            className="poem-hover-badge badge-move"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            title={isEn ? 'Move Down' : 'नीचे'}
          >
            {isEn ? 'Move Down' : 'नीचे'}
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            className="poem-hover-badge badge-delete"
            onClick={onDelete}
            title={isEn ? 'Delete Item' : 'हटाएं'}
          >
            {isEn ? 'Delete' : 'हटाएं'}
          </button>
        )}
      </div>
    </li>
  );
}
