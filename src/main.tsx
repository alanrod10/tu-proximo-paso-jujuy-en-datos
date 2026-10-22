import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import * as dataAdapter from './data-access/dataAdapter';

if (typeof window !== 'undefined') {
  (window as any).__DATA_ADAPTER__ = dataAdapter;
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
