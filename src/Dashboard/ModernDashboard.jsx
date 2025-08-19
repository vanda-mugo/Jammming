import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { spotifyAuthPKCE } from '../ApiLogic/spotifyAuthPKCE';
import { savePlaylist } from '../ApiLogic/savePlaylist';
import { fetchPlaylistTracks, getUserPlaylist } from '../ApiLogic/playlistLogic';
import './ModernDashboard.css';
import ModernSearchBar from '../SearchBar/ModernSearchBar';
import ModernTrack from '../Track/ModernTrack';

const ModernDashboard = ({ onAuthChange }) => {
    // Core state
    const [user, setUser] = useState(null);
    const [activeView, setActiveView] = useState('home'); // home, search, library, playlist
    const [isLoading, setIsLoading] = useState(false);
    
    // Search state
    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    
    // Playlist state
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [currentPlaylist, setCurrentPlaylist] = useState(null);
    const [playlistTracks, setPlaylistTracks] = useState([]);
    // Remove unused state variables
    // const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
    
    // New playlist creation
    const [newPlaylistName, setNewPlaylistName] = useState("My New Playlist");
    const [newPlaylistTracks, setNewPlaylistTracks] = useState([]);
    
    // Refs - for future use
    // const fetchPlaylistsRef = useRef(null);

    // Initialize dashboard
    const initializeDashboard = useCallback(async () => {
        try {
            setIsLoading(true);
            const userProfile = await spotifyAuthPKCE.getUserProfile();
            setUser(userProfile);
            await loadUserPlaylists();
        } catch (error) {
            console.error('Failed to initialize dashboard:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        initializeDashboard();
    }, [initializeDashboard]);

    const loadUserPlaylists = async () => {
        try {
            const playlists = await getUserPlaylist();
            setUserPlaylists(playlists || []);
        } catch (error) {
            console.error('Failed to load playlists:', error);
        }
    };

    // Search functionality
    const handleSearch = async () => {
        if (!query.trim()) return;

        const accessToken = await spotifyAuthPKCE.getAccessToken();
        if (!accessToken) {
            await spotifyAuthPKCE.authorize();
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(`https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(query)}&limit=50`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch data from the Spotify API");
            }

            const data = await response.json();
            const tracks = data.tracks.items.map(track => ({
                id: track.id,
                name: track.name,
                artist: track.artists[0].name,
                album: track.album.name,
                uri: track.uri,
                explicit: track.explicit,
                duration_ms: track.duration_ms,
                preview_url: track.preview_url,
                artwork: track.album.images[0]?.url,
                popularity: track.popularity
            }));

            setSearchResults(tracks);
            setActiveView('search');
        } catch (error) {
            console.error("Error fetching data from the Spotify API", error);
        } finally {
            setIsSearching(false);
        }
    };

    // Playlist management
    const selectPlaylist = async (playlist) => {
        setIsLoading(true);
        try {
            setCurrentPlaylist(playlist);
            const tracks = await fetchPlaylistTracks(playlist.id);
            const formattedTracks = tracks?.map(track => ({
                id: track.track.id,
                name: track.track.name,
                artist: track.track.artists[0].name,
                album: track.track.album.name,
                uri: track.track.uri,
                explicit: track.track.explicit,
                duration_ms: track.track.duration_ms,
                artwork: track.track.album.images[0]?.url,
                added_at: track.added_at
            })) || [];
            
            setPlaylistTracks(formattedTracks);
            setActiveView('playlist');
        } catch (error) {
            console.error('Failed to load playlist:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Track management
    const addTrackToNewPlaylist = (track) => {
        if (!newPlaylistTracks.find(t => t.id === track.id)) {
            setNewPlaylistTracks([...newPlaylistTracks, track]);
        }
    };

    const removeTrackFromNewPlaylist = (track) => {
        setNewPlaylistTracks(newPlaylistTracks.filter(t => t.id !== track.id));
    };

    // Track management for existing playlists (future implementation)
    // const addTrackToExistingPlaylist = async (playlistId, trackUri, track) => {
    //     // Implementation for adding to existing playlist
    //     console.log('Adding track to existing playlist:', { playlistId, trackUri, track });
    // };

    const removeTrackFromExistingPlaylist = async (playlistId, trackUri, track) => {
        // Implementation for removing from existing playlist
        console.log('Removing track from existing playlist:', { playlistId, trackUri, track });
    };

    // Save new playlist
    const saveNewPlaylist = async () => {
        if (newPlaylistTracks.length === 0) return;

        setIsLoading(true);
        try {
            const trackUris = newPlaylistTracks.map(track => track.uri);
            await savePlaylist(newPlaylistName, 'Created with Jamming', trackUris);
            
            // Reset and refresh
            setNewPlaylistTracks([]);
            setNewPlaylistName("My New Playlist");
            await loadUserPlaylists();
            setActiveView('library');
        } catch (error) {
            console.error('Failed to save playlist:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const startNewPlaylist = () => {
        setNewPlaylistTracks([]);
        setNewPlaylistName("My New Playlist");
        setActiveView('create');
    };

    const handleLogout = () => {
        spotifyAuthPKCE.logout();
        onAuthChange?.(false);
    };

    if (isLoading && !user) {
        return (
            <div className="dashboard-loading">
                <div className="loading-content">
                    <div className="spotify-spinner"></div>
                    <h2>Loading your music...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="modern-dashboard">
            {/* Sidebar Navigation */}
            <aside className="dashboard-sidebar">
                <div className="sidebar-header">
                    <div className="logo-section">
                        <svg className="jamming-logo" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15v-6H8v-2h2V7h2v2h2v2h-2v6h-2z"/>
                        </svg>
                        <h1>Jamming</h1>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <ul className="nav-primary">
                        <li>
                            <button 
                                className={`nav-item ${activeView === 'home' ? 'active' : ''}`}
                                onClick={() => setActiveView('home')}
                            >
                                <svg viewBox="0 0 24 24" className="nav-icon">
                                    <path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                                </svg>
                                Home
                            </button>
                        </li>
                        <li>
                            <button 
                                className={`nav-item ${activeView === 'search' ? 'active' : ''}`}
                                onClick={() => setActiveView('search')}
                            >
                                <svg viewBox="0 0 24 24" className="nav-icon">
                                    <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                                </svg>
                                Search
                            </button>
                        </li>
                        <li>
                            <button 
                                className={`nav-item ${activeView === 'library' ? 'active' : ''}`}
                                onClick={() => setActiveView('library')}
                            >
                                <svg viewBox="0 0 24 24" className="nav-icon">
                                    <path fill="currentColor" d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 5h-3v5.5c0 1.38-1.12 2.5-2.5 2.5S10 13.88 10 12.5s1.12-2.5 2.5-2.5c.57 0 1.08.19 1.5.51V5h4v2zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"/>
                                </svg>
                                Your Library
                            </button>
                        </li>
                    </ul>

                    <div className="nav-divider"></div>

                    <div className="create-playlist-section">
                        <button 
                            className="create-playlist-btn"
                            onClick={startNewPlaylist}
                        >
                            <svg viewBox="0 0 24 24" className="plus-icon">
                                <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                            </svg>
                            Create Playlist
                        </button>
                    </div>

                    <div className="playlists-section">
                        <h3 className="section-title">Recently Created</h3>
                        <ul className="playlist-list">
                            {userPlaylists.slice(0, 5).map((playlist) => (
                                <li key={playlist.id}>
                                    <button 
                                        className={`playlist-item ${currentPlaylist?.id === playlist.id ? 'active' : ''}`}
                                        onClick={() => selectPlaylist(playlist)}
                                    >
                                        <div className="playlist-cover">
                                            {playlist.images?.[0]?.url ? (
                                                <img src={playlist.images[0].url} alt={playlist.name} />
                                            ) : (
                                                <div className="default-cover">
                                                    <svg viewBox="0 0 24 24">
                                                        <path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="playlist-info">
                                            <span className="playlist-name">{playlist.name}</span>
                                            <span className="playlist-meta">{playlist.tracks.total} songs</span>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile">
                        {user?.images?.[0]?.url && (
                            <img src={user.images[0].url} alt="Profile" className="user-avatar" />
                        )}
                        <div className="user-info">
                            <span className="user-name">{user?.display_name}</span>
                            <span className="user-type">{user?.product || 'free'}</span>
                        </div>
                        <button onClick={handleLogout} className="logout-btn" title="Log out">
                            <svg viewBox="0 0 24 24">
                                <path fill="currentColor" d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="dashboard-main">
                {/* Top Bar */}
                <header className="main-header">
                    <div className="header-navigation">
                        <button className="nav-back" disabled>
                            <svg viewBox="0 0 24 24">
                                <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
                            </svg>
                        </button>
                        <button className="nav-forward" disabled>
                            <svg viewBox="0 0 24 24">
                                <path fill="currentColor" d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                            </svg>
                        </button>
                    </div>

                    <div className="header-search">
                        {(activeView === 'search' || activeView === 'home') && (
                            <ModernSearchBar
                                query={query}
                                setQuery={setQuery}
                                onSearch={handleSearch}
                                isLoading={isSearching}
                            />
                        )}
                    </div>

                    <div className="header-actions">
                        <button className="upgrade-btn">
                            <svg viewBox="0 0 24 24" className="premium-icon">
                                <path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                            Get Premium
                        </button>
                    </div>
                </header>

                {/* Content Views */}
                <div className="content-area">
                    {renderActiveView()}
                </div>
            </main>
        </div>
    );

    function renderActiveView() {
        switch (activeView) {
            case 'home':
                return renderHomeView();
            case 'search':
                return renderSearchView();
            case 'library':
                return renderLibraryView();
            case 'playlist':
                return renderPlaylistView();
            case 'create':
                return renderCreatePlaylistView();
            default:
                return renderHomeView();
        }
    }

    function renderHomeView() {
        return (
            <div className="home-view">
                <section className="greeting-section">
                    <h1 className="greeting">
                        Good {getTimeOfDayGreeting()}, {user?.display_name?.split(' ')[0] || 'there'}
                    </h1>
                </section>

                <section className="recent-playlists">
                    <h2 className="section-heading">Recently played</h2>
                    <div className="playlist-grid">
                        {userPlaylists.slice(0, 6).map((playlist) => (
                            <button 
                                key={playlist.id}
                                className="playlist-card"
                                onClick={() => selectPlaylist(playlist)}
                            >
                                <div className="card-cover">
                                    {playlist.images?.[0]?.url ? (
                                        <img src={playlist.images[0].url} alt={playlist.name} />
                                    ) : (
                                        <div className="default-card-cover">
                                            <svg viewBox="0 0 24 24">
                                                <path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <span className="card-title">{playlist.name}</span>
                            </button>
                        ))}
                    </div>
                </section>

                <section className="quick-actions">
                    <h2 className="section-heading">Jump back in</h2>
                    <div className="action-cards">
                        <button className="action-card create-card" onClick={startNewPlaylist}>
                            <div className="action-icon">
                                <svg viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                                </svg>
                            </div>
                            <div className="action-content">
                                <h3>Create a playlist</h3>
                                <p>It&apos;s easy, we&apos;ll help you</p>
                            </div>
                        </button>

                        <button className="action-card search-card" onClick={() => setActiveView('search')}>
                            <div className="action-icon">
                                <svg viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                                </svg>
                            </div>
                            <div className="action-content">
                                <h3>Search for music</h3>
                                <p>Find songs, artists, and albums</p>
                            </div>
                        </button>
                    </div>
                </section>
            </div>
        );
    }

    function renderSearchView() {
        return (
            <div className="search-view">
                {searchResults.length > 0 ? (
                    <>
                        <div className="search-header">
                            <h2>Search results for &quot;{query}&quot;</h2>
                            <span className="results-count">{searchResults.length} songs</span>
                        </div>
                        
                        <div className="search-results">
                            <div className="tracks-grid">
                                {searchResults.map((track, index) => (
                                    <ModernTrack
                                        key={`${track.id}-${index}`}
                                        track={track}
                                        onAdd={addTrackToNewPlaylist}
                                        isRemoval={false}
                                        index={index}
                                        showAddToPlaylist={true}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="search-empty">
                        <div className="search-empty-content">
                            <svg className="search-empty-icon" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                            </svg>
                            <h3>Start searching</h3>
                            <p>Find your favorite songs, artists, and albums</p>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    function renderLibraryView() {
        return (
            <div className="library-view">
                <div className="library-header">
                    <h2>Your Library</h2>
                    <button className="create-playlist-btn-secondary" onClick={startNewPlaylist}>
                        <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                    </button>
                </div>

                <div className="library-content">
                    <div className="playlists-grid">
                        {userPlaylists.map((playlist) => (
                            <div key={playlist.id} className="library-playlist-card" onClick={() => selectPlaylist(playlist)}>
                                <div className="library-card-cover">
                                    {playlist.images?.[0]?.url ? (
                                        <img src={playlist.images[0].url} alt={playlist.name} />
                                    ) : (
                                        <div className="library-default-cover">
                                            <svg viewBox="0 0 24 24">
                                                <path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className="library-card-info">
                                    <h3>{playlist.name}</h3>
                                    <p>{playlist.tracks.total} songs • By {playlist.owner.display_name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    function renderPlaylistView() {
        if (!currentPlaylist) return null;

        return (
            <div className="playlist-view">
                <div className="playlist-header-section">
                    <div className="playlist-cover-large">
                        {currentPlaylist.images?.[0]?.url ? (
                            <img src={currentPlaylist.images[0].url} alt={currentPlaylist.name} />
                        ) : (
                            <div className="default-cover-large">
                                <svg viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                                </svg>
                            </div>
                        )}
                    </div>
                    <div className="playlist-details">
                        <span className="playlist-type">Playlist</span>
                        <h1 className="playlist-title">{currentPlaylist.name}</h1>
                        <div className="playlist-meta">
                            <span>{currentPlaylist.owner.display_name}</span>
                            <span>•</span>
                            <span>{currentPlaylist.tracks.total} songs</span>
                        </div>
                    </div>
                </div>

                <div className="playlist-controls">
                    <button className="play-button">
                        <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M8 5v14l11-7z"/>
                        </svg>
                    </button>
                    <button className="more-options">
                        <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                        </svg>
                    </button>
                </div>

                <div className="playlist-tracks">
                    <div className="tracks-header">
                        <span className="track-number">#</span>
                        <span className="track-title">Title</span>
                        <span className="track-album">Album</span>
                        <span className="track-date">Date added</span>
                        <span className="track-duration">Duration</span>
                    </div>
                    
                    <div className="tracks-list">
                        {playlistTracks.map((track, index) => (
                            <ModernTrack
                                key={`${track.id}-${index}`}
                                track={track}
                                onRemove={removeTrackFromExistingPlaylist}
                                isRemoval={true}
                                index={index}
                                playlistId={currentPlaylist.id}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    function renderCreatePlaylistView() {
        return (
            <div className="create-playlist-view">
                <div className="create-playlist-header">
                    <div className="create-cover">
                        <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                        </svg>
                    </div>
                    <div className="create-details">
                        <span className="playlist-type">Playlist</span>
                        <input 
                            type="text"
                            value={newPlaylistName}
                            onChange={(e) => setNewPlaylistName(e.target.value)}
                            className="playlist-name-input"
                            placeholder="My Playlist"
                        />
                        <div className="playlist-meta">
                            <span>{user?.display_name}</span>
                            <span>•</span>
                            <span>{newPlaylistTracks.length} songs</span>
                        </div>
                    </div>
                </div>

                <div className="create-playlist-controls">
                    <button 
                        className="save-playlist-btn"
                        onClick={saveNewPlaylist}
                        disabled={newPlaylistTracks.length === 0}
                    >
                        Save to Spotify
                    </button>
                    <button 
                        className="search-music-btn"
                        onClick={() => setActiveView('search')}
                    >
                        Search for music
                    </button>
                </div>

                {newPlaylistTracks.length > 0 ? (
                    <div className="create-tracks-list">
                        {newPlaylistTracks.map((track, index) => (
                            <ModernTrack
                                key={`${track.id}-${index}`}
                                track={track}
                                onRemove={removeTrackFromNewPlaylist}
                                isRemoval={true}
                                index={index}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="create-empty-state">
                        <div className="empty-state-content">
                            <svg viewBox="0 0 24 24" className="empty-state-icon">
                                <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                            </svg>
                            <h3>Let&apos;s find some music for your playlist</h3>
                            <p>Search for songs you love and add them to your playlist</p>
                            <button 
                                className="search-cta-btn"
                                onClick={() => setActiveView('search')}
                            >
                                Search for music
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    function getTimeOfDayGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return 'morning';
        if (hour < 18) return 'afternoon';
        return 'evening';
    }
};

ModernDashboard.propTypes = {
    onAuthChange: PropTypes.func,
};

export default ModernDashboard;
