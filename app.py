from concurrent.futures import ThreadPoolExecutor
from flask import Flask, request, jsonify, render_template
import requests
import os
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)

# API keys are stored in environment variables.
OMDB_KEY = os.getenv("OMDB_KEY")
YOUTUBE_KEY = os.getenv("YOUTUBE_KEY", "")

# Temporary storage (disappears when Flask restarts).
user_ratings = {}
movie_comments = {}

# Small caches so we don't hit the APIs again and again.
omdb_cache = {}
trailer_cache = {}

# ---------------------------------------------------------
# MOVIE LISTS (genres + sidebar collections)
# ---------------------------------------------------------

CATEGORIES = {
    "Featured": ["Interstellar", "Inception", "The Avengers", "URI: The Surgical Strike"],

    "Top Rated": ["The Shawshank Redemption", "The Godfather", "The Dark Knight",
                  "12 Angry Men", "Schindler's List", "Pulp Fiction"],
    "Trending": ["Oppenheimer", "Dune: Part Two", "Barbie",
                 "Spider-Man: No Way Home", "Top Gun: Maverick", "Avatar: The Way of Water"],
    "New Releases": ["Deadpool & Wolverine", "Inside Out 2", "Furiosa: A Mad Max Saga",
                     "Joker: Folie à Deux", "Gladiator II", "Wicked"],

    "Action": ["The Avengers", "URI: The Surgical Strike", "John Wick",
               "Gladiator", "Top Gun: Maverick", "Mad Max: Fury Road"],
    "Sci-Fi": ["Interstellar", "Inception", "The Matrix", "Avatar", "Dune", "The Martian"],
    "Drama": ["The Shawshank Redemption", "Forrest Gump", "The Godfather",
              "Parasite", "12 Angry Men", "The Pursuit of Happyness"],
    "Comedy": ["The Hangover", "Superbad", "Home Alone", "3 Idiots",
               "The Mask", "The Grand Budapest Hotel"],
    "Thriller": ["Inception", "Se7en", "Gone Girl", "Shutter Island",
                 "The Silence of the Lambs", "Prisoners"],
    "Romance": ["Titanic", "The Notebook", "La La Land", "Before Sunrise",
                "Jab We Met", "Pride & Prejudice"],
}


@app.route("/")
def index():
    return render_template("index.html")


# ---------------------------------------------------------
# OMDB HELPERS
# ---------------------------------------------------------

def get_movie_details(title):
    key = title.lower()
    if key in omdb_cache:
        return omdb_cache[key], None

    if not OMDB_KEY:
        return None, "OMDB_KEY is not configured."

    try:
        response = requests.get(
            "https://www.omdbapi.com/",
            params={"t": title, "apikey": OMDB_KEY, "plot": "full"},
            timeout=10,
        )
        data = response.json()

        if data.get("Response") == "False":
            return None, data.get("Error", "Movie not found.")

        omdb_cache[key] = data
        return data, None

    except requests.RequestException:
        return None, "Could not connect to OMDb right now."


# ---------------------------------------------------------
# SEARCH MOVIE  (accepts ?query=... or ?title=...)
# ---------------------------------------------------------

@app.route("/search", methods=["GET"])
def search_movie():
    query = (request.args.get("query") or request.args.get("title") or "").strip()

    if not query:
        return jsonify({"error": "Please enter a movie name."}), 400

    if not OMDB_KEY:
        return jsonify({"error": "OMDB_KEY is not configured."}), 500

    data, error = get_movie_details(query)

    # If the exact title fails, do a general search and take the first hit
    if not data:
        try:
            r = requests.get(
                "https://www.omdbapi.com/",
                params={"s": query, "apikey": OMDB_KEY},
                timeout=10,
            )
            search_data = r.json()

            if search_data.get("Response") != "True":
                return jsonify({"error": "Movie not found."}), 404

            imdb_id = search_data["Search"][0]["imdbID"]
            r2 = requests.get(
                "https://www.omdbapi.com/",
                params={"i": imdb_id, "apikey": OMDB_KEY, "plot": "full"},
                timeout=10,
            )
            data = r2.json()

            if data.get("Response") == "False":
                return jsonify({"error": data.get("Error", "Movie not found.")}), 404

        except requests.RequestException:
            return jsonify({"error": "Could not connect to OMDb right now."}), 502

    return format_movie_response(data)


# ---------------------------------------------------------
# CATEGORY / GENRE MOVIES
# ---------------------------------------------------------

@app.route("/category/<name>", methods=["GET"])
def get_category_movies(name):
    selected = next((k for k in CATEGORIES if k.lower() == name.lower()), None)

    if not selected:
        return jsonify({"error": "Category not found."}), 404

    if not OMDB_KEY:
        return jsonify({"error": "OMDB_KEY is not configured."}), 500

    titles = CATEGORIES[selected]

    with ThreadPoolExecutor(max_workers=6) as pool:
        results = list(pool.map(get_movie_details, titles))

    movies = []
    for title, (data, _err) in zip(titles, results):
        if data:
            movies.append({
                "title": data.get("Title", title),
                "year": data.get("Year", ""),
                "genre": data.get("Genre", ""),
                "rating": data.get("imdbRating", "N/A"),
                "poster": data.get("Poster", ""),
                "description": data.get("Plot", "No description available."),
            })

    return jsonify({"category": selected, "movies": movies})


# ---------------------------------------------------------
# FORMAT MOVIE DETAILS
# ---------------------------------------------------------

def get_trailer(title):
    if title in trailer_cache:
        return trailer_cache[title]

    trailer_url = ""

    if YOUTUBE_KEY:
        try:
            yt = requests.get(
                "https://www.googleapis.com/youtube/v3/search",
                params={
                    "part": "snippet",
                    "q": f"{title} official trailer",
                    "key": YOUTUBE_KEY,
                    "maxResults": 1,
                    "type": "video",
                },
                timeout=10,
            )
            yt_data = yt.json()

            if yt_data.get("items"):
                video_id = yt_data["items"][0]["id"].get("videoId")
                if video_id:
                    trailer_url = f"https://www.youtube.com/embed/{video_id}"
                    trailer_cache[title] = trailer_url

        except requests.RequestException:
            pass

    return trailer_url


def format_movie_response(data):
    title = data.get("Title", "Unknown Movie")
    imdb_rating = data.get("imdbRating", "N/A")
    votes = data.get("imdbVotes", "N/A")

    try:
        score = float(imdb_rating)
        if score >= 8.0:
            verdict = "HIGHLY RATED"
        elif score >= 7.0:
            verdict = "WELL RATED"
        elif score >= 6.0:
            verdict = "MIXED RATING"
        elif score >= 5.0:
            verdict = "LOWER RATING"
        else:
            verdict = "LOW RATING"
        reason = f"IMDb rating: {imdb_rating}/10 with {votes} votes."
    except (ValueError, TypeError):
        verdict = "RATING UNKNOWN"
        reason = "IMDb rating information is unavailable."

    return jsonify({
        "title": title,
        "year": data.get("Year", ""),
        "genre": data.get("Genre", ""),
        "rating": imdb_rating,
        "votes": votes,
        "img": data.get("Poster", ""),
        "trailer": get_trailer(title),
        "desc": data.get("Plot", "No description available."),
        "verdict": verdict,
        "report": reason,
        "box_office": data.get("BoxOffice", "N/A"),
        "awards": data.get("Awards", "N/A"),
        "director": data.get("Director", "N/A"),
        "actors": data.get("Actors", "N/A"),
        "runtime": data.get("Runtime", "N/A"),
        "language": data.get("Language", "N/A"),
        "user_rating": user_ratings.get(title),
        "comments": movie_comments.get(title, []),
    })


# ---------------------------------------------------------
# USER RATING
# ---------------------------------------------------------

@app.route("/rate", methods=["POST"])
def rate_movie():
    data = request.get_json(silent=True) or {}
    title = str(data.get("title", "")).strip()
    rating = data.get("rating")

    if not title or rating is None:
        return jsonify({"error": "Movie title and rating are required."}), 400

    try:
        rating = int(rating)
    except (ValueError, TypeError):
        return jsonify({"error": "Rating must be a number from 1 to 5."}), 400

    if rating < 1 or rating > 5:
        return jsonify({"error": "Rating must be between 1 and 5."}), 400

    user_ratings[title] = rating
    return jsonify({"message": "Rating saved successfully!", "title": title, "rating": rating})


# ---------------------------------------------------------
# COMMENTS
# ---------------------------------------------------------

@app.route("/comments", methods=["GET"])
def get_comments():
    title = request.args.get("title", "").strip()

    if not title:
        return jsonify({"error": "Movie title is required."}), 400

    return jsonify({"comments": movie_comments.get(title, [])})


@app.route("/comments", methods=["POST"])
def add_comment():
    data = request.get_json(silent=True) or {}

    title = str(data.get("title", "")).strip()
    name = str(data.get("name", "Anonymous")).strip() or "Anonymous"
    comment = str(data.get("comment") or data.get("text") or "").strip()

    if not title or not comment:
        return jsonify({"error": "Movie title and comment are required."}), 400

    if len(comment) > 500:
        return jsonify({"error": "Comment must be 500 characters or less."}), 400

    new_comment = {"name": name[:40], "comment": comment}
    movie_comments.setdefault(title, []).append(new_comment)

    return jsonify({"message": "Comment added successfully!", "comment": new_comment})


if __name__ == "__main__":
    app.run(debug=True)