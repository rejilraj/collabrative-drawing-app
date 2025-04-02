import React from 'react';

const Controls = ({ brushColor, setBrushColor, brushSize, setBrushSize, onReset }) => {
  return (
    <div className="controls">
      <div className="control-group">
        <label htmlFor="brush-color">Color:</label>
        <input
          type="color"
          id="brush-color"
          value={brushColor}
          onChange={(e) => setBrushColor(e.target.value)}
        />
      </div>
      
      <div className="control-group">
        <label htmlFor="brush-size">Brush Size:</label>
        <input
          type="range"
          id="brush-size"
          min="1"
          max="50"
          value={brushSize}
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
        />
        <span id="size-display">{brushSize}px</span>
      </div>
      
      <button className="reset-button" onClick={onReset}>
        Reset Canvas
      </button>
    </div>
  );
};

export default Controls;