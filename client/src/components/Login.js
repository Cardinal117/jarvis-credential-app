import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Post to login route to check if details are valid.
      const { data } = await axios.post(`${API_BASE}/api/login`, { username, password });
      localStorage.setItem('token', data.token);
      // A toast to success.
      toast.success('Login successful!', { position: 'top-right' });
      // Navigate to credentials route if login successful.
      navigate('/credentials');
    } catch (err) {
      toast.error(err.response?.data?.err || 'Login failed, sir.', { position: 'top-right' });
    }
  };

  return (
    <div className="login-container">
      <h2>JARVIS Login System</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username: </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password: </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Activate Login</button>
        <button onClick={() => navigate('/register')}>Switch to Registration</button>
      </form>
    </div>
  );
}

export default Login;