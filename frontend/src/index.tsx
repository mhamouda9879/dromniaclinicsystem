import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Emergency fix for click blocking
const rootElement = document.getElementById('root');
if (rootElement) {
  rootElement.style.pointerEvents = 'auto';
  rootElement.style.position = 'relative';
  rootElement.style.zIndex = '1';
}

// Remove any potential blocking overlays
setTimeout(() => {
  document.querySelectorAll('*').forEach((el) => {
    const computed = window.getComputedStyle(el as Element);
    if (computed.position === 'fixed' && 
        computed.pointerEvents === 'none' &&
        (el as HTMLElement).offsetWidth === window.innerWidth &&
        (el as HTMLElement).offsetHeight === window.innerHeight) {
      (el as HTMLElement).style.display = 'none';
    }
    // Force enable pointer events
    if ((el as HTMLElement).style.pointerEvents === 'none') {
      (el as HTMLElement).style.pointerEvents = 'auto';
    }
  });
}, 500);

const root = ReactDOM.createRoot(
  rootElement as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
