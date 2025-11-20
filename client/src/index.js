import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global.css";
import logger from "./utils/logger";

// Performance monitoring (development only)
if (process.env.NODE_ENV === 'development') {
  const startTime = performance.now();
  const renderStart = performance.now();

  const root = ReactDOM.createRoot(document.getElementById("root"));

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // Log performance metrics
  const renderEnd = performance.now();
  logger.log(`🚀 App initialization took ${renderEnd - startTime}ms`);
  logger.log(`⚡ React render took ${renderEnd - renderStart}ms`);
} else {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}