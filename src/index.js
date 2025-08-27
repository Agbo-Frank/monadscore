import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThirdwebProvider } from "thirdweb/react";
import { fetcher } from './Api/fetcher';
import { SWRConfig } from 'swr';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThirdwebProvider>
      <SWRConfig value={{ fetcher }}>
        <App />
      </SWRConfig>
    </ThirdwebProvider>
  </React.StrictMode>
);