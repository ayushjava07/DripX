import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import WalletContextProvider from './Walletprovider';
import '@solana/wallet-adapter-react-ui/styles.css';
import "../src/index.css"
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WalletContextProvider>
      <App />
    </WalletContextProvider>
  </React.StrictMode>
);
