import { spotifyAuth } from "./spotifyAuth";


const getUserPlaylist = async () => {
    // endpoint https://api.spotify.com/v1/playlists/{playlist_id}
    const accessToken = spotifyAuth.getAccessToken();
    if(!accessToken){
        window.location.href = spotifyAuth.getAuthUrl();
        return;
    }
    console.log("access token" , accessToken);

    try{
        // to write the fetch request 
        const response = await fetch('https://api.spotify.com/v1/me/playlists', {
        headers:{
            'Authorization': `Bearer ${accessToken}`        }
        });

    // check for HTTP errors 
    if(!response.ok){
        throw new Error(`HTTP Error: ${response.statusText}`);
    }

    // parse the JSON response 
    const data = await response.json();
    // note that this returns an array of simplified Playlist Object 
    return data.items;

    }catch(error){
        console.log('Failed to fetch playlist:', error);
        window.alert(error.message);
    }
};

export {getUserPlaylist};

/**
 * it is important to note that each item that is each object in the data.items array has properties
 * {
  "id": "3cEYpjA9oz9GiPac4AsH4n",
  "name": "Your Playlist Name",
  "uri": "spotify:playlist:3cEYpjA9oz9GiPac4AsH4n",
  "tracks": {
    "href": "https://api.spotify.com/v1/playlists/3cEYpjA9oz9GiPac4AsH4n/tracks",
    "total": 15
  },
  "description": "A playlist description",
  "owner": {
    "id": "user_id",
    "display_name": "User Name"
  }
}
this is just a run down of what is important in the scope however the properties are many 
 */

// we can have the function for retrieving tracks from the selected playlist here 
// use GetPlaylistItems from the documentation 
// GET  /playlists/{playlist_id}/tracks
// keep in mind if developing to update the scope for the same 
// response has an items property that has an array of playlist Objects
// simply put we shall be using the track object 

const fetchPlaylistTracks = async (playlistId) => {
    const accessToken = spotifyAuth.getAccessToken();
    if(!accessToken){
        window.location.href = spotifyAuth.getAuthUrl();
        return;
    }
    try{
        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`,{
            method: 'GET',
            headers: {
             'Authorization' : `Bearer ${accessToken}`
            } 
         });
         if (!response.ok){
            throw new Error(`HTTP Error: ${response.status} : ${response.statusText}`);
         }

         const data = await response.json();
         return data.items;
    }catch(error){
        console.log('Failed to fetch Playlist: ' ,error);
        window.alert(error.message);
    }
};

export { fetchPlaylistTracks };