import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import "./AdminCredibility.css"; // import the CSS

const AdminCredibility = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Define the domain mapping
  const domains = [
    "Environment & Climate",
    "Entertainment & Celebrities",
    "Law, Rights & Ethics",
    "Business & Economy",
    "News & Media",
    "Politics & Government",
    "Health & Medicine",
    "Science & Technology"
  ];
  
  // Helper function to get domain index
  const getDomainIndex = (domain) => {
    return domains.indexOf(domain);
  };

  // ----------- LOGOUT -----------
  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    
    // Redirect to login page
    navigate("/login");
  };

  // ----------- ROLE PROTECTION -----------
  useEffect(() => {
    const userJson = localStorage.getItem("user");
    console.log("User data from localStorage:", userJson);
    if (!userJson) {
      console.log("No user data found in localStorage");
      alert("Not authorized! No user data.");
      navigate("/login");
      return;
    }
    
    try {
      const user = JSON.parse(userJson);
      console.log("Parsed user:", user);
      if (!user || user.role !== "admin") {
        console.log("User is not admin:", user?.role);
        alert("Not authorized! User is not admin.");
        navigate("/login");
      }
    } catch (err) {
      console.error("Error parsing user data:", err);
      alert("Not authorized! Error parsing user data.");
      navigate("/login");
    }
  }, [navigate]);  // ----------- FETCH PENDING REQUESTS -----------
  const fetchRequests = useCallback(async () => {
    try {
      console.log("Fetching credibility requests...");
      // Get token directly to ensure it's available
      const token = localStorage.getItem("token");
      console.log("Token from localStorage:", token);
      if (!token) {
        throw new Error("Authentication token not found");
      }
      
      const res = await api.get("/credibility", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log("Credibility requests response:", res.data);
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching credibility requests:", err);
      alert("Failed to fetch credibility requests");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // ----------- VERIFY REQUEST -----------
  const handleVerify = async (id) => {
    if (!window.confirm("Verify this request and increment credibility?")) return;

    try {
      await api.post(`/credibility/${id}/verify`);
      // Remove verified request from list
      setRequests(requests.filter((r) => r._id !== id));
      alert("Request verified successfully!");
      
      // Refresh user data in localStorage to reflect updated credibility score
      try {
        const response = await api.get("/auth/me");
        localStorage.setItem("user", JSON.stringify(response.data));
      } catch (refreshErr) {
        console.error("Failed to refresh user data:", refreshErr);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to verify request");
    }
  };

  if (loading) return (
    <div className="admin-credibility-container">
      <div className="header-section">
        <h2>Pending Credibility Requests</h2>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading requests...</p>
      </div>
    </div>
  );
  
  if (requests.length === 0) return (
    <div className="admin-credibility-container">
      <div className="header-section">
        <h2>Pending Credibility Requests</h2>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div className="empty-state">
        <h3>No Pending Requests</h3>
        <p>There are currently no credibility requests pending verification.</p>
      </div>
    </div>
  );

  return (
    <div className="admin-credibility-container">
      <div className="header-section">
        <h2>Pending Credibility Requests</h2>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-value">{requests.length}</div>
            <div className="stat-label">Pending Requests</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{requests.filter(r => r.user?.credibilityScore).length}</div>
            <div className="stat-label">Users Affected</div>
          </div>
        </div>
      </div>
      
      {requests.map((req) => (
        <div key={req._id} className="request-card">
          <div className="user-info">
            <p>
              <strong>User:</strong> {req.user.name} ({req.user.email})
            </p>
            <p>
              <strong>Current Credibility:</strong> 
              {req.user.credibilityScore && Array.isArray(req.user.credibilityScore) ? (
                <span>
                  {req.user.credibilityScore[getDomainIndex(req.knowledgeDomain)]?.toFixed(2) || '0.30'} 
                  (Domain: {req.knowledgeDomain})
                </span>
              ) : (
                <span>{(req.user.credibilityScore || 0.3).toFixed(2)}</span>
              )}
            </p>
          </div>
          <p>
            <strong>Domain:</strong> {req.knowledgeDomain}
          </p>
          <p>
            <strong>LinkedIn:</strong>{" "}
            <a href={req.linkedin} target="_blank" rel="noreferrer">
              {req.linkedin}
            </a>
          </p>
          <button onClick={() => handleVerify(req._id)}>Verify & Increase Credibility</button>
        </div>
      ))}
    </div>
  );
};

export default AdminCredibility;