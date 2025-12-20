import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../utils/api";
import "./ClaimEvaluation.css";

const ClaimEvaluation = () => {
  const { id } = useParams();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [voteData, setVoteData] = useState({
    rawVotes: { agree: 0, disagree: 0 },
    weightedVotes: { agree: 0, disagree: 0 }
  });
  const [truthPercentage, setTruthPercentage] = useState(0);
  
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
  
  // Helper function to get credibility score for a specific domain
  const getDomainCredibilityScore = (user, domain) => {
    const domainIndex = getDomainIndex(domain);
    if (user?.credibilityScore && Array.isArray(user.credibilityScore)) {
      return user.credibilityScore[domainIndex] || 0.3;
    }
    return user?.credibilityScore || 0.3;
  };

  // Fetch user data to ensure authentication is set up
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get("/auth/me");
        // Update localStorage with fresh user data
        localStorage.setItem("user", JSON.stringify(response.data));
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchClaimDetails = async () => {
      try {
        console.log("Fetching claim with ID:", id);
        setLoading(true);
        const response = await api.get(`/claims/${id}`);
        console.log("Claim response:", response.data);
        setClaim(response.data);
        
        // Calculate vote data
        calculateVoteData(response.data);
      } catch (err) {
        setError("Failed to fetch claim details");
        console.error("Error fetching claim:", err);
        if (err.response) {
          console.error("Error response:", err.response.data);
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchClaimDetails();
    }
  }, [id]);

  const calculateVoteData = (claimData) => {
    // Raw votes calculation
    const rawAgree = claimData.votes.filter(vote => vote.type === "agree").length;
    const rawDisagree = claimData.votes.filter(vote => vote.type === "disagree").length;
    
    // Weighted votes calculation
    let weightedAgree = 0;
    let weightedDisagree = 0;
    
    claimData.votes.forEach(vote => {
      const weight = getDomainCredibilityScore(vote.user, claimData.domain); // Get domain-specific credibility
      if (vote.type === "agree") {
        weightedAgree += weight;
      } else if (vote.type === "disagree") {
        weightedDisagree += weight;
      }
    });
    
    setVoteData({
      rawVotes: { agree: rawAgree, disagree: rawDisagree },
      weightedVotes: { agree: weightedAgree, disagree: weightedDisagree }
    });
    
    // Calculate truth percentage based on weighted votes
    const totalWeightedVotes = weightedAgree + weightedDisagree;
    const truthPercent = totalWeightedVotes > 0 
      ? Math.round((weightedAgree / totalWeightedVotes) * 100) 
      : 0;
      
    setTruthPercentage(truthPercent);
  };

  if (loading) return <div className="evaluation-container"><div className="loading">Loading claim data...</div></div>;
  if (error) return <div className="evaluation-container"><div className="error">{error}</div></div>;
  if (!claim) return <div className="evaluation-container"><div className="error">Claim not found</div></div>;

  return (
    <div className="evaluation-container">
      <div className="claim-header">
        <h2>Claim Evaluation</h2>
        <h3>"{claim.statement}"</h3>
        <div className="claim-meta">
          <span className="domain">Domain: {claim.domain}</span>
          <span className="creator">Created by: {claim.user?.name || "Unknown"}</span>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-container">
          <h3>Raw Votes</h3>
          <div className="pie-chart">
            <PieChart data={voteData.rawVotes} />
          </div>
          <div className="vote-counts">
            <div className="vote-item">
              <span className="vote-label agree">Agree:</span>
              <span className="vote-value">{voteData.rawVotes.agree}</span>
            </div>
            <div className="vote-item">
              <span className="vote-label disagree">Disagree:</span>
              <span className="vote-value">{voteData.rawVotes.disagree}</span>
            </div>
          </div>
        </div>

        <div className="chart-container">
          <h3>Credibility Weighted Votes</h3>
          <div className="pie-chart">
            <PieChart data={voteData.weightedVotes} isWeighted />
          </div>
          <div className="vote-counts">
            <div className="vote-item">
              <span className="vote-label agree">Agree:</span>
              <span className="vote-value">{typeof voteData.weightedVotes.agree === 'number' ? voteData.weightedVotes.agree.toFixed(2) : '0.00'}</span>
            </div>
            <div className="vote-item">
              <span className="vote-label disagree">Disagree:</span>
              <span className="vote-value">{typeof voteData.weightedVotes.disagree === 'number' ? voteData.weightedVotes.disagree.toFixed(2) : '0.00'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="truth-meter">
        <h3>Truth Percentage</h3>
        <div className="meter-container">
          <div className="meter-fill" style={{ width: `${truthPercentage}%` }}>
            <span className="percentage-text">{truthPercentage}%</span>
          </div>
        </div>
        <p className="interpretation">
          {truthPercentage >= 70 ? "Highly credible claim" : 
           truthPercentage >= 50 ? "Moderately credible claim" : 
           "Low credibility claim"}
        </p>
      </div>

      <div className="voter-details">
        <h3>Voter Details</h3>
        <div className="voters-list">
          {claim.votes && claim.votes.length > 0 ? (
            claim.votes.map((vote, index) => (
              <div key={index} className="voter-card">
                <div className="voter-info">
                  <span className="voter-name">{vote.user?.name || "Anonymous"}</span>
                  <span className="voter-email">{vote.user?.email || "N/A"}</span>
                </div>
                <div className="vote-details">
                  <span className={`vote-type ${vote.type}`}>
                    {vote.type.toUpperCase()}
                  </span>
                  <span className="credibility-score">
                    Credibility: {getDomainCredibilityScore(vote.user, claim.domain).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p>No votes yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Proper Pie Chart Component with slices
const PieChart = ({ data, isWeighted = false }) => {
  const total = data.agree + data.disagree;
  if (total === 0) {
    return <div className="no-data">No votes yet</div>;
  }

  const agreePercent = (data.agree / total) * 100;
  const disagreePercent = (data.disagree / total) * 100;
  
  // Calculate coordinates for the slice paths
  const centerX = 16;
  const centerY = 16;
  const radius = 14;
  
  // Convert percentages to angles (in radians)
  const agreeAngle = (agreePercent / 100) * 2 * Math.PI;
  const disagreeAngle = (disagreePercent / 100) * 2 * Math.PI;
  
  // Calculate paths for slices
  let agreePath = "";
  let disagreePath = "";
  
  // Handle different cases
  if (agreePercent === 100) {
    // All agree - draw full circle
    agreePath = `M ${centerX} ${centerY - radius} A ${radius} ${radius} 0 1 1 ${centerX} ${centerY + radius} A ${radius} ${radius} 0 1 1 ${centerX} ${centerY - radius} Z`;
  } else if (disagreePercent === 100) {
    // All disagree - draw full circle
    disagreePath = `M ${centerX} ${centerY - radius} A ${radius} ${radius} 0 1 1 ${centerX} ${centerY + radius} A ${radius} ${radius} 0 1 1 ${centerX} ${centerY - radius} Z`;
  } else {
    // Mixed votes - draw both slices
    agreePath = describeArc(centerX, centerY, radius, 0, agreeAngle);
    disagreePath = describeArc(centerX, centerY, radius, agreeAngle, agreeAngle + disagreeAngle);
  }
  
  return (
    <div className="pie-chart-container">
      <svg viewBox="0 0 32 32" className="pie-svg">
        {/* Agree slice */}
        {agreePath && (
          <path 
            d={agreePath}
            fill="#4CAF50"
          />
        )}
        
        {/* Disagree slice */}
        {disagreePath && (
          <path 
            d={disagreePath}
            fill="#f44336"
          />
        )}
        
        {/* Center circle for donut effect (optional) */}
        {/* <circle cx={centerX} cy={centerY} r={radius * 0.6} fill="white" /> */}
      </svg>
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color agree"></div>
          <span>Agree: {isWeighted ? (typeof data.agree === 'number' ? data.agree.toFixed(2) : '0.00') : data.agree}</span>
        </div>
        <div className="legend-item">
          <div className="legend-color disagree"></div>
          <span>Disagree: {isWeighted ? (typeof data.disagree === 'number' ? data.disagree.toFixed(2) : '0.00') : data.disagree}</span>
        </div>
      </div>
    </div>
  );
};

// Helper function to create SVG path for arc
const describeArc = (x, y, radius, startAngle, endAngle) => {
  // Handle edge case where start and end angles are the same (zero size slice)
  if (Math.abs(endAngle - startAngle) < 0.0001) {
    return `M ${x} ${y} L ${x} ${y}`; // Return a minimal path
  }
  
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  
  const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";
  
  const d = [
    "M", x, y,
    "L", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    "L", x, y
  ].join(" ");
  
  return d;
};

// Helper function to convert polar coordinates to cartesian
const polarToCartesian = (centerX, centerY, radius, angleInRadians) => {
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

export default ClaimEvaluation;