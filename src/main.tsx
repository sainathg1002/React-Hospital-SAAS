import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// Start Mock Service Worker in development/demo mode before mounting
async function prepareApp() {
  const { worker } = await import('./mocks/browser');
  // Starts worker and bypasses unhandled routes (like assets, fonts)
  return worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js'
    }
  });
}

prepareApp().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
