// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext"; // ✅ Le provider
import Dashboard from "./pages/Dashboard";
import DetailVoyage from "./pages/DetailVoyage";

function App() {
  return (
    <AuthProvider>
      {" "}
      {/* ✅ Ce wrapper est super important */}
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/detail-voyage/:id" element={<DetailVoyage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
