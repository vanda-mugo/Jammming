import React, { useState, useEffect } from 'react'
import './App.css'
import './ModernApp.css'
import ModernAuth from './ApiLogic/ModernAuth'
import ModernDashboard from './Dashboard/ModernDashboard'
import { spotifyAuthPKCE } from './ApiLogic/spotifyAuthPKCE'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      const token = await spotifyAuthPKCE.getAccessToken()
      setIsAuthenticated(!!token)
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuthChange = (authState) => {
    setIsAuthenticated(authState)
  }

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading Jamming...</p>
      </div>
    )
  }

  return (
    <div className="App">
      {isAuthenticated ? (
        <ModernDashboard onAuthChange={handleAuthChange} />
      ) : (
        <div className="auth-container">
          <div className="hero-section">
            <div className="hero-content">
              <h1 className="hero-title">Jamming</h1>
              <p className="hero-subtitle">Create and manage your Spotify playlists with ease</p>
              <ModernAuth onAuthChange={handleAuthChange} />
            </div>
          </div>
          <div className="features-section">
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🎵</div>
                <h3>Search Music</h3>
                <p>Find your favorite tracks from Spotify&apos;s vast library</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📝</div>
                <h3>Create Playlists</h3>
                <p>Build custom playlists and save them directly to Spotify</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🎧</div>
                <h3>Manage Library</h3>
                <p>Access and organize your existing Spotify playlists</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
