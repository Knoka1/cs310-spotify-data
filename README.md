# cs310-spotify-data

# MusicMood: Artist Discography Analytics

A web app that analyzes Spotify artist discographies and visualizes career timelines, catalog depth, and release patterns.

## Live Demo
[https://prod.d21eodpbj8ez60.amplifyapp.com](https://prod.d21eodpbj8ez60.amplifyapp.com)

## Features
- Search for any artist on Spotify
- View career timeline and era breakdown
- Analyze catalog metrics (total albums, tracks, release frequency)
- Compare two artists side by side

## Tech Stack
- **Frontend:** React + TypeScript (Vite), deployed on AWS Amplify
- **Backend:** Python + FastAPI, deployed on AWS Lambda + API Gateway
- **Data:** Spotify Web API

## Local Setup

### Prerequisites
- Python 3.12+
- Node.js 18+
- Spotify Developer account with an app created at [developer.spotify.com](https://developer.spotify.com)

### Backend
```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:
```
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
```

Run the server:
```bash
python main.py
```
Backend runs at `http://localhost:8000`. API docs available at `http://localhost:8000/docs`.

### Frontend
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:
```
VITE_API_URL=http://127.0.0.1:8000
```

Run the dev server:
```bash
npm run dev
```
Frontend runs at `http://localhost:5173`.

## Deployment
- **Frontend:** Hosted on AWS Amplify
- **Backend:** AWS Lambda + API Gateway using Mangum as the ASGI adapter
- For production, `VITE_API_URL` in the frontend should point to the API Gateway endpoint instead of localhost

## Notes
- Spotify credentials are required to run the app locally
- The app uses Client Credentials flow: no user login required
- `.env` files are not committed to the repo: each developer must create their own
- Spotify's development mode limits the app to 5 authorized users
