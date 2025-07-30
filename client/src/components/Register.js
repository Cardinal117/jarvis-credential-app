import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [ou, setOu] = useState("");
  const [division, setDivision] = useState("");
  const [ous, setOus] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch OUs and Divisions, for displays as 
    // options to select from.
    axios
      .get(`${API_BASE}/api/ous`)
      .then(({ data }) => setOus(data))
      .catch((err) =>
        toast.error("Failed to fetch OUs, sir.", { position: "top-right" })
      );

    axios
      .get(`${API_BASE}/api/divisions`)
      .then(({ data }) => setDivisions(data))
      .catch((err) =>
        toast.error("Failed to fetch divisions, sir.", {
          position: "top-right",
        })
      );
  }, []);

// Submits the new user/saves the user to the database with all their details.
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${API_BASE}/api/register`, {
        username,
        password,
        ou,
        division,
      });
      // Save token to localstorage for credentials access.
      localStorage.setItem("token", data.token);
      // A toast upon success.
      toast.success("Registration complete, sir! Suit up!", {
        position: "top-right",
      });
      navigate("/credentials");
    } catch (err) {
      // A toast for unfortunate success.
      let errorMsg = "Registration failed, sir.";
      if (err.response && err.response.data && err.response.data.err) {
        errorMsg = err.response.data.err;
      }
      toast.error(errorMsg, { position: "top-right" });
    }
  };

  return (
    <div className="login-container">
      <h2>JARVIS Registration System</h2>
      {/* Registration as a new user form. */}
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
        <div>
          <label>OU: </label>
          {/* Display all ou options to choose from. */}
          <select value={ou} onChange={(e) => setOu(e.target.value)}>
            <option value="">Select OU</option>
            {ous.map((ou) => (
              <option key={ou._id} value={ou._id}>
                {ou.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Division: </label>
          {/* Display all division options to choose from. */}
          <select
            value={division}
            onChange={(e) => setDivision(e.target.value)}
          >
            <option value="">Select Division</option>
            {divisions.map((division) => (
              <option key={division._id} value={division._id}>
                {division.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Register Suit</button>
        <button onClick={() => navigate("/login")}>Switch to Login</button>
      </form>
    </div>
  );
}

export default Register;
