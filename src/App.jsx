import React,{ useRef, useState } from 'react'
import './App.css'
import Playlist from './Playlist/Playlist';
import Tracklist from './Tracklist/Tracklist';
import Auth from './ApiLogic/Auth';
import { spotifyAuth } from './ApiLogic/spotifyAuth';
import { savePlaylist } from './ApiLogic/savePlaylist';
import { Nav } from './Nav/Nav';
import SearchBar from "./SearchBar/Search";
import UserPlaylist from './Playlist/UserPlaylist';
import { fetchPlaylistTracks } from './ApiLogic/playlistLogic';



/*
example of a spotify url. point of saving the playlist 
https://open.spotify.com/track/3BxeETRRl0uA1GRrXvK05g?si=1d8151ebc3fd42ed

*/

function App() {
  const [playlistName, setPlaylistName] = useState("New Playlist");
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [trackListResult, setTrackListResult] = useState([]);
  const [query, setQuery] = React.useState("");
  const [isExistingPlaylist , setisExistingPlaylist] = useState(false);
  const [playlistId, setPlaylistId] = useState(null);
  const fetchPlaylists = useRef(null);


  //note that we are keeping the playlist information on the App component 
  // this is for adding a track to a new playslist
  const addTrack = (track) => {
    console.log(track);
    //first check if the track is already in the playlist 
    if(!playlistTracks.find(trackname =>  trackname.id === track.id)){
      setPlaylistTracks([...playlistTracks, track]);
    }
    else{
      alert("The selected track is already in the playlist.")
    }
  };


  //function to add a singular track to a playlist/ existing playlist functionality 
  const addTrackToPlaylist = async (playlistId, trackUri, track) => {
    const accessToken = spotifyAuth.getAccessToken();

    if(!accessToken){
        //redirect to the login page
        window.location.href = spotifyAuth.getAuthUrl();
        return;
    }
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ uris: [trackUri] })
    });
  
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Log success message
    console.log('Track added successfully!');
    alert(`Added the track with name : ${track.name}`);
    setPlaylistTracks([...playlistTracks, track]);
    return response.json();
  };
  
  // new playlist name function 
  const updateName = (name) => {
    // set the new name 
    setPlaylistName(name);
  }



  // function to update existing playlist name 
  const updatePlaylistName = async (playlistId, newName) => {
    setPlaylistName(newName)
    const accessToken = spotifyAuth.getAccessToken();

    if(!accessToken){
        //redirect to the login page
        window.location.href = spotifyAuth.getAuthUrl();
        return;
    }
    try{
      const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
        method:'PUT',
        headers:{
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({name: newName})
      });
      if (response.status === 200) {
        // No content, but successful request
        console.log('Playlist name updated successfully to:', newName);
        return;
      }

      if(!response.ok){
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      if(!text){
        throw new Error('Response body is empty');
      }

      const data = JSON.parse(text);
      return data;
    
    }catch(error){
      console.log('failed to update playlist name: ', error);
      window.alert(error.message);
    }
    
  };


  // for removing a track from an existing playlist
  const removeTrackFromPlaylist = async (playlistId, trackUri, track) => {
    const accessToken = spotifyAuth.getAccessToken();
    if(!accessToken){
        //redirect to the login page
        window.location.href = spotifyAuth.getAuthUrl();
        return;
    }
    try{
      const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tracks: [{ uri: trackUri }] })
      });
    
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if(playlistTracks.some((trackname) => trackname.name === track.name)){
        //in this case the song exist in the playlist
        const newArray = playlistTracks.filter((trackname) => {
          return trackname.name !== track.name;
        });
        // the new array should be set with the useState hook 
        setPlaylistTracks(newArray);
        //set an alert to inform the person that the track has been removed 
        alert(`removed the track with name : ${track.name}`);
      }
      // Log success message
      console.log('Track removed successfully!');
      return response.json();
    }catch(error){
      console.log('Failed to remove track: ', error);
      window.alert(error.message);
    }
  };
  


  // function to remove track from playlist 
  const removeTrack = (track) => {
    // use this to remove the selected track 
    //check for its existence 
    if(playlistTracks.some((trackname) => trackname.name === track.name)){
      //in this case the song exist in the playlist
      const newArray = playlistTracks.filter((trackname) => {
        return trackname.name !== track.name;
      });
      // the new array should be set with the useState hook 
      setPlaylistTracks(newArray);
      //set an alert to inform the person that the track has been removed 
      alert(`removed the track with name : ${track.name}`);
    }
  };



  const handleSearch = async () => {
    const accessToken = spotifyAuth.getAccessToken();

    if(!accessToken){
        //redirect to the login page
        window.location.href = spotifyAuth.getAuthUrl();
        return;
    }

    try{
        const response = await fetch(`https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(query)}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if(!response.ok){
            throw new Error("Failed to fetch data from the Spotify API");
        }

        const data = await response.json();
        const tracks = data.tracks.items.map(track => ({
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            uri: track.uri
        }));

        setTrackListResult(tracks);
    
    }catch(error){
        console.error("Error fetching data from the Spotify API", error);
    }
    
};

// Example usage with a button click
const handleSavePlaylist = () => {
  if(isExistingPlaylist){
    updateExistingPlaylist();
  }else{
    const playlistname = playlistName;
    const playlistDescription = 'A playlist created in Jammming';
    const  playlistUrls = playlistTracks.map((track) => track.uri);
    console.log(`Saving Playlist to spotify with urls ${playlistUrls}`);

    savePlaylist(playlistname, playlistDescription, playlistUrls);
    window.alert(`Playlist ${playlistName} saved to your spotify account`);
    // reset the playlist
    setPlaylistName("New Playlist");
    setPlaylistTracks([]);
    setisExistingPlaylist(false);
  }
};

const updateExistingPlaylist=async ()=>{
    // Reset the playlist id
    setPlaylistId(null);
    // Reset playlist name and tracks
    setPlaylistName("New Playlist");
    setPlaylistTracks([]);
    setisExistingPlaylist(false);

    if (fetchPlaylists.current) {
      fetchPlaylists.current();
    }

};

  //handle selected playlist 
  const handleSelectPlaylist = async(playlist) => {
    setPlaylistName(playlist.name);
    // now to get the tracks from the playlist and display them
    const tracks = await fetchPlaylistTracks(playlist.id);
    setPlaylistTracks(tracks.map(track => {
      return{
        id: track.track.id,
        name: track.track.name,
        artist: track.track.artists[0].name,
        album: track.track.album.name,
        uri: track.track.uri
      };
    }
  ));
  };

  
  // within the return we shall return the tracklist component  
  return (
    <>
      <div  className='return'>
        <Nav/>
        <SearchBar setQuery={setQuery} query={query} handleSearch={handleSearch} />
        <div className='appReturn'>
        <UserPlaylist setSelectedPlaylist={handleSelectPlaylist} 
                        setisExistingPlaylist={setisExistingPlaylist}
                        setPlaylistId={setPlaylistId}
                        fetchPlaylists={fetchPlaylists}/>
          <Tracklist 
                    tracks={trackListResult} 
                    onAdd={isExistingPlaylist ? addTrackToPlaylist: addTrack}
                    isExistingPlaylist={isExistingPlaylist}
                    playlistId={playlistId} />

          <Playlist  
                    PlaylistName={playlistName} 
                    playlistTracks={playlistTracks} 
                    onRemove={isExistingPlaylist ? removeTrackFromPlaylist : removeTrack} 
                    onNameChange={isExistingPlaylist ? updatePlaylistName: updateName} 
                    onSave={handleSavePlaylist} 
                    isExistingPlaylist={isExistingPlaylist}
                    playlistId={playlistId}
          />            
        </div>
        <Auth />
      </div>
    </>
  )
}

export default App;

