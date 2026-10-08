# Lumiere Movie Rating Website

## Project structure

Lumiere/
├── app.py
├── templates/
│   └── index.html
└── static/
    ├── style.css
    └── script.js

## 1. Install Python

Make sure Python 3 is installed.

## 2. Install packages

Open Command Prompt in the Lumiere folder:

pip install flask requests

## 3. Add API keys

Windows Command Prompt:

set OMDB_KEY=YOUR_OMDB_KEY
set YOUTUBE_KEY=YOUR_YOUTUBE_KEY

PowerShell:

$env:OMDB_KEY="YOUR_OMDB_KEY"
$env:YOUTUBE_KEY="YOUR_YOUTUBE_KEY"

These variables only apply to the current terminal window.

## 4. Run

python app.py

Then open:

http://127.0.0.1:5000

## Features

- Lumiere movie homepage
- Search any movie using OMDb
- Movie poster, description, IMDb rating and votes
- Director, cast, runtime, language and box office
- YouTube official trailer search
- User rating from 1 to 5 stars
- Comments/reviews
- Genre filters
- Movie details modal

Note:
Ratings and comments are stored in memory, so they are reset when the Flask server restarts.
