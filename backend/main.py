"""
Spotify API Web Server using FastAPI
"""

import os
import base64
import requests
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from datetime import datetime
from typing import List, Dict, Any
import time
import re

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
        global _access_token
        _access_token = None
        return spotify_request(endpoint, params)

    if response.status_code != 200:
        try:
            detail = response.json()
        except ValueError:
            detail = {
                "message": response.text or "Spotify returned a non-JSON error response."
            }

        raise HTTPException(status_code=response.status_code, detail=detail)

    try:
        return response.json()
    except ValueError:
        raise HTTPException(
            status_code=502,
            detail={"message": "Spotify returned invalid JSON."},
        )


def parse_release_year(release_date: str) -> int | None:
    """Extract year from Spotify release_date."""
    if not release_date:
        return None
    try:
        return int(release_date[:4])
    except (ValueError, TypeError):
        return None


def normalize_album_name(name: str) -> str:
    """Normalize album names for deduplication."""
    return name.strip().lower() if name else ""


def is_main_studio_album(album: Dict[str, Any]) -> bool:
    """
    Keep only main studio albums and exclude noisy variants.
    """
    name = normalize_album_name(album.get("name", ""))
    album_type = album.get("album_type", "").lower()
    album_group = album.get("album_group", "").lower()

    if album_type != "album" and album_group != "album":
        return False

    blocked_terms = [
        "deluxe",
        "live",
        "karaoke",
        "acoustic",
        "playlist",
        "tour",
        "version",
        "edition",
        "commentary",
        "instrumental",
        "remix",
        "expanded",
        "anniversary",
        "bonus",
        "collector",
        "stripped",
    ]

    return not any(term in name for term in blocked_terms)


def get_all_artist_albums(artist_id: str) -> List[Dict[str, Any]]:
    """
    Fetch all albums for an artist, handling pagination.
    """
    albums = []
    offset = 0
    limit = 10

    while True:
        data = spotify_request(
            f"artists/{artist_id}/albums",
            {
                "limit": limit,
                "offset": offset,
                "include_groups": "album",
            },
        )

        items = data.get("items", [])
        if not items:
            break

        albums.extend(items)

        if len(items) < limit:
            break

        offset += limit
        time.sleep(0.5)

    return albums


def deduplicate_albums(albums: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Remove duplicates using normalized album name + release year.
    Keep the first occurrence.
    """
    seen = set()
    unique_albums = []

    for album in albums:
        name = normalize_album_name(album.get("name", ""))
        year = parse_release_year(album.get("release_date", ""))
        key = (name, year)

        if key not in seen:
            seen.add(key)
            unique_albums.append(album)

    return unique_albums


def calculate_artist_metrics(artist_id: str) -> Dict[str, Any]:
    """Compute career momentum and catalog depth for one artist."""
    artist = spotify_request(f"artists/{artist_id}")
    raw_albums = get_all_artist_albums(artist_id)

    filtered_albums = [album for album in raw_albums if is_main_studio_album(album)]
    albums = deduplicate_albums(filtered_albums)

    current_year = datetime.now().year

    release_years = []
    total_tracks = 0
    longest_album = None
    shortest_album = None
    first_release_date = None
    latest_release_date = None

    album_summaries = []

    for album in albums:
        release_date = album.get("release_date")
        year = parse_release_year(release_date)
        track_count = album.get("total_tracks", 0)

        if year is not None:
            release_years.append(year)

        if release_date:
            if first_release_date is None or release_date < first_release_date:
                first_release_date = release_date
            if latest_release_date is None or release_date > latest_release_date:
                latest_release_date = release_date

        total_tracks += track_count

        if longest_album is None or track_count > longest_album["total_tracks"]:
            longest_album = {
                "name": album.get("name"),
                "release_date": release_date,
                "total_tracks": track_count,
            }

        if shortest_album is None or track_count < shortest_album["total_tracks"]:
            shortest_album = {
                "name": album.get("name"),
                "release_date": release_date,
                "total_tracks": track_count,
            }

        album_summaries.append(
            {
                "id": album.get("id"),
                "name": album.get("name"),
                "release_date": release_date,
                "release_year": year,
                "total_tracks": track_count,
            }
        )

    release_years = sorted(release_years)
    total_albums = len(albums)

    first_album_year = release_years[0] if release_years else None
    latest_album_year = release_years[-1] if release_years else None

    albums_last_3_years = sum(
        1 for year in release_years if year is not None and year >= current_year - 2
    )

    avg_gap = None
    if len(release_years) > 1:
        gaps = [release_years[i] - release_years[i - 1] for i in range(1, len(release_years))]
        avg_gap = round(sum(gaps) / len(gaps), 2)

    career_span = None
    release_frequency = None
    if first_album_year is not None and latest_album_year is not None:
        career_span = latest_album_year - first_album_year
        if career_span > 0:
            release_frequency = round(total_albums / career_span, 2)
        else:
            release_frequency = float(total_albums)

    avg_tracks_per_album = None
    if total_albums > 0:
        avg_tracks_per_album = round(total_tracks / total_albums, 2)

    return {
        "artist": {
            "id": artist.get("id"),
            "name": artist.get("name"),
            "images": artist.get("images", []),
        },
        "career_momentum": {
            "first_album_year": first_album_year,
            "latest_album_year": latest_album_year,
            "first_release_date": first_release_date,
            "latest_release_date": latest_release_date,
            "total_albums": total_albums,
            "albums_last_3_years": albums_last_3_years,
            "average_years_between_releases": avg_gap,
            "career_span": career_span,
            "release_frequency": release_frequency,
        },
        "catalog_depth": {
            "total_albums": total_albums,
            "total_tracks": total_tracks,
            "average_tracks_per_album": avg_tracks_per_album,
            "longest_album": longest_album,
            "shortest_album": shortest_album,
        },
        "albums": sorted(
            album_summaries,
            key=lambda x: (x["release_date"] or "")
        ),
    }




# Health check
@app.get("/")
def root():
    return {"status": "ok", "message": "Spotify Data API"}


# Search endpoint
@app.get("/search")
def search(
    q: str = Query(..., description="Search query"),
    type: str = Query("track", description="Type: track, artist, album, playlist"),
    limit: int = Query(5, ge=1, le=10),
):
    """Search for tracks, artists, albums, or playlists."""
    return spotify_request("search", {"q": q, "type": type, "limit": limit})


# Artist endpoints - does not return genre and popularity
@app.get("/artists/{artist_id}")
def get_artist(artist_id: str):
    """Get an artist by ID."""
    return spotify_request(f"artists/{artist_id}")


@app.get("/artists/{artist_id}/albums")
def get_artist_albums(artist_id: str, limit: int = Query(10, ge=1, le=15)):
    """Get an artist's albums."""
    return spotify_request(f"artists/{artist_id}/albums", {"limit": limit})

# Album endpoints
@app.get("/albums/{album_id}")
def get_album(album_id: str):
    """Get an album by ID."""
    return spotify_request(f"albums/{album_id}")


@app.get("/albums/{album_id}/tracks")
def get_album_tracks(album_id: str, limit: int = Query(50, ge=1, le=50)):
    return spotify_request(f"albums/{album_id}/tracks", {"limit": limit})


# Track endpoints
@app.get("/tracks/{track_id}")
def get_track(track_id: str):
    """Get a track by ID."""
    return spotify_request(f"tracks/{track_id}")



# Playlist endpoints -  might need OAUTH for some endpoints, but works for public playlists
@app.get("/playlists/{playlist_id}")
def get_playlist(playlist_id: str):
    """Get a playlist by ID."""
    return spotify_request(f"playlists/{playlist_id}")

# works but only with OAUTH
@app.get("/playlists/{playlist_id}/items")
def get_playlist_items(playlist_id: str, limit: int = Query(100, ge=1, le=100)):
    """Get a playlist's items (tracks)."""
    return spotify_request(f"playlists/{playlist_id}/items", {"limit": limit})



def clean_album_name(name: str) -> str:
    """Remove anything in parentheses or brackets from album name."""
    clean = re.sub(r'\(.*?\)', '', name)  
    clean = re.sub(r'\[.*?\]', '', clean) 
    return clean.strip(":- ").strip()

@app.get("/artists/{artist_id}/eras")
def get_artist_eras(artist_id: str):
    """Analyze an artist's era structure based on their discography."""
    
    all_albums = []
    offset = 0
    limit = 10
    while True:
        data = spotify_request(f"artists/{artist_id}/albums", {
            "limit": limit,
            "offset": offset,
            "include_groups": "album"
        })
        all_albums.extend(data["items"])
        if not data.get("next"):
            break
        offset += limit
        time.sleep(0.5)

    if not all_albums:
        raise HTTPException(status_code=404, detail="No albums found for this artist.")

    exclude_keywords = [
        "karaoke", "live", "tour", "session", "surprise song", "stripped",
        "commentary", "instrumental", "acoustic collection"
    ]

    #suffixed to ignore
    rerelease_suffixes = [
        "taylor's version", "the anthology", "deluxe edition", "deluxe version",
        "platinum edition", "track by track version", "til dawn edition",
        "super deluxe", "expanded edition", "anniversary edition",
        "remastered", "reissue", "special edition", "complete edition",
        "collector's edition", "bonus tracks"
    ]

    #Parse dates and filter
    parsed = []
    for album in all_albums:
        name_lower = album["name"].lower()

        #filtering out duplicates and non official albums
        if any(keyword in name_lower for keyword in exclude_keywords):
            continue

        raw_date = album.get("release_date", "")
        try:
            if len(raw_date) == 4:
                date = datetime(int(raw_date), 1, 1)
            elif len(raw_date) == 7:
                date = datetime.strptime(raw_date, "%Y-%m")
            else:
                date = datetime.strptime(raw_date, "%Y-%m-%d")
            parsed.append({
                "id": album["id"],
                "name": album["name"],
                "release_date": raw_date,
                "total_tracks": album["total_tracks"],
                "images": album["images"],
                "parsed_date": date
            })
        except:
            continue

    if not parsed:
        raise HTTPException(status_code=404, detail="No studio albums found after filtering.")

    parsed.sort(key=lambda x: x["parsed_date"])
    #strip re-release suffixes and keep the valid version
    seen_names = {}
    for album in parsed:
        base_name = album["name"].lower()
        for suffix in rerelease_suffixes:
            base_name = base_name.replace(f"({suffix})", "").replace(suffix, "").strip()
     
        base_name = re.sub(r'\(.*?\)', '', album["name"].lower())
        base_name = re.sub(r'\[.*?\]', '', base_name)
        base_name = base_name.strip(":- ").strip()

        if base_name not in seen_names:
            seen_names[base_name] = album

    parsed = sorted(seen_names.values(), key=lambda x: x["parsed_date"])

    deduped = [parsed[0]]
    for i in range(1, len(parsed)):
        gap = (parsed[i]["parsed_date"] - deduped[-1]["parsed_date"]).days
        if gap > 7:
            deduped.append(parsed[i])
    parsed = deduped

    #gap calculation and era structure
    eras = []
    for i, album in enumerate(parsed):
        gap_days = None
        gap_years = None
        if i > 0:
            prev_date = parsed[i - 1]["parsed_date"]
            gap_days = (album["parsed_date"] - prev_date).days
            gap_years = round(gap_days / 365.25, 1)

        eras.append({
            "era_number": i + 1,
            "album_name": clean_album_name(album["name"]), 
            "release_date": album["release_date"],
            "total_tracks": album["total_tracks"],
            "gap_from_previous_days": gap_days,
            "gap_from_previous_years": gap_years,
        })

    #Summary 
    gaps = [e["gap_from_previous_days"] for e in eras if e["gap_from_previous_days"] is not None]

    longest_era = max(eras[1:], key=lambda x: x["gap_from_previous_days"]) if len(eras) > 1 else None
    shortest_era = min(eras[1:], key=lambda x: x["gap_from_previous_days"]) if len(eras) > 1 else None
    most_active_era = shortest_era

    first_year = parsed[0]["parsed_date"].year
    latest_year = parsed[-1]["parsed_date"].year
    avg_gap_days = round(sum(gaps) / len(gaps)) if gaps else None
    avg_gap_years = round(avg_gap_days / 365.25, 1) if avg_gap_days else None

    return {
    "artist_id": artist_id,
    "summary": {
        "first_album_year": first_year,
        "latest_album_year": latest_year,
        "career_span_years": latest_year - first_year,
        "total_eras": len(eras),
        "average_gap_between_albums_years": avg_gap_years,
        "longest_era": {
            "album": longest_era["album_name"],
            "gap_years": longest_era["gap_from_previous_years"]
        } if longest_era else None,
        "shortest_era": {
            "album": shortest_era["album_name"],
            "gap_years": shortest_era["gap_from_previous_years"]
        } if shortest_era else None,
    },
    "timeline": [
        {
            "era_number": e["era_number"],
            "album_name": e["album_name"],
            "release_date": e["release_date"],
            "release_year": int(e["release_date"][:4]),
            "total_tracks": e["total_tracks"],
            "gap_years": e["gap_from_previous_years"],
            "gap_label": f"{e['gap_from_previous_years']} years since last album" if e["gap_from_previous_years"] else "Debut album",
            "cover_image": next((img["url"] for img in parsed[i]["images"] if img["height"] == 640),
                               parsed[i]["images"][0]["url"] if parsed[i]["images"] else None),
        }
        for i, e in enumerate(eras)
    ]
}

@app.get("/analyze/artist/{artist_id}")
def analyze_artist(artist_id: str):
    """Analyze a single artist."""
    return calculate_artist_metrics(artist_id)


@app.get("/compare/artists")
def compare_artists(
    artist1_id: str = Query(..., description="Spotify ID for artist 1"),
    artist2_id: str = Query(..., description="Spotify ID for artist 2"),
):
    """Compare two artists using career momentum and catalog depth metrics."""
    return {
        "artist_1": calculate_artist_metrics(artist1_id),
        "artist_2": calculate_artist_metrics(artist2_id),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
