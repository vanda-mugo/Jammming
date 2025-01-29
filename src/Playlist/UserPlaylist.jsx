import React, { useEffect, useState } from 'react';
import { getUserPlaylist } from '../ApiLogic/PlaylistLogic';

function PlaylistComponent( {setSelectedPlaylist} ) {
    const [playlists, setPlaylists] = useState([]);


    const handleFetchPlaylist = async () => {
        const fetchedPlaylists = await getUserPlaylist();
        // in the case that the playlist is empty it will be set to empty array 
        setPlaylists(fetchedPlaylists || []);
    };

    const handleInspectPlaylist = (playlist) => {
        setSelectedPlaylist(playlist);
    };

    return (
        <div>
            <h2>Your Playlists</h2>
            <button onClick={handleFetchPlaylist}>Fetch Playlist</button>
            <ul>
                {playlists !== null ? playlists.map(playlist => (
                    <li key={playlist.id}>{playlist.name}
                    
                    <button onClick={() => handleInspectPlaylist(playlist)}>Explore</button></li>
                )) : ""}
            </ul>
        </div>
    );
}

export default PlaylistComponent;


/*The callback ensures that the event handler's function (handleInspectPlaylist) is not executed right away. Instead, it is invoked only when the user clicks the button.
this is the event handler within the button for handleInspectPlaylist*/