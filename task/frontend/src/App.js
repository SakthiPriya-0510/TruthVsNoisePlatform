import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Register from "./components/Register/Register";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import AdminCredibility from "./pages/Admin/AdminCredibility";
import ClaimEvaluation from "./pages/ClaimEvaluation/ClaimEvaluation";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/credibility" element={<AdminCredibility />} />
        <Route path="/claim/:id" element={<ClaimEvaluation />} />
      </Routes>
    </Router>
  );
}

export default App;
