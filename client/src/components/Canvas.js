import React, { useRef, useEffect, useState } from 'react';

const Canvas = ({ socket, brushColor, brushSize, addNotification }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  
  // Setup canvas and handle resize
  useEffect(() => {
    const canvas = canvasRef.current;
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      const containerWidth = container.clientWidth;
      canvas.width = Math.min(containerWidth, 800);
      canvas.height = Math.min(window.innerHeight * 0.6, 600);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  // Handle WebSocket messages for drawing
  useEffect(() => {
    if (!socket) return;
  
    const handleSocketMessage = (event) => {
      let data;
      
      try {
        // Try parsing the message as JSON
        const parsed = JSON.parse(event.data);
  
        // Check if it's a Buffer object (from backend)
        if (parsed.type === 'Buffer' && Array.isArray(parsed.data)) {
          // Convert Buffer data (Uint8Array) back to the original JSON string
          const jsonString = String.fromCharCode(...parsed.data);
          data = JSON.parse(jsonString); // Now parse the actual drawing command
        } else {
          // Normal JSON message (not a Buffer)
          data = parsed;
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
        return;
      }
  
      console.log(data, "Received data");
  
      switch (data.type) {
        case 'draw':
          drawLine(
            data.from.x,
            data.from.y,
            data.to.x,
            data.to.y,
            data.color,
            data.size
          );
          break;
        
        case 'reset':
          resetCanvas();
          addNotification(`Canvas reset by ${data.username}`, 'reset-message');
          break;
          
        default:
          break;
      }
    };
  
    socket.addEventListener('message', handleSocketMessage);
  
    return () => {
      socket.removeEventListener('message', handleSocketMessage);
    };
  }, [socket, addNotification]);
  
  // Drawing functions
  const drawLine = (fromX, fromY, toX, toY, color, width) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };
  
  const resetCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  
  const getPosition = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    if (e.type.includes('touch')) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };
  
  // Event handlers
  const handleMouseDown = (e) => {
    setIsDrawing(true);
    setLastPos(getPosition(e));
  };
  
  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    
    const currentPos = getPosition(e);
    
    // Draw on local canvas
    drawLine(
      lastPos.x,
      lastPos.y,
      currentPos.x,
      currentPos.y,
      brushColor,
      brushSize
    );
    
    // Send drawing data to server
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'draw',
        from: { x: lastPos.x, y: lastPos.y },
        to: { x: currentPos.x, y: currentPos.y },
        color: brushColor,
        size: brushSize
      }));
    }
    
    setLastPos(currentPos);
  };
  
  const handleMouseUp = () => {
    setIsDrawing(false);
  };
  
  const handleMouseOut = () => {
    setIsDrawing(false);
  };
  
  // Touch event handlers
  const handleTouchStart = (e) => {
    e.preventDefault();
    handleMouseDown(e);
  };
  
  const handleTouchMove = (e) => {
    e.preventDefault();
    handleMouseMove(e);
  };
  
  const handleTouchEnd = () => {
    handleMouseUp();
  };
  
  return (
    <canvas
      ref={canvasRef}
      className="drawing-canvas"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseOut={handleMouseOut}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    />
  );
};

export default Canvas;