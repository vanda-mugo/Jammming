import React, { useEffect, useState } from 'react';
import { getUserPlaylist } from '../ApiLogic/playlistLogic';
import './UserPlaylist.css';

function UserPlaylist( {setSelectedPlaylist, setisExistingPlaylist, setPlaylistId, fetchPlaylists} ) {
    const [playlists, setPlaylists] = useState([]);

    useEffect(() => {
        if (fetchPlaylists) {
          fetchPlaylists.current = handleFetchPlaylist;
        }
      }, [fetchPlaylists]);


    const handleFetchPlaylist = async () => {
        const fetchedPlaylists = await getUserPlaylist();
        // in the case that the playlist is empty it will be set to empty array 
        setPlaylists(fetchedPlaylists || []);
    };

    const handleInspectPlaylist = (playlist) => {
        setSelectedPlaylist(playlist);
        // we set the state of existing playlist to true when someone clicks the Explore button 
        setisExistingPlaylist(true);
        setPlaylistId(playlist.id);
    };

    return (
        <>
        <div className='fetchItemMain'>
        <div  >
            <div className='items'>
                <h2 className='sticky'>Your Playlists</h2>
                <ul>
                    {playlists !== null ? playlists.map(playlist => (
                        <li key={playlist.id}><span className='playlistname'>{playlist.name}</span>
                        
                        <button className='explore' onClick={() => handleInspectPlaylist(playlist)}>Explore</button></li>
                    )) : ""}
                </ul>
            </div>
        </div>
        <div>
            <button onClick={handleFetchPlaylist} className='saveButton'>Fetch Playlist</button>
        </div>
        </div>
        </>
    );
}

export default UserPlaylist;


/*The callback ensures that the event handler's function (handleInspectPlaylist) is not executed right away. Instead, it is invoked only when the user clicks the button.
this is the event handler within the button for handleInspectPlaylist*/


/**
 * note that we shall need to do an additional spotify request to obtain the tracks in the spotify playlist
 * we shall use the spotify id property which is the spotify ID for the playlist
 */