import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { UsersApp } from './UsersApp'
import './styles.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './auth/context/AuthProvider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UsersApp />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
