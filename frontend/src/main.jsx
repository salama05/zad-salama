import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import './index.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'

// Register Service Worker for PWA
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('تحديث جديد متاح لتطبيق زاد السلامة. هل تريد تحديثه الآن؟')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('التطبيق جاهز للعمل بدون إنترنت!')
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
)
