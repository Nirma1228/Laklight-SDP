import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ToastProvider } from './components/ToastNotification'
import './index.css'

console.log('main.jsx: bootstrapping application...');

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <BrowserRouter>
      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>
  );
  console.log('main.jsx: render call complete');
} else {
  console.error('CRITICAL: root element not found!');
}
