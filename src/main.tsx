import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from './components/ui/toast'
import { RecordsProvider } from './hooks/useRecords'
import App from './App.tsx'
import './styles/tokens.css'
import './styles/components.css'
import './styles/backgrounds.css'
import './index.css'

document.documentElement.dataset.theme = 'blackgold'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="/driverflow">
      <RecordsProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </RecordsProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
