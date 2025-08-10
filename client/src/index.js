import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global.css";

// Performance monitoring
const startTime = performance.now();

const root = ReactDOM.createRoot(document.getElementById("root"));

// Measure initial render time
const renderStart = performance.now();

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Log performance metrics
const renderEnd = performance.now();
console.log(`🚀 App initialization took ${renderEnd - startTime}ms`);
console.log(`⚡ React render took ${renderEnd - renderStart}ms`);