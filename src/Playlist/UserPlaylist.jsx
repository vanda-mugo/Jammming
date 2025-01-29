import React, { useEffect, useState } from 'react';
import { getUserPlaylist } from '../ApiLogic/playlistLogic';

function UserPlaylist( {setSelectedPlaylist} ) {
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

export default UserPlaylist;


/*The callback ensures that the event handler's function (handleInspectPlaylist) is not executed right away. Instead, it is invoked only when the user clicks the button.
this is the event handler within the button for handleInspectPlaylist*/


/**
 * note that we shall need to do an additional spotify request to obtain the tracks in the spotify playlist
 * we shall use the spotify id property which is the spotify ID for the playlist
 */