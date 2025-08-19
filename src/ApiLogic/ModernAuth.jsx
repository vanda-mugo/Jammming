import { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { spotifyAuthPKCE } from './spotifyAuthPKCE';
import './ModernAuth.css';

const ModernAuth = ({ onAuthChange }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const checkAuthStatus = useCallback(async () => {
        try {
            setLoading(true);
            const authenticated = await spotifyAuthPKCE.isAuthenticated();
            setIsAuthenticated(authenticated);
            
            if (authenticated) {
                const userProfile = await spotifyAuthPKCE.getUserProfile();
                setUser(userProfile);
            }
            
            onAuthChange?.(authenticated);
        } catch (error) {
            console.error('Error checking auth status:', error);
            setError('Failed to check authentication status');
        } finally {
            setLoading(false);
        }
    }, [onAuthChange]);

    const handleCallback = useCallback(async () => {
        try {
            const tokens = await spotifyAuthPKCE.handleCallback();
            if (tokens) {
                await checkAuthStatus();
            }
        } catch (error) {
            console.error('Error handling callback:', error);
            setError('Authentication failed. Please try again.');
        }
    }, [checkAuthStatus]);

    useEffect(() => {
        checkAuthStatus();
        handleCallback();
    }, [checkAuthStatus, handleCallback]);

    const handleLogin = async () => {
        try {
            setError(null);
            await spotifyAuthPKCE.authorize();
        } catch (error) {
            console.error('Login error:', error);
            setError('Failed to initiate login');
        }
    };

    const handleLogout = () => {
        spotifyAuthPKCE.logout();
        setIsAuthenticated(false);
        setUser(null);
        onAuthChange?.(false);
    };

    if (loading) {
        return (
            <div className="auth-container">
                <div className="auth-loading">
                    <div className="spotify-loader"></div>
                    <p>Checking authentication...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="auth-container">
                <div className="auth-error">
                    <div className="error-icon">⚠️</div>
                    <p>{error}</p>
                    <button onClick={() => setError(null)} className="retry-button">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            {!isAuthenticated ? (
                <div className="login-section">
                    <div className="login-content">
                        <div className="spotify-branding">
                            <div className="spotify-icon">
                                <svg viewBox="0 0 24 24" className="spotify-logo">
                                    <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.062 14.462c-.168.295-.525.39-.82.223-2.244-1.371-5.068-1.682-8.398-.922-.348.08-.695-.145-.773-.49-.08-.346.145-.693.49-.773 3.638-.83 6.75-.48 9.293 1.065.294.168.39.524.223.82l-.015.078v-.001zm1.172-2.606c-.203.355-.635.468-.99.264-2.57-1.58-6.484-2.037-9.524-1.115-.394.12-.808-.103-.928-.496-.12-.394.103-.808.496-.928 3.477-1.055 7.854-.546 10.682 1.275.354.203.468.635.264.99v.01zm.1-2.707C14.736 8.618 8.56 8.4 4.992 9.502c-.464.143-.952-.118-1.096-.582-.144-.464.118-.952.582-1.096C8.6 6.705 15.388 6.954 18.914 9.29c.423.225.578.747.353 1.17-.226.423-.747.578-1.17.353l.037.02z"/>
                                </svg>
                            </div>
                            <h1>Connect to Spotify</h1>
                            <p>Sign in to create and manage your playlists</p>
                        </div>
                        
                        <button 
                            onClick={handleLogin}
                            className="spotify-login-button"
                        >
                            <span className="button-content">
                                <svg className="spotify-button-icon" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.062 14.462c-.168.295-.525.39-.82.223-2.244-1.371-5.068-1.682-8.398-.922-.348.08-.695-.145-.773-.49-.08-.346.145-.693.49-.773 3.638-.83 6.75-.48 9.293 1.065.294.168.39.524.223.82l-.015.078v-.001zm1.172-2.606c-.203.355-.635.468-.99.264-2.57-1.58-6.484-2.037-9.524-1.115-.394.12-.808-.103-.928-.496-.12-.394.103-.808.496-.928 3.477-1.055 7.854-.546 10.682 1.275.354.203.468.635.264.99v.01zm.1-2.707C14.736 8.618 8.56 8.4 4.992 9.502c-.464.143-.952-.118-1.096-.582-.144-.464.118-.952.582-1.096C8.6 6.705 15.388 6.954 18.914 9.29c.423.225.578.747.353 1.17-.226.423-.747.578-1.17.353l.037.02z"/>
                                </svg>
                                Log in with Spotify
                            </span>
                        </button>
                        
                        <div className="login-info">
                            <p>Secure authentication with PKCE</p>
                            <p className="terms">
                                By continuing, you agree to Spotify&apos;s{' '}
                                <a href="https://www.spotify.com/legal/end-user-agreement/" target="_blank" rel="noopener noreferrer">
                                    Terms of Service
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="user-section">
                    <div className="user-info">
                        {user?.images?.[0]?.url && (
                            <img 
                                src={user.images[0].url} 
                                alt="Profile" 
                                className="user-avatar"
                            />
                        )}
                        <div className="user-details">
                            <span className="user-name">{user?.display_name || 'Spotify User'}</span>
                            <span className="user-subscription">{user?.product || 'free'} user</span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleLogout}
                        className="logout-button"
                        title="Log out"
                    >
                        <svg viewBox="0 0 24 24" className="logout-icon">
                            <path fill="currentColor" d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
};

ModernAuth.propTypes = {
    onAuthChange: PropTypes.func,
};

export default ModernAuth;
