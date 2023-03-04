import React, { useEffect, useRef } from 'react';
import './App.css';
import io from 'socket.io-client';


const socket = io('http://localhost:3000');

function App() {
  const ref = useRef(false)
  useEffect(() => {
    if(!ref.current){
      ref.current = true
      return
    }
    // socket.emit("serialdata" , "")
    socket.on('data', (data) => {
        console.log(data);
    })
  }, []);

  return (
    <div className="App">
      test
    </div>
  );
}

export default App;
