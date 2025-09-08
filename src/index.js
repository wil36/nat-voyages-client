import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import "datatables.net-bs5";
import "datatables.net-responsive-bs5";

// Load assets from public directory
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Load external CSS and JS files in the public directory
document.addEventListener("DOMContentLoaded", () => {
  // Load CSS files
  const loadCSS = (href) => {
    const link = document.createElement("link");
    link.href = `${process.env.PUBLIC_URL}${href}`;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  };

  // Load JS files
  const loadJS = (src) => {
    const script = document.createElement("script");
    script.src = `${process.env.PUBLIC_URL}${src}`;
    script.async = true;
    document.body.appendChild(script);
  };

  // Load the CSS and JS files
  loadCSS("/assets/css/dashlite.css");
  // loadCSS("/assets/css/theme.css");
  loadJS("/assets/js/bundle.js");
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
