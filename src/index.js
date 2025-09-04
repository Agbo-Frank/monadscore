import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { fetcher } from './Api/fetcher';
import { SWRConfig } from 'swr';
import { Web3Provider } from './provider/connectkit';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Web3Provider>
      <SWRConfig value={{ fetcher }}>
        <App />
      </SWRConfig>
    </Web3Provider>
  </React.StrictMode>
);