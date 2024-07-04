// import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import './assets/css/globals.css'
import '@/locales/index'

const theme = localStorage.getItem('theme') || 'light'

if (theme === 'dark') {
  document.documentElement.classList.add('dark')
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>
)
