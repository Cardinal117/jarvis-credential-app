import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

function Credentials() {
  const [credentials, setCredentials] = useState([]);
  const [selectedCredentials, setSelectedCredentials] = useState([]);
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [user, setUser] = useState({});
  const [divisions, setDivisions] = useState([]);
  const [selectedDivisionId, setSelectedDivisionId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch token.
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in, sir.", { position: "top-right" });
      navigate("/login");
      return;
    }

    try {
      // Decode token.
      const decodedUser = JSON.parse(atob(token.split(".")[1]));
      // Set user state to display name on top.
      setUser(decodedUser);
      console.log("Decoded user:", decodedUser);

      // Test for admin users.
      if (decodedUser.role === "admin") {
        axios
          .get(`${API_BASE}/api/divisions`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then(({ data }) => {
            setDivisions(data);
            if (data.length > 0) {
              setSelectedDivisionId(data[0]._id);
              fetchCredentials(data[0]._id, token);
            } else {
              toast.error("No divisions available, sir.", {
                position: "top-right",
              });
              setCredentials([]);
            }
          })
          .catch((err) => {
            console.error("Divisions fetch error:", err.response?.data);
            // A toast for unfortunate success.
            let errorMsg = "Failed to fetch divisions, sir.";
            if (err.response && err.response.data && err.response.data.err) {
              errorMsg = err.response.data.err;
            }
            toast.error(errorMsg, { position: "top-right" });
            navigate("/login");
          });
      } else {
        // Check if division is valid and is not null.
        const divisionId =
          decodedUser.divisions && decodedUser.divisions.length > 0
            ? decodedUser.divisions[0]
            : null;
        // Do a regex check to ensure only valid characters.
        if (!divisionId || !/^[0-9a-fA-F]{24}$/.test(divisionId)) {
          toast.error("No valid division assigned, sir.", {
            position: "top-right",
          });
          navigate("/login");
          return;
        }
        // Set state values.
        setSelectedDivisionId(divisionId);
        fetchCredentials(divisionId, token);
      }
    } catch (err) {
      console.error("Token decode error:", err);
      toast.error("Invalid token, sir.", { position: "top-right" });
      navigate("/login");
    }
  }, [navigate]);

  // Fetches credentials of a division when called.
  const fetchCredentials = (divisionId, token) => {
    // Get route for fetching credentials data.
    axios
      .get(`${API_BASE}/api/credentials/${divisionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        setCredentials(data.credentials || []);
        setSelectedCredentials([]);
        // A toast upon success.
        toast.success(
          data.credentials.length > 0
            ? "Credentials loaded, sir!"
            : "No credentials for this division, sir.", // If no credentials in this division display appropriate message.
          { position: "top-right" }
        );
      })
      .catch((err) => {
        console.error(
          "Credentials fetch error:",
          err.response?.data,
          err.response?.status
        );
        // A toast for unfortunate success.
        let errorMsg = "Failed to fetch credentials, sir.";
        if (err.response && err.response.data && err.response.data.err) {
          errorMsg = err.response.data.err;
        }
        toast.error(errorMsg, { position: "top-right" });
        // Clear credentials if error.
        setCredentials([]);
        setSelectedCredentials([]);
        if (err.response?.status === 401) {
          toast.error("Session expired, please log in again, sir.", {
            position: "top-right",
          });
          localStorage.removeItem("token");
          navigate("/login");
        }
      });
  };

  // Allows for fetching of new division credentials 
  // when select division select box is used.
  // Only for admins.
  const handleDivisionChange = async (e) => {
    const divisionId = e.target.value;
    setSelectedDivisionId(divisionId);
    if (!divisionId) {
      setCredentials([]);
      setSelectedCredentials([]);
      // A toast to failure.
      toast.error("Please select a valid division, sir.", {
        position: "top-right",
      });
      return;
    }
    // Fetch token.
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Session expired, please log in again, sir.", {
        position: "top-right",
      });
      navigate("/login");
      return;
    }
    // Assign new credentials data of selected division to state.
    fetchCredentials(divisionId, token);
  };

  // Allows for the selection of credentials to be toggles (ticks and de ticks the boxes).
  // Only for admins.
  const toggleCredentialSelection = (id) => {
    setSelectedCredentials((prev) => {
      if (prev.includes(id)) {
        return prev.filter((credId) => credId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Adds the new key and value credentials to a select division when called.
  const handleAdd = async () => {
    if (!key || !value)
      return toast.error("Enter key and value, sir.", {
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
      // Decode token.
      const decodedUser = JSON.parse(atob(token.split(".")[1]));
      const divisionId =
        decodedUser.role === "admin"
          ? selectedDivisionId
          : decodedUser.divisions[0];
      // Regex check for division id.
      // Prevents select division from being seen as a division.
      if (!divisionId || !/^[0-9a-fA-F]{24}$/.test(divisionId)) {
        return toast.error("No valid division selected, sir.", {
          position: "top-right",
        });
      }

      const { data } = await axios.post(
        `${API_BASE}/api/credentials/${divisionId}`,
        { key, value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update credentials list with new data.
      setCredentials(data.credentials);
      // Refresh values.
      setKey("");
      setValue("");
      toast.success("Credential added, sir!", { position: "top-right" });
    } catch (err) {
      console.error(
        "Add credential error:",
        err.response?.data,
        err.response?.status
      );
      // A toast for unfortunate success.
      let errorMsg = "Failed to add credential, sir.";
      if (err.response && err.response.data && err.response.data.err) {
        errorMsg = err.response.data.err;
      }
      toast.error(errorMsg, { position: "top-right" });
      // Return to login if error appears.
      if (err.response?.status === 401) {
        toast.error("Session expired, please log in again, sir.", {
          position: "top-right",
        });
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  // Handles the updating of division credential
  // data for all selected credentials.
  const handleBatchUpdate = async () => {
    if (selectedCredentials.length === 0) {
      return toast.error("Select at least one credential, sir.", {
        position: "top-right",
      });
    }
    // Fetch toke.
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Session expired, please log in again, sir.", {
          position: "top-right",
        });
        navigate("/login");
        return;
      }
      // Decode token.
      const decodedUser = JSON.parse(atob(token.split(".")[1]));
      if (decodedUser.exp * 1000 < Date.now()) {
        toast.error("Session expired, please log in again, sir.", {
          position: "top-right",
        });
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      const divisionId =
        decodedUser.role === "admin"
          ? selectedDivisionId
          : decodedUser.divisions[0];
      // Regex check for division id.
      // Prevents select division from being seen as a division.
      if (!divisionId || !/^[0-9a-fA-F]{24}$/.test(divisionId)) {
        return toast.error("No valid division selected, sir.", {
          position: "top-right",
        });
      }

      const updatePromises = selectedCredentials.map((credId) =>
        axios.put(
          `${API_BASE}/api/credentials/${divisionId}/${credId}`,
          { key, value },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );
      await Promise.all(updatePromises);
      const { data } = await axios.get(
        `${API_BASE}/api/credentials/${divisionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Set credentials to acquired data.
      setCredentials(data.credentials);
      // Reset key, value and selected credentials.
      setKey("");
      setValue("");
      setSelectedCredentials([]);
      // A toast upon success.
      toast.success("Credentials updated, sir!", { position: "top-right" });
    } catch (err) {
      console.error(
        "Batch update error:",
        err.response?.data,
        err.response?.status
      );
      // A toast for unfortunate success.
      let errorMsg = "Failed to update credentials, sir.";
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
      <h2>
        JARVIS Credential Vault: {user.username || "Unknown"}{" "}
        {/* If user is admin role display the morale boosting admin badge. */}
        {user.role === "admin" && <span className="admin-badge">Admin</span>}
      </h2>
      <button onClick={() => navigate("/login")}>Back to Login</button>
      {/* If user role is admin display admin panel button. */}
      {user.role === "admin" && (
        <button className="admin-button" onClick={() => navigate("/admin")}>
          Admin Panel
        </button>
      )}
      <br />
      {/* Only display division selection box if user role is admin. */}
      {user.role === "admin" && (
        <div>
          <label
            className="unique-label"
            style={{
              color: "gold",
              display: "inline",
              textAlign: "center",
              fontSize: "1.3em",
            }}
          >
            Select Division:{" "}
          </label>
          <select value={selectedDivisionId} onChange={handleDivisionChange}>
            <option value="">Select a division</option>
            {divisions.map((div) => (
              <option key={div._id} value={div._id}>
                {div.name}
              </option>
            ))}
          </select>
          <br />
          <br />
        </div>
      )}
      <table className="jobs-table">
        <thead>
          <tr>
            {user.role !== "normal" && <th>Select</th>}
            <th>Key</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {/* Ensure that credentials is not empty. */}
          {credentials.length === 0 ? (
            <tr>
              {/* Check if user is not a normal user. */}
              <td
                colSpan={user.role !== "normal" ? 3 : 2}
                style={{ textAlign: "center" }}
              >
                No credentials for this division, sir.
              </td>
            </tr>
          ) : (
            // Display user specific credentials unless admin
            // (admins get access to all credentials).
            credentials.map((cred) => (
              <tr key={cred._id}>
                {/* Only display of user role not normal. */}
                {user.role !== "normal" && (
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedCredentials.includes(cred._id)}
                      onChange={() => toggleCredentialSelection(cred._id)}
                      className="checkbox"
                    />
                  </td>
                )}
                <td>{cred.key}</td>
                <td>{cred.value}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div>
        {/* Add new credentials to select division. */}
        <label>Key: </label>
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <label>Value: </label>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button onClick={handleAdd}>Add Credential</button>
        {user.role !== "normal" && (
          <button onClick={handleBatchUpdate}>
            Update Selected Credentials
          </button>
        )}
        <button onClick={() => navigate("/login")}>Cancel</button>
      </div>
    </div>
  );
}

export default Credentials;
