import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../pages/Dashboard/Dashboard.css";
import api from "../../utils/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  
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
  
  // Helper function to get credibility score for a domain
  const getCredibilityScore = (domain) => {
    const domainIndex = getDomainIndex(domain);
    if (user?.credibilityScore && Array.isArray(user.credibilityScore)) {
      return user.credibilityScore[domainIndex]?.toFixed(2) || '0.30';
    }
    return '0.30';
  };

  const [claims, setClaims] = useState([]);
  const [domain, setDomain] = useState("");
  const [statement, setStatement] = useState("");
  const [loading, setLoading] = useState(true);
  const [knowledgeDomain, setKnowledgeDomain] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [votedClaims, setVotedClaims] = useState({}); // claimId -> true

  // ----------- LOGOUT -----------
  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    
    // Redirect to login page
    navigate("/login");
  };

  // ----------- FETCH USER DATA -----------
  const fetchUserData = async () => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data);
      // Update localStorage with fresh user data
      localStorage.setItem("user", JSON.stringify(response.data));
    } catch (err) {
      console.error("Failed to fetch user data:", err);
    }
  };

  // ----------- ROLE PROTECTION -----------
  useEffect(() => {
    fetchUserData();
  }, []);

  // ----------- FETCH CLAIMS -----------
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await api.get("/claims");
        const fetchedClaims = response.data;

        setClaims(fetchedClaims);

        // Map voted claims based on backend voters array
        const voted = {};
        fetchedClaims.forEach((claim) => {
          if (claim.voters && claim.voters.includes(user._id)) {
            voted[claim._id] = true;
          }
        });

        setVotedClaims(voted);
      } catch (err) {
        alert("Failed to fetch claims");
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, [user._id]);

  // ----------- CREATE CLAIM -----------
  const handleCreateClaim = async () => {
    if (!domain || !statement) {
      alert("Domain and statement required");
      return;
    }

    try {
      const response = await api.post("/claims", { domain, statement });

      const newClaim = {
        ...response.data,
        userName: user.name,
        voters: [],
      };

      setClaims([newClaim, ...claims]);
      setDomain("");
      setStatement("");
    } catch (error) {
      alert(error.message || "Failed to submit claim");
    }
  };

  // ----------- VOTE -----------
  const handleVote = async (claimId, type) => {
    if (votedClaims[claimId]) {
      alert("You can vote only once per claim!");
      return;
    }

    if (!window.confirm("Are you sure? You cannot change your vote later.")) return;

    try {
      const response = await api.post(`/claims/${claimId}/vote`, { vote: type });

      setClaims(claims.map((c) => (c._id === claimId ? response.data : c)));
      setVotedClaims({ ...votedClaims, [claimId]: true });
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit vote");
    }
  };

  // ----------- SUBMIT CREDIBILITY -----------
  const handleCredibilitySubmit = async () => {
    if (!knowledgeDomain || !linkedin) {
      alert("All fields required");
      return;
    }

    try {
      await api.post("/credibility", {
        userId: user._id,
        knowledgeDomain,
        linkedin,
      });

      alert("Credibility details submitted (admin verification pending)");
      setKnowledgeDomain("");
      setLinkedin("");
    } catch (error) {
      alert(error.message || "Failed to submit credibility");
    }
  };

  // ----------- RENDER -----------
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="welcome">Welcome, {user?.name}</h2>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
      
      {/* Display credibility scores for each domain */}
      <div className="credibility-scores-section">
        <h3>Your Credibility Scores by Domain</h3>
        <div className="credibility-grid">
          {domains.map((domain, index) => (
            <div key={index} className="credibility-card">
              <div className="domain-name">{domain}</div>
              <div className="credibility-score">
                {user?.credibilityScore && Array.isArray(user.credibilityScore) 
                  ? (user.credibilityScore[index] || 0.3).toFixed(2)
                  : '0.30'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-grid">
        {/* LEFT - CLAIMS */}
        <div className="claims-section">
          <h3>Claims</h3>

          {loading ? (
            <p>Loading claims...</p>
          ) : claims.length === 0 ? (
            <p className="empty">No claims submitted yet</p>
          ) : (
            claims.map((claim) => (
              <div key={claim._id} className="claim-card">
                <div className="claim-header">
                  <span className="domain-tag">{claim.domain}</span>
                  <span className="user-name">{claim.userName}</span>
                  <span
                    className="graph-icon"
                    onClick={() => navigate(`/claim/${claim._id}`)}
                    title="View vote & credibility"
                  >
                    📊
                  </span>
                </div>

                <div className="claim-statement">
                  <p>{claim.statement}</p>
                </div>

                <div className="claim-actions">
                  <button
                    className="vote-btn"
                    disabled={votedClaims[claim._id]}
                    onClick={() => handleVote(claim._id, "agree")}
                  >
                    👍
                  </button>

                  <button
                    className="vote-btn"
                    disabled={votedClaims[claim._id]}
                    onClick={() => handleVote(claim._id, "disagree")}
                  >
                    👎
                  </button>
                </div>

                {votedClaims[claim._id] && <p className="voted-msg">✅ You already voted</p>}
              </div>
            ))
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="side-section">
          <div className="card">
            <h4>Create Claim</h4>
            <input
              type="text"
              placeholder="Domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
            <textarea
              placeholder="Statement"
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
            />
            <button onClick={handleCreateClaim}>Submit</button>
          </div>

          <div className="card">
            <h4>Increase Credibility</h4>
            <select
              value={knowledgeDomain}
              onChange={(e) => setKnowledgeDomain(e.target.value)}
            >
              <option value="">Select Domain Knowledge</option>
              <option value="Environment & Climate">Environment & Climate
</option>
              <option value="Entertainment & Celebrities">Entertainment & Celebrities
</option>
              <option value="Law, Rights & Ethics">Law, Rights & Ethics
</option>
              <option value="Business & Economy">Business & Economy
</option><option value="News & Media">News & Media

</option><option value="Politics & Government">Politics & Government

</option><option value="Health & Medicine">Health & Medicine
</option>
<option value="Science & Technology">Science & Technology
</option>
            </select>
            <input
              type="text"
              placeholder="LinkedIn Profile URL"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
            />
            <button onClick={handleCredibilitySubmit}>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;