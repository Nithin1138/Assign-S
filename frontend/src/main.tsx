import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import * as pdfjsLib from 'pdfjs-dist';
import App from './App.tsx';
import './index.css';

// Configure PDF.js worker globally
pdfjsLib.GlobalWorkerOptions.workerSrc = 
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;


// ── Define ReadableStream Async Iterator Polyfill (Definitive Fix) ───────────
// This must run before any other code that uses pdfjs-dist or other stream libraries.
if (typeof ReadableStream !== 'undefined' && !(ReadableStream.prototype as any)[Symbol.asyncIterator]) {
  (ReadableStream.prototype as any)[Symbol.asyncIterator] = async function* () {
    const reader = (this as any).getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) return;
        yield value;
      }
    } finally {
      reader.releaseLock();
    }
  };
}

import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "pending-client-id"}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);
