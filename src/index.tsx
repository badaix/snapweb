import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { SnapControl, Snapcast } from './snapcontrol';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

let snapcontrol = new SnapControl("ws://192.168.0.3:1780");

root.render(
  <React.StrictMode>
    <App snapcontrol={snapcontrol} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
