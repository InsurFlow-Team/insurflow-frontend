import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppRouter } from './routes/AppRouter'
import './styles/theme.css'
import './styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
)