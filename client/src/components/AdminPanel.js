import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [ous, setOus] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [userId, setUserId] = useState("");
  const [ou, setOu] = useState("");
  const [division, setDivision] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch Token.
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in, sir.", { position: "top-right" });
      navigate("/login");
      return;
    }
    try {
      // Decode jwt token and test against non admin users.
      const decodedUser = JSON.parse(atob(token.split(".")[1]));
      if (decodedUser.role !== "admin") {
        toast.error("Access denied, sir. Admins only.", {
          position: "top-right",
        });
        navigate("/credentials");
      }
    } catch (err) {
      toast.error("Invalid token, sir.", { position: "top-right" });
      navigate("/login");
    }

    // Fetch users from the users route.
    axios
      .get(`${API_BASE}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        console.log("Fetched users:", data);
        setUsers(data);
      })
      .catch((err) => {
        console.error(
          "Users fetch error:",
          err.response?.data,
          err.response?.status
        );
        // A toast to unfortunate success.
        let errorMsg = "Failed to fetch users, sir.";
        if (err.response && err.response.data && err.response.data.err) {
          errorMsg = err.response.data.err;
        }
        toast.error(errorMsg, { position: "top-right" });
        navigate("/login");
      });

    // Fetch OUs from ous route.
    axios
      .get(`${API_BASE}/api/ous`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        console.log("Fetched OUs:", data);
        setOus(data);
      })
      .catch((err) => {
        console.error(
          "OUs fetch error:",
          err.response?.data,
          err.response?.status
        );
        // A toast to unfortunate success.
        let errorMsg = "Failed to fetch OUs, sir.";
        if (err.response && err.response.data && err.response.data.err) {
          errorMsg = err.response.data.err;
        }
        toast.error(errorMsg, { position: "top-right" });
      });

    // Fetch divisions from divisions route.
    axios
      .get(`${API_BASE}/api/divisions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        console.log("Fetched divisions:", data);
        setDivisions(data);
      })
      .catch((err) => {
        console.error(
          "Divisions fetch error:",
          err.response?.data,
          err.response?.status
        );
        // A toast to unfortunate success.
        let errorMsg = "Failed to fetch divisions, sir.";
        if (err.response && err.response.data && err.response.data.err) {
          errorMsg = err.response.data.err;
        }
        toast.error(errorMsg, { position: "top-right" });
      });
  }, [navigate]);

  // Sets the states of ou's and divisions for ease of use
  // when adding or removing each.
  const setValues = (user) => {
    setUserId(user._id);
    setOu(user.ous && user.ous.length > 0 ? user.ous[0]._id : "");
    setDivision(
      user.divisions && user.divisions.length > 0 ? user.divisions[0]._id : ""
    );
    setRole(user.role || "");
  };

  // Adds an ou or division to a user when called.
  const handleAssign = async () => {
    if (!userId) return toast.error("Select a user, sir.");
    if (!ou && !division) return toast.error("Select an OU or division, sir.");
    try {
      // Fetch token from localstorage.
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Session expired, please log in again, sir.", {
          position: "top-right",
        });
        navigate("/login");
        return;
      }
      // Update the user with the new data.
      const { data } = await axios.put(
        `${API_BASE}/api/users/${userId}/assign`,
        { ou, division },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Assigned user:", data);
      // Check if user id matches, setUsers to data if true else return users.
      setUsers(users.map((u) => (u._id === userId ? data : u)));
      // A toast to success.
      toast.success("User assigned, sir!", { position: "top-right" });
      setOu("");
      setDivision("");
    } catch (err) {
      console.error(
        "Assign user error:",
        err.response?.data,
        err.response?.status
      );
      // A toast for unfortunate success.
      let errorMsg = "Failed to update ou and division, sir.";
      if (err.response && err.response.data && err.response.data.err) {
        errorMsg = err.response.data.err;
      }
      toast.error(errorMsg, { position: "top-right" });
      if (err.response?.status === 401) {
        toast.error("Session expired, please log in again, sir.", {
          position: "top-right",
        });
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  // Unassign/remove Division and or OU from user when called.
  const handleUnassign = async (type, id) => {
    if (!userId)
      return toast.error("Select a user, sir.", { position: "top-right" });
    if (!id)
      return toast.error(`Select a ${type}, sir.`, { position: "top-right" });
    try {
      // Fetch token from localstorage.
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Session expired, please log in again, sir.", {
          position: "top-right",
        });
        navigate("/login");
        return;
      }
      // Swap between OU or DIvision depending id.
      const payload = type === "OU" ? { ou: id } : { division: id };
      // Remove ou or payload from user.
      const { data } = await axios.patch(
        `${API_BASE}/api/users/${userId}/unassign`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(`Unassigned ${type}:`, data);
      // Check if user id matches, setUsers to data if true else return users.
      setUsers(users.map((u) => (u._id === userId ? data : u)));
      // A toast upon success.
      toast.success(`${type} removed, sir!`, { position: "top-right" });
      // Refresh states.
      setOu("");
      setDivision("");
    } catch (err) {
      console.error(
        `Unassign ${type} error:`,
        err.response?.data,
        err.response?.status
      );
      // A toast for unfortunate success.
      let errorMsg = `Failed to remove ${type}, sir.`;
      if (err.response && err.response.data && err.response.data.err) {
        errorMsg = err.response.data.err;
      }
      toast.error(errorMsg, { position: "top-right" });
      if (err.response?.status === 401) {
        toast.error("Session expired, please log in again, sir.", {
          position: "top-right",
        });
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  const handleChangeRole = async () => {
    if (!userId || !role)
      return toast.error("Select a user and role, sir.", {
        position: "top-right",
      });
    try {
      // Fetch token.
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Session expired, please log in again, sir.", {
          position: "top-right",
        });
        navigate("/login");
        return;
      }
      // Change role if user to new roll.
      const { data } = await axios.put(
        `${API_BASE}/api/users/${userId}/role`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Updated role:", data);
      // Check if user id matches, setUsers to data if true else return users.
      setUsers(users.map((u) => (u._id === userId ? data : u)));
      toast.success("User role updated, sir!", { position: "top-right" });
      setRole("");
    } catch (err) {
      console.error(
        "Role update error:",
        err.response?.data,
        err.response?.status
      );
      // A toast for unfortunate success.
      let errorMsg = "Failed to update role, sir.";
      if (err.response && err.response.data && err.response.data.err) {
        errorMsg = err.response.data.err;
      }
      toast.error(errorMsg, { position: "top-right" });
      if (err.response?.status === 401) {
        toast.error("Session expired, please log in again, sir.", {
          position: "top-right",
        });
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  return (
    <div className="container">
      <h2>JARVIS Admin Console</h2>
      <div>
        <button onClick={() => navigate("/login")}>Back to Login</button>
        <button
          className="admin-panel-button"
          onClick={() => navigate("/credentials")}
          style={{ marginLeft: "10px" }}
        >
          Back to Credentials
        </button>
      </div>
      <br></br>
      {/* Table to display all users and their corresponding data. */}
      <table className="jobs-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>OUs</th>
            <th>Divisions</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Display appropriate message of users is empty. */}
          {users.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: "center" }}>
                No users found, sir.
              </td>
            </tr>
          ) : (
            // Map all user to table.
            users.map((user) => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.role}</td>
                <td>
                  {user.ous && user.ous.length > 0
                    ? user.ous.map((ou) => ou.name || ou).join(", ")
                    : "None"}
                </td>
                <td>
                  {user.divisions && user.divisions.length > 0
                    ? user.divisions.map((div) => div.name || div).join(", ")
                    : "None"}
                </td>
                <td>
                  {/* Fetch current selected user _id. */}
                  <button onClick={() => setValues(user)}>Select</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div>
        <h3>Assign User</h3>
        <label>User ID: </label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <label>OU: </label>
        {/* Display all user OU's in select option input. */}
        <select value={ou} onChange={(e) => setOu(e.target.value)}>
          <option value="">Select OU</option>
          {ous.map((ou) => (
            <option key={ou._id} value={ou._id}>
              {ou.name}
            </option>
          ))}
        </select>
        {/* If OU selected display remove ou from user. */}
        {ou && (
          // If clicked, remove the selected ou from user.
          <button
            className="remove-button"
            onClick={() => handleUnassign("OU", ou)}
          >
            Remove OU
          </button>
        )}
        {/* Display all Divisions of user in select input option. */}
        <label>Division: </label>
        <select value={division} onChange={(e) => setDivision(e.target.value)}>
          <option value="">Select Division</option>
          {divisions.map((div) => (
            <option key={div._id} value={div._id}>
              {div.name}
            </option>
          ))}
        </select>
        <button className="add-button" onClick={handleAssign}>Assign User</button>
        {/* If Division is selected remove Division from user. */}
        {division && (
          // If clicked remove selected Division from user.
          <button
            className="remove-button"
            onClick={() => handleUnassign("Division", division)}
          >
            Remove Division
          </button>
        )}
      </div>
      <div>
        <h3>Change User Role</h3>
        <label>User ID: </label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <label>Role: </label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">Select Role</option>
          <option value="normal">Normal</option>
          <option value="management">Management</option>
          <option value="admin">Admin</option>
        </select>
        <button className="add-button" onClick={handleChangeRole}>Change Role</button>
        <button onClick={() => navigate("/login")}>Cancel</button>
      </div>
    </div>
  );
}

export default AdminPanel;
