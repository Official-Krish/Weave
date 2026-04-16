import { createRoot } from 'react-dom/client'
import '@fontsource/dm-sans/400.css'
import '@fontsource/dm-sans/500.css'
import '@fontsource/dm-sans/700.css'
import '@fontsource/epilogue/400.css'
import '@fontsource/epilogue/700.css'
import '@fontsource/epilogue/900.css'
import '@fontsource/syne/400.css'
import '@fontsource/syne/700.css'
import '@fontsource/syne/800.css'
import './index.css'
import App from './App.tsx'
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
)
