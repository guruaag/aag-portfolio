import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminBreadcrumb({
  sectionTitle,
  itemTitle,
  backPath,
  backLabel,
  isDirty = false,
  lang = 'hi'
}) {
  const navigate = useNavigate();
  const isEn = lang === 'en' || lang === 'EN';

  const defaultBackLabel = isEn ? 'Back to List' : 'सूची पर वापस जाएं';
  const displayBackLabel = backLabel || `← ${defaultBackLabel}`;

  const handleBackClick = () => {
    if (isDirty) {
      const confirmLeave = window.confirm(
        isEn
          ? 'You have unsaved changes! Are you sure you want to return to the list without saving?'
          : 'आपके पास सहेजे न गए बदलाव हैं! क्या आप वाकई बिना सहेजे सूची पर वापस जाना चाहते हैं?'
      );
      if (!confirmLeave) return;
    }
    navigate(backPath);
  };

  return (
    <div className="admin-breadcrumb-bar">
      <button
        type="button"
        className="admin-back-btn"
        onClick={handleBackClick}
      >
        {displayBackLabel}
      </button>
      <div className="admin-breadcrumb-path">
        <span>{sectionTitle}</span>
        <span className="admin-breadcrumb-sep">&gt;</span>
        <span className="admin-breadcrumb-active">{itemTitle}</span>
      </div>
    </div>
  );
}
