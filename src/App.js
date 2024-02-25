import { useEffect } from 'react';
import './App.css';
import { initializepubsubsocket } from './connections/pubsubsocket';
import LiveTracking from './livelocationtracking/LiveTracking';

function App() {

  useEffect(() => {
    initializepubsubsocket().then(() => {
      console.log("Pub/sub socket connected successfully...!")
    }).catch((error) => {
      console.log(error)
    })
  }, [])

  
  return (
    <div className="App">
      <header className="App-header" style={{ padding: 20 }}>
        <LiveTracking/>
      </header>
    </div>
  );
}

export default App;
