import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import AdminApp from './app/admin/AdminApp'
import CalendarPage from './app/pages/CalendarPage'
import ResourcesPage from './app/pages/ResourcesPage'
import DayStonesPage from './app/pages/DayStonesPage'
import './styles/index.css'
import faviconUrl from './assets/feef32863d06775804f6af6bbe43f8df154b97b4.png?w=64&format=webp&quality=80'

document.documentElement.classList.add('dark')

const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
if (favicon) {
  favicon.href = faviconUrl
  favicon.type = 'image/webp'
}

function chooseRoot() {
  const path = window.location.pathname.toLowerCase()
  if (path.startsWith('/admin')) return <AdminApp />
  if (path.startsWith('/calendar')) return <CalendarPage />
  if (path.startsWith('/resources')) return <ResourcesPage />
  if (path.startsWith('/day-stones')) return <DayStonesPage />
  return <App />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {chooseRoot()}
  </React.StrictMode>,
)
