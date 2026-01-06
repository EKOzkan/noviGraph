import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import NodeEditor from './components/NodeEditor';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/editor" element={<NodeEditor />} />
      </Routes>
    </Router>
  );
}

export default App;
