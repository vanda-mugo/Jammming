import { SpotifyAuth } from "./SpotifyAuth";


const getUserPlaylist = async () => {
    // endpoint https://api.spotify.com/v1/playlists/{playlist_id}
    const accessToken = SpotifyAuth.getAccessToken();
    if(!accessToken){
        window.location.href = SpotifyAuth.getAuthUrl();
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
    if(!response){
        throw new Error(`HTTP Error: ${response.statusText}`);
    }

    // parse the JSON response 
    const data = await response.json();
    return data.items;

    }catch(error){
        console.log('Failed to fetch playlist:', error);
        window.alert(error.message);
    }
};

export {getUserPlaylist};