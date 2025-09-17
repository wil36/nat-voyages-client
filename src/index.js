import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

// Load assets from public directory
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Load external CSS and JS files
const loadCSS = (href) => {
  const link = document.createElement("link");
  link.href = href;
  link.rel = "stylesheet";
  link.onload = () => console.log(`CSS loaded: ${href}`);
  link.onerror = () => console.warn(`CSS failed to load: ${href}`);
  document.head.appendChild(link);
};

const loadJS = (src) => {
  const script = document.createElement("script");
  script.src = src;
  script.async = true;
  script.onload = () => console.log(`JS loaded: ${src}`);
  script.onerror = () => console.warn(`JS failed to load: ${src}`);
  document.body.appendChild(script);
};

// Load assets immediately
loadCSS("/assets/css/dashlite.css");
loadCSS("/assets/css/theme.css");

// Load JS files
try {
  loadJS("/assets/js/bundle.js");
  loadJS("/assets/js/scripts.js");
} catch (error) {
  console.warn("External JS files not loaded:", error);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
