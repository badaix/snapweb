import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { config } from "./config";
import SnapWeb from './components/SnapWeb';
import reportWebVitals from './reportWebVitals';
import { SnapControl } from './snapcontrol';



const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

let snapcontrol = new SnapControl(config.baseUrl);


root.render(
  <React.StrictMode>
    <SnapWeb snapcontrol={snapcontrol} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
