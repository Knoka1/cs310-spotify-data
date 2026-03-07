"""
Spotify API Web Server using FastAPI
"""

import os
import base64
import requests
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Spotify Data API",
    description="REST API for accessing Spotify data",
    version="1.0.0",
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Spotify API configuration
SPOTIFY_AUTH_URL = "https://accounts.spotify.com/api/token"
SPOTIFY_BASE_URL = "https://api.spotify.com/v1"
CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")

# Token cache
_access_token = None


def get_access_token() -> str:
    """Get or refresh Spotify access token."""
    global _access_token
    
    if _access_token:
        return _access_token
    
    if not CLIENT_ID or not CLIENT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Spotify credentials not configured. Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET.",
        )
    
    credentials = f"{CLIENT_ID}:{CLIENT_SECRET}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()
    
    response = requests.post(
        SPOTIFY_AUTH_URL,
        headers={
            "Authorization": f"Basic {encoded_credentials}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        data={"grant_type": "client_credentials"},
    )
    
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to authenticate with Spotify")
    
    _access_token = response.json()["access_token"]
    return _access_token


def spotify_request(endpoint: str, params: dict = None) -> dict:
    """Make a request to the Spotify API."""
    token = get_access_token()
    url = f"{SPOTIFY_BASE_URL}/{endpoint}"
    
    response = requests.get(
        url,
        headers={"Authorization": f"Bearer {token}"},
        params=params,
    )
    
    if response.status_code == 401:
        # Token expired, clear and retry
        global _access_token
        _access_token = None
        return spotify_request(endpoint, params)
    
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.json())
    
    return response.json()


# Health check
@app.get("/")
def root():
    return {"status": "ok", "message": "Spotify Data API"}


# Search endpoint
@app.get("/search")
def search(
    q: str = Query(..., description="Search query"),
    type: str = Query("track", description="Type: track, artist, album, playlist"),
    limit: int = Query(20, ge=1, le=50),
):
    """Search for tracks, artists, albums, or playlists."""
    return spotify_request("search", {"q": q, "type": type, "limit": limit})


# Artist endpoints
@app.get("/artists/{artist_id}")
def get_artist(artist_id: str):
    """Get an artist by ID."""
    return spotify_request(f"artists/{artist_id}")


@app.get("/artists/{artist_id}/albums")
def get_artist_albums(artist_id: str, limit: int = Query(20, ge=1, le=50)):
    """Get an artist's albums."""
    return spotify_request(f"artists/{artist_id}/albums", {"limit": limit})


@app.get("/artists/{artist_id}/top-tracks")
def get_artist_top_tracks(artist_id: str, market: str = Query("US")):
    """Get an artist's top tracks."""
    return spotify_request(f"artists/{artist_id}/top-tracks", {"market": market})


# Album endpoints
@app.get("/albums/{album_id}")
def get_album(album_id: str):
    """Get an album by ID."""
    return spotify_request(f"albums/{album_id}")


@app.get("/albums/{album_id}/tracks")
def get_album_tracks(album_id: str, limit: int = Query(50, ge=1, le=50)):
    """Get an album's tracks."""
    return spotify_request(f"albums/{album_id}/tracks", {"limit": limit})


# Track endpoints
@app.get("/tracks/{track_id}")
def get_track(track_id: str):
    """Get a track by ID."""
    return spotify_request(f"tracks/{track_id}")


@app.get("/tracks/{track_id}/audio-features")
def get_track_audio_features(track_id: str):
    """Get audio features for a track."""
    return spotify_request(f"audio-features/{track_id}")


# Playlist endpoints
@app.get("/playlists/{playlist_id}")
def get_playlist(playlist_id: str):
    """Get a playlist by ID."""
    return spotify_request(f"playlists/{playlist_id}")


@app.get("/playlists/{playlist_id}/tracks")
def get_playlist_tracks(playlist_id: str, limit: int = Query(100, ge=1, le=100)):
    """Get a playlist's tracks."""
    return spotify_request(f"playlists/{playlist_id}/tracks", {"limit": limit})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
