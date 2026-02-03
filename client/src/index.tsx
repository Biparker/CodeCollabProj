import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import logger from './utils/logger';

// Performance monitoring (development only)
if (import.meta.env.DEV) {
  const startTime = performance.now();
  const renderStart = performance.now();

  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  const root = ReactDOM.createRoot(rootElement);

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
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
