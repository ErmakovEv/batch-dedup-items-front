import LeftWindow from './components/left';
import RightWindow from './components/rigth';

function App() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <LeftWindow />
      <RightWindow />
    </div>
  );
}

export default App;
