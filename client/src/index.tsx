import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AppWrapper } from './store';
import { AuthProvider } from './store/auth';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <AppWrapper>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AppWrapper>

  </React.StrictMode>
);

