import { SpotifyAuth } from "./SpotifyAuth";


const getUserPlaylist = async () => {
    // endpoint https://api.spotify.com/v1/playlists/{playlist_id}
    const accessToken = SpotifyAuth.getAccessToken();

    try{
        // to write the fetch request 
        const response = await fetch('https://api.spotify.com/v1/me/playlists', {
        headers:{
            'Authorization' : `Bearer ${accessToken}`
        }
        })
    if(!response){
        throw new Error("Failed to fetch playlist data from spotify");
    }

    const data = await response.json();
    return data;

    }catch(error){
        window.alert(error);
    }
};

export {getUserPlaylist};