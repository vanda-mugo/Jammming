import React,{useState, useEffect} from "react";
import './Playlist.css'

// create a mock string 
const Playlist = ({PlaylistName, playlistTracks, onRemove, onNameChange, onSave, isExistingPlaylist,playlistId}) => {

    const onChange = (event) => {
        isExistingPlaylist ? onNameChange(playlistId, event.target.value):onNameChange(event.target.value);
    };

    return (
        <div className="playlistReturn">
            <div className="items">
                <input type="text" value={PlaylistName} onChange={onChange} className="inputBar" />
                <ul>
                    {playlistTracks.map((track) => {
                        return (
                            <li key={track.id}>
                                <div>
                                    <h3>{track.name}</h3>
                                    <p>{track.artist} : {track.album}</p>
                                </div>
                                <button className="removeTrack" onClick={() => {
                                    return isExistingPlaylist ? onRemove(playlistId, track.uri, track) : onRemove(track);}}>
                                        -
                                </button>
                            </li>
                        )
                    })}

                </ul>
            </div>
            <>
                {
                    playlistTracks.length > 0 && (
                        <button className="saveButton" onClick={onSave}>
                            {isExistingPlaylist ? "Update Spotify Playlist" : "Save To Spotify"}
                        </button>
                    )
                }
                <div>
                        {
                            isExistingPlaylist ? <button className="saveButton" onClick={onSave}>
                            Create New Playlist
                        </button>: ""
                        }
                </div>
            </>
        </div>
    );
};

export default Playlist;