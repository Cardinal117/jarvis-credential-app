import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Login from './components/Login';
import Register from './components/Register';
import Credentials from './components/Credentials';
import AdminPanel from './components/AdminPanel';

function App() {
  return (
    <Router>
      {/* Allow for toasts to work. */}
        <ToastContainer position="top-right" theme='dark' />
        {/* Routes */}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/credentials" element={<Credentials />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
    </Router>
  );
}

export default App;