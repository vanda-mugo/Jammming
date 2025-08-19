import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './ModernSearchBar.css';

const ModernSearchBar = ({ query, setQuery, onSearch, isLoading = false }) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (event) => {
            // Focus search when pressing '/' key (like GitHub)
            if (event.key === '/' && event.target !== inputRef.current) {
                event.preventDefault();
                inputRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim() && !isLoading) {
            onSearch();
        }
    };

    const handleClear = () => {
        setQuery('');
        inputRef.current?.focus();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && query.trim() && !isLoading) {
            onSearch();
        }
    };

    return (
        <div className="modern-search-container">
            <form onSubmit={handleSubmit} className="search-form">
                <div className={`search-input-container ${isFocused ? 'focused' : ''} ${isLoading ? 'loading' : ''}`}>
                    <div className="search-icon-container">
                        <svg viewBox="0 0 24 24" className="search-icon">
                            <path 
                                fill="currentColor" 
                                d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                            />
                        </svg>
                    </div>
                    
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onKeyPress={handleKeyPress}
                        placeholder="Search for songs, artists, or albums..."
                        className="search-input"
                        disabled={isLoading}
                        aria-label="Search Spotify"
                        autoComplete="off"
                    />

                    {query && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="clear-button"
                            aria-label="Clear search"
                            disabled={isLoading}
                        >
                            <svg viewBox="0 0 24 24" className="clear-icon">
                                <path 
                                    fill="currentColor" 
                                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                                />
                            </svg>
                        </button>
                    )}

                    {isLoading && (
                        <div className="search-loader">
                            <div className="loader-spinner"></div>
                        </div>
                    )}
                </div>

                <button 
                    type="submit" 
                    className="search-button"
                    disabled={!query.trim() || isLoading}
                    aria-label="Search"
                >
                    {isLoading ? (
                        <div className="button-loader">
                            <div className="button-spinner"></div>
                        </div>
                    ) : (
                        <svg viewBox="0 0 24 24" className="search-button-icon">
                            <path 
                                fill="currentColor" 
                                d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                            />
                        </svg>
                    )}
                </button>
            </form>

            <div className="search-shortcuts">
                <span className="keyboard-shortcut">
                    Press <kbd>/</kbd> to focus
                </span>
            </div>
        </div>
    );
};

ModernSearchBar.propTypes = {
    query: PropTypes.string.isRequired,
    setQuery: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired,
    isLoading: PropTypes.bool
};

ModernSearchBar.defaultProps = {
    isLoading: false,
};

export default ModernSearchBar;
