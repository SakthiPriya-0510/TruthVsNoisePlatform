import React, { useState } from "react";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";
import "./Login.css";
const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    console.log("Attempting login with:", { email, password });
    const res = await api.post("/auth/login", {
      email,
      password,
    });
   
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    
    // Debug: Check what we stored
    console.log("Stored token:", localStorage.getItem("token"));
    console.log("Stored user:", localStorage.getItem("user"));

    alert("Login successful");

    // Redirect based on role
    if (res.data.user.role === "admin") {
      console.log("Redirecting to admin page");
      navigate("/admin/credibility"); // admin page
    } else {
      console.log("Redirecting to dashboard");
      navigate("/dashboard"); // normal user
    }
   
  } catch (err) {
    console.error("Login error:", err);
    setError(err.response?.data?.message || "Login failed");
  } finally {
    setLoading(false);
  }
};  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome Back</h2>
        <p className="subtitle">Login to your account</p>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="register-text">
          Don’t have an account?{" "}
          <span onClick={() => navigate("/")}>Register</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
