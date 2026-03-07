Project Idea:

i) Overall Problem
We are building a cloud-based service that analyzes a public Spotify playlist or artist and generates insights similar to Spotify Wrapped. The system will compute genre breakdowns, top artists, and audio feature statistics (like energy and danceability) using the Spotify API. The main focus of the project is the backend: calling external APIs, doing server-side analysis, and storing results that can be viewed through a simple demo client.

ii) Components of server-side infrastructure
AWS API Gateway: REST endpoints for submitting playlists and getting results
AWS Lambda: handles API calls and analysis logic
MySQL: stores analysis results and caching
Amazon SQS: handles asynchronous processing of analysis jobs
External API: Spotify Web API
iii) Non-trivial distinct operations provided by server
	Operation 1: Playlist analysis (given a playlist URL or ID)
Fetch all tracks and audio features
Compute top genres and top artists
Calculates statistics like genre distribution, average energy or danceability
Return a summary report of the statistics
	Operation 2: Artist analysis (given an artist ID)
Fetch the artist’s top tracks
Calculate the artist’s popularity score
Generate a simple profile of the artist’s style
	Operation 3: Playlist comparison (or artist comparison)
 Measure similarity using genres and/or audio features
 Highlight key differences in style
Return similarity score as a summary statistic 

iv) Scope details:
We will focus on analyzing public playlists and artists, so we do not need user login or private data. The main goal is building a scalable backend using AWS, not a complex frontend. The demo will be a simple web page or CLI where users submit a playlist and view the analysis results.