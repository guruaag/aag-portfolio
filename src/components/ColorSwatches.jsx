function ColorSwatches({ colors, activeColor, onColorSelect }) {
  return (
    <div className="color-swatches">
      {colors.map((color) => (
        <button
          key={color}
          className={`color-swatch ${activeColor === color ? 'active' : ''}`}
          style={{
            backgroundColor: color,
            borderColor: activeColor === color ? 'var(--accent)' : '#ccc'
          }}
          onClick={() => onColorSelect(color)}
          aria-label={`Select color ${color}`}
        />
      ))}
    </div>
  )
}

export default ColorSwatches

