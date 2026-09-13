import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminBreadcrumb({
  backPath,
  backLabel,
  isDirty = false,
  lang = 'hi'
}) {
  const navigate = useNavigate();
  const isEn = lang === 'en' || lang === 'EN';

  const defaultBackLabel = isEn ? 'Back' : 'वापस';
  const displayBackLabel = backLabel || defaultBackLabel;

  const handleBackClick = () => {
    if (isDirty) {
      const confirmLeave = window.confirm(
        isEn
          ? 'You have unsaved changes! Are you sure you want to return without saving?'
          : 'आपके पास सहेजे न गए बदलाव हैं! क्या आप वाकई बिना सहेजे वापस जाना चाहते हैं?'
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
    </div>
  );
}

