import { useState } from 'react';
import PropTypes from 'prop-types';
import './ModernTrack.css';

const ModernTrack = ({ track, onAdd, onRemove, isRemoval, isExistingPlaylist, playlistId, index, showAddToPlaylist = false, isInNewPlaylist = false }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleAddTrack = async () => {
        console.log('handleAddTrack called for track:', track.name);
        if (isLoading) {
            console.log('Track is loading, ignoring click');
            return;
        }
        
        setIsLoading(true);
        try {
            if (isExistingPlaylist) {
                console.log('Adding to existing playlist');
                await onAdd(playlistId, track.uri, track);
            } else {
                console.log('Adding to new playlist');
                onAdd(track);
            }
        } catch (error) {
            console.error('Error adding track:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveTrack = async () => {
        if (isLoading) return;
        
        setIsLoading(true);
        try {
            if (isExistingPlaylist) {
                await onRemove(playlistId, track.uri, track);
            } else {
                onRemove(track);
            }
        } catch (error) {
            console.error('Error removing track:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMoreOptions = () => {
        console.log('More options clicked for track:', track.name);
        // For now, let's open the track on Spotify
        if (track.uri) {
            const spotifyUrl = track.uri.replace('spotify:track:', 'https://open.spotify.com/track/');
            window.open(spotifyUrl, '_blank');
        }
    };

    const formatDuration = (ms) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const truncateText = (text, maxLength = 25) => {
        if (text && text.length > maxLength) {
            return text.substring(0, maxLength) + '...';
        }
        return text;
    };

    return (
        <div className={`modern-track ${isLoading ? 'loading' : ''}`}>
            <div className="track-index">
                {isLoading ? (
                    <div className="track-loader"></div>
                ) : (
                    <span className="track-number">{index + 1}</span>
                )}
            </div>

            <div className="track-info">
                <div className="track-title-container">
                    <h3 className="track-title" title={track.name}>
                        {truncateText(track.name, 40)}
                    </h3>
                    {track.explicit && (
                        <span className="explicit-badge" title="Explicit content">
                            E
                        </span>
                    )}
                </div>
                <p className="track-artist" title={track.artist}>
                    {truncateText(track.artist, 30)}
                </p>
            </div>

            <div className="track-album">
                <p title={track.album}>{truncateText(track.album, 30)}</p>
            </div>

            <div className="track-duration">
                {track.duration_ms ? formatDuration(track.duration_ms) : '--:--'}
            </div>

            <div className="track-actions">
                {isRemoval ? (
                    <button 
                        className="track-button remove-button"
                        onClick={handleRemoveTrack}
                        disabled={isLoading}
                        title="Remove from playlist"
                        aria-label={`Remove ${track.name} from playlist`}
                    >
                        <svg viewBox="0 0 24 24" className="button-icon">
                            <path fill="currentColor" d="M19 13H5v-2h14v2z"/>
                        </svg>
                    </button>
                ) : isInNewPlaylist ? (
                    <button 
                        className="track-button added-button"
                        disabled={true}
                        title="Added to playlist"
                        aria-label={`${track.name} added to playlist`}
                    >
                        <svg viewBox="0 0 24 24" className="button-icon">
                            <path fill="currentColor" d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                        </svg>
                    </button>
                ) : (
                    <button 
                        className="track-button add-button"
                        onClick={handleAddTrack}
                        disabled={isLoading}
                        title="Add to playlist"
                        aria-label={`Add ${track.name} to playlist`}
                    >
                        <svg viewBox="0 0 24 24" className="button-icon">
                            <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                    </button>
                )}
                
                <button 
                    className="track-button more-button"
                    onClick={handleMoreOptions}
                    title="Open on Spotify"
                    aria-label={`Open ${track.name} on Spotify`}
                >
                    <svg viewBox="0 0 24 24" className="button-icon">
                        <path fill="currentColor" d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                </button>
            </div>
        </div>
    );
};

ModernTrack.propTypes = {
    track: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        artist: PropTypes.string.isRequired,
        album: PropTypes.string,
        artwork: PropTypes.string,
        explicit: PropTypes.bool,
        uri: PropTypes.string,
        duration_ms: PropTypes.number,
        preview_url: PropTypes.string,
        popularity: PropTypes.number
    }).isRequired,
    onAdd: PropTypes.func,
    onRemove: PropTypes.func,
    isRemoval: PropTypes.bool,
    isExistingPlaylist: PropTypes.bool,
    playlistId: PropTypes.string,
    index: PropTypes.number,
    showAddToPlaylist: PropTypes.bool,
    isInNewPlaylist: PropTypes.bool
};

ModernTrack.defaultProps = {
    isRemoval: false,
    isExistingPlaylist: false,
};

export default ModernTrack;
