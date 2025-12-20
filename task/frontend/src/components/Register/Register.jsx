import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    code: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ======================
  // SEND OTP
  // ======================
  const handleSendCode = async () => {
    try {
      if (!form.name || !form.email) {
        alert("Name and Email are required");
        return;
      }

      const res = await api.post("/auth/send-otp", {
        name: form.name,
        email: form.email
      });

      setUserId(res.data.userId);
      setStep(2);
    } catch (err) {
      console.error(err);
      alert("Failed to send code");
    }
  };

  // ======================
  // VERIFY OTP & SET PASSWORD
  // ======================
  const handleVerify = async () => {
    try {
      if (!form.code || !form.password) {
        alert("Code and Password are required");
        return;
      }

      await api.post("/auth/verify", {
        userId,
        otp: form.code,
        password: form.password
      });

      alert("Account verified successfully");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Invalid code");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Welcome to TruthVsNoise </h2>
<h2>Platform</h2>

        {step === 1 && (
          <>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />

            <button onClick={handleSendCode}>Send Code</button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              type="text"
              name="code"
              placeholder="Enter Code"
              value={form.code}
              onChange={handleChange}
            />

            <input
              type="password"
              name="password"
              placeholder="Set Password"
              value={form.password}
              onChange={handleChange}
            />

            <button onClick={handleVerify}>Verify & Register</button>
          </>
        )}

        <p className="login-text">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            style={{ cursor: "pointer", color: "#6d4300" }}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
