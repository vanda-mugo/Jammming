import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import ModernTrack from '../Track/ModernTrack';
import './ModernPlaylist.css';

const ModernPlaylist = ({ 
    playlistName, 
    playlistTracks = [], 
    onRemove, 
    onNameChange, 
    onSave, 
    isExistingPlaylist = false,
    playlistId,
    isLoading = false 
}) => {
    const [editingName, setEditingName] = useState(false);
    const [tempName, setTempName] = useState(playlistName);
    const [isSaving, setIsSaving] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        setTempName(playlistName);
    }, [playlistName]);

    useEffect(() => {
        if (editingName && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingName]);

    const handleNameSubmit = async () => {
        if (!tempName.trim()) {
            setTempName(playlistName);
            setEditingName(false);
            return;
        }

        if (tempName !== playlistName) {
            try {
                if (isExistingPlaylist) {
                    await onNameChange(playlistId, tempName);
                } else {
                    onNameChange(tempName);
                }
            } catch (error) {
                console.error('Error updating playlist name:', error);
                setTempName(playlistName); // Reset to original name on error
            }
        }
        setEditingName(false);
    };

    const handleNameCancel = () => {
        setTempName(playlistName);
        setEditingName(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleNameSubmit();
        } else if (e.key === 'Escape') {
            handleNameCancel();
        }
    };

    const handleSave = async () => {
        if (isSaving || playlistTracks.length === 0) return;
        
        setIsSaving(true);
        try {
            await onSave();
        } catch (error) {
            console.error('Error saving playlist:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="modern-playlist">
            <div className="playlist-header">
                <div className="playlist-icon">
                    <svg viewBox="0 0 24 24" className="playlist-svg">
                        <path 
                            fill="currentColor" 
                            d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"
                        />
                    </svg>
                </div>
                
                <div className="playlist-info">
                    <span className="playlist-type">
                        {isExistingPlaylist ? 'Existing Playlist' : 'New Playlist'}
                    </span>
                    
                    {editingName ? (
                        <div className="name-edit-container">
                            <input
                                ref={inputRef}
                                type="text"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                onBlur={handleNameSubmit}
                                onKeyDown={handleKeyPress}
                                className="name-input"
                                maxLength={100}
                            />
                            <div className="name-edit-actions">
                                <button 
                                    onClick={handleNameSubmit}
                                    className="name-save-btn"
                                    title="Save name"
                                >
                                    ✓
                                </button>
                                <button 
                                    onClick={handleNameCancel}
                                    className="name-cancel-btn"
                                    title="Cancel"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ) : (
                        <h2 
                            className="playlist-name"
                            onClick={() => setEditingName(true)}
                            title="Click to edit playlist name"
                        >
                            {playlistName}
                        </h2>
                    )}
                    
                    <div className="playlist-meta">
                        <span className="track-count">
                            {playlistTracks.length} {playlistTracks.length === 1 ? 'song' : 'songs'}
                        </span>
                        {playlistTracks.length > 0 && (
                            <span className="duration-separator">•</span>
                        )}
                    </div>
                </div>
                
                {playlistTracks.length > 0 && (
                    <button 
                        onClick={handleSave}
                        className="save-button"
                        disabled={isSaving || isLoading}
                        title={isExistingPlaylist ? 'Update playlist' : 'Save to Spotify'}
                    >
                        {isSaving ? (
                            <div className="save-loader">
                                <div className="save-spinner"></div>
                            </div>
                        ) : (
                            <>
                                <svg viewBox="0 0 24 24" className="save-icon">
                                    <path 
                                        fill="currentColor" 
                                        d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"
                                    />
                                </svg>
                                {isExistingPlaylist ? 'Update' : 'Save to Spotify'}
                            </>
                        )}
                    </button>
                )}
            </div>

            <div className="playlist-content">
                {isLoading ? (
                    <div className="playlist-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading playlist...</p>
                    </div>
                ) : playlistTracks.length === 0 ? (
                    <div className="empty-playlist">
                        <div className="empty-icon">
                            <svg viewBox="0 0 24 24" className="empty-svg">
                                <path 
                                    fill="currentColor" 
                                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"
                                />
                            </svg>
                        </div>
                        <h3>Your playlist is empty</h3>
                        <p>Search for songs and add them to build your playlist</p>
                    </div>
                ) : (
                    <div className="track-list">
                        <div className="track-list-header">
                            <span className="header-index">#</span>
                            <span className="header-title">Title</span>
                            <span className="header-album">Album</span>
                            <span className="header-actions"></span>
                        </div>
                        
                        {playlistTracks.map((track, index) => (
                            <ModernTrack
                                key={`${track.id}-${index}`}
                                track={track}
                                onRemove={onRemove}
                                isRemoval={true}
                                isExistingPlaylist={isExistingPlaylist}
                                playlistId={playlistId}
                                index={index}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

ModernPlaylist.propTypes = {
    playlistName: PropTypes.string.isRequired,
    playlistTracks: PropTypes.array,
    onRemove: PropTypes.func.isRequired,
    onNameChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    isExistingPlaylist: PropTypes.bool,
    playlistId: PropTypes.string,
    isLoading: PropTypes.bool,
};

export default ModernPlaylist;
