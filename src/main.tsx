import React from 'react';
import ReactDOM from 'react-dom/client';
import './main.css';
import { config } from "./config";
import SnapWeb from './components/SnapWeb';
import { SnapControl } from './snapcontrol';



const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const snapcontrol = new SnapControl(config.baseUrl);

console.log(`Welcome to ${import.meta.env.VITE_APP_NAME} ${import.meta.env.VITE_APP_VERSION}`)

root.render(
  <React.StrictMode>
    <SnapWeb snapcontrol={snapcontrol} />
  </React.StrictMode>
);
