import React, { useState, useEffect } from 'react';
import Canvas from './components/Canvas';
import Controls from './components/Controls';
import StatusBar from './components/StatusBar';
import Notifications from './components/Notifications';
import './App.css';

function App() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);

  // Set up WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    // Use the host's port if in production, or a different port (3001) if in development
    const port = process.env.NODE_ENV === 'production' ? window.location.port : '3001';
    // const wsUrl = `${protocol}//${host}${port ? `:${port}` : ''}`;
    const wsUrl = 'wss://4e0a-2409-40f3-12-a75-c4d3-a312-2139-ff2c.ngrok-free.app'; 
    
    const newSocket = new WebSocket(wsUrl);
    newSocket.binaryType = "blob"
    
    newSocket.onopen = () => {
      setIsConnected(true);
      addNotification('Connected to the server', 'connected-message');
    };
    
    newSocket.onclose = () => {
      setIsConnected(false);
      addNotification('Disconnected from the server', 'disconnected-message');
    };
    
    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      addNotification('Connection error', 'error-message');
    };
    
    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'user':
          setUserCount(data.count);
          const eventText = data.event === 'connected' ? 'joined' : 'left';
          addNotification(`${data.username} has ${eventText} the room`, `${data.event}-message`);
          break;
        
        case 'info':
          addNotification(data.message, 'info-message');
          break;
          
        default:
          // Other message types are handled by the Canvas component
          break;
      }
    };
    
    setSocket(newSocket);
    
    // Clean up on unmount
    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, []);
  
  // Add notification function
  const addNotification = (message, className) => {
    const newNotification = {
      id: Date.now(),
      message,
      className
    };
    
    setNotifications(prev => {
      // Keep only the last 10 notifications
      const updated = [newNotification, ...prev];
      return updated.slice(0, 10);
    });
  };
  
  // Handle reset canvas
  const handleReset = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'reset'
      }));
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Collaborative Drawing App</h1>
      </header>
      
      <main className="App-main">
        <StatusBar isConnected={isConnected} userCount={userCount} />
        
        <Notifications notifications={notifications} />
        
        <div className="canvas-container">
          {socket && <Canvas 
            socket={socket} 
            brushColor={brushColor} 
            brushSize={brushSize}
            addNotification={addNotification}
          />}
        </div>
        
        <Controls 
          brushColor={brushColor} 
          setBrushColor={setBrushColor}
          brushSize={brushSize} 
          setBrushSize={setBrushSize}
          onReset={handleReset}
        />
      </main>
    </div>
  );
}

export default App;