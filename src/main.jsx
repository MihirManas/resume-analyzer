import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import './index.css'

const container = document.getElementById('root');
const rootElement = (
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);

if (container.hasChildNodes() && container.innerHTML !== '<!--app-html-->') {
  hydrateRoot(container, rootElement);
} else {
  createRoot(container).render(rootElement);
}
