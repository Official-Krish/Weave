import { StrictMode } from 'react'
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
import '@fontsource-variable/geist'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
