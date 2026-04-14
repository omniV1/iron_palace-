import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import './styles/index.css'
import faviconUrl from './assets/feef32863d06775804f6af6bbe43f8df154b97b4.png?w=64&format=webp&quality=80'

const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
if (favicon) {
  favicon.href = faviconUrl
  favicon.type = 'image/webp'
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
