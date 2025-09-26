// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import DetailVoyage from "./pages/DetailVoyage";
import Conditions from "./pages/Conditions";
import Aide from "./pages/Aide";
import Contact from "./pages/Contact";

function App() {
  return (
    <AuthProvider>
      {" "}
      {/* ✅ Ce wrapper est super important */}
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/detail-voyage/:id" element={<DetailVoyage />} />
          <Route path="/conditions" element={<Conditions />} />
          <Route path="/aide" element={<Aide />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
