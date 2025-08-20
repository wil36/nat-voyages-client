// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext"; // ✅ Le provider
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import DetailVoyage from "./pages/DetailVoyage";
import ProfilUser from "./pages/ProfilUser";
import SignupPage from "./pages/SignupPage";

function App() {
  return (
    <AuthProvider>
      {" "}
      {/* ✅ Ce wrapper est super important */}
      <Router>
        <Routes>
          {/* <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} /> */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/detail-voyage/:id" element={<DetailVoyage />} />
          {/* <Route path="/profil-user" element={<ProfilUser />} /> */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
