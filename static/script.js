let currentMovie = "";
let currentCategory = "Featured";
let currentLanguage = "en";
let currentUser = null;

const PLACEHOLDER_POSTER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='300' height='440'>" +
    "<rect width='100%' height='100%' fill='#141824'/>" +
    "<text x='50%' y='50%' fill='#777' font-size='40' text-anchor='middle'>🎬</text></svg>"
  );

// ===============================
// TRANSLATIONS
// ===============================

const translations = {
  en: {
    menu: "☰ Menu", browse: "Browse",
    hero: "Your personal movie universe — search movies, explore details and share your rating.",
    search: "Search any movie...", signIn: "Sign In", signOut: "Sign Out",
    director: "Director:", cast: "Cast:", runtime: "Runtime:", language: "Language:",
    votes: "Votes:", boxOffice: "Box Office:", yourRating: "Your Rating",
    comments: "💬 Comments & Reviews", postComment: "Post Comment",
    yourName: "Your name", writeComment: "Write your comment...", email: "Email address",
    welcomeTitle: "Welcome to Lumiere", welcomeSub: "Sign in to rate movies and share your reviews.",
    loading: "Loading...", loginFirst: "Please sign in first to rate or comment.",
    noComments: "No comments yet. Be the first to review!",
    cat: { All: "All", Featured: "Featured Movies", "Top Rated": "Top Rated", Trending: "Trending",
           "New Releases": "New Releases", Action: "Action", Drama: "Drama", "Sci-Fi": "Sci-Fi",
           Comedy: "Comedy", Romance: "Romance", Thriller: "Thriller" }
  },
  hi: {
    menu: "☰ मेन्यू", browse: "ब्राउज़ करें",
    hero: "आपकी व्यक्तिगत मूवी दुनिया — फिल्में खोजें, विवरण देखें और अपनी रेटिंग साझा करें।",
    search: "कोई भी फिल्म खोजें...", signIn: "साइन इन", signOut: "साइन आउट",
    director: "निर्देशक:", cast: "कलाकार:", runtime: "अवधि:", language: "भाषा:",
    votes: "वोट:", boxOffice: "बॉक्स ऑफिस:", yourRating: "आपकी रेटिंग",
    comments: "💬 टिप्पणियाँ और समीक्षाएँ", postComment: "टिप्पणी पोस्ट करें",
    yourName: "आपका नाम", writeComment: "अपनी टिप्पणी लिखें...", email: "ईमेल पता",
    welcomeTitle: "Lumiere में आपका स्वागत है", welcomeSub: "रेटिंग देने और समीक्षा लिखने के लिए साइन इन करें।",
    loading: "लोड हो रहा है...", loginFirst: "रेटिंग या टिप्पणी के लिए पहले साइन इन करें।",
    noComments: "अभी कोई टिप्पणी नहीं। सबसे पहले समीक्षा करें!",
    cat: { All: "सभी", Featured: "विशेष फिल्में", "Top Rated": "सर्वश्रेष्ठ रेटेड", Trending: "ट्रेंडिंग",
           "New Releases": "नई रिलीज़", Action: "एक्शन", Drama: "ड्रामा", "Sci-Fi": "साइंस-फिक्शन",
           Comedy: "कॉमेडी", Romance: "रोमांस", Thriller: "थ्रिलर" }
  },
  es: {
    menu: "☰ Menú", browse: "Explorar",
    hero: "Tu universo personal de películas — busca películas, explora detalles y comparte tu valoración.",
    search: "Buscar cualquier película...", signIn: "Iniciar sesión", signOut: "Cerrar sesión",
    director: "Director:", cast: "Reparto:", runtime: "Duración:", language: "Idioma:",
    votes: "Votos:", boxOffice: "Taquilla:", yourRating: "Tu valoración",
    comments: "💬 Comentarios y reseñas", postComment: "Publicar comentario",
    yourName: "Tu nombre", writeComment: "Escribe tu comentario...", email: "Correo electrónico",
    welcomeTitle: "Bienvenido a Lumiere", welcomeSub: "Inicia sesión para valorar películas y compartir reseñas.",
    loading: "Cargando...", loginFirst: "Inicia sesión primero para valorar o comentar.",
    noComments: "Aún no hay comentarios. ¡Sé el primero!",
    cat: { All: "Todas", Featured: "Películas destacadas", "Top Rated": "Mejor valoradas", Trending: "Tendencias",
           "New Releases": "Novedades", Action: "Acción", Drama: "Drama", "Sci-Fi": "Ciencia ficción",
           Comedy: "Comedia", Romance: "Romance", Thriller: "Suspense" }
  },
  fr: {
    menu: "☰ Menu", browse: "Parcourir",
    hero: "Votre univers personnel du cinéma — recherchez des films, découvrez les détails et partagez votre note.",
    search: "Rechercher un film...", signIn: "Se connecter", signOut: "Se déconnecter",
    director: "Réalisateur :", cast: "Distribution :", runtime: "Durée :", language: "Langue :",
    votes: "Votes :", boxOffice: "Box-office :", yourRating: "Votre note",
    comments: "💬 Commentaires et avis", postComment: "Publier le commentaire",
    yourName: "Votre nom", writeComment: "Écrivez votre commentaire...", email: "Adresse e-mail",
    welcomeTitle: "Bienvenue sur Lumiere", welcomeSub: "Connectez-vous pour noter des films et partager vos avis.",
    loading: "Chargement...", loginFirst: "Connectez-vous d'abord pour noter ou commenter.",
    noComments: "Aucun commentaire. Soyez le premier !",
    cat: { All: "Tous", Featured: "Films en vedette", "Top Rated": "Mieux notés", Trending: "Tendances",
           "New Releases": "Nouveautés", Action: "Action", Drama: "Drame", "Sci-Fi": "Science-fiction",
           Comedy: "Comédie", Romance: "Romance", Thriller: "Thriller" }
  }
};

function t(key) {
  const lang = translations[currentLanguage] || translations.en;
  return lang[key] ?? translations.en[key] ?? key;
}

function catName(cat) {
  const lang = translations[currentLanguage] || translations.en;
  return lang.cat[cat] ?? cat;
}

// ===============================
// SIDEBAR
// ===============================

function openMenu() {
  document.getElementById("sidebar")?.classList.add("open");
  document.getElementById("overlay")?.classList.add("show");
}

function closeMenu() {
  document.getElementById("sidebar")?.classList.remove("open");
  document.getElementById("overlay")?.classList.remove("show");
}

// ===============================
// CATEGORIES / GENRES
// ===============================

function setStatus(text) {
  const status = document.getElementById("status");
  if (status) status.textContent = text;
}

function updateFilterButtons(cat) {
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.cat === cat);
  });
}

function updateSectionTitle() {
  const title = document.getElementById("sectionTitle");
  if (!title) return;
  const emojis = { Featured: "⭐", "Top Rated": "🏆", Trending: "🔥", "New Releases": "🆕" };
  title.textContent = `${emojis[currentCategory] || "🎬"} ${catName(currentCategory)}`;
}

async function loadCategory(cat) {
  currentCategory = cat;
  updateFilterButtons(cat);
  updateSectionTitle();

  const container = document.getElementById("movieContainer");
  container.innerHTML = "";
  setStatus(t("loading"));

  try {
    const response = await fetch(`/category/${encodeURIComponent(cat)}`);
    const data = await response.json();

    if (!response.ok || data.error) throw new Error(data.error || "Failed");

    // ignore stale responses if the user clicked another category meanwhile
    if (cat !== currentCategory) return;

    renderCards(data.movies || []);
    setStatus(data.movies && data.movies.length ? "" : "No movies available in this category yet.");
  } catch (error) {
    setStatus("Could not load movies. Please check your OMDb API key.");
  }
}

function showAllMovies() {
  loadCategory("Featured");
}

function filterGenre(genre) {
  loadCategory(genre);
}

function renderCards(movies) {
  const container = document.getElementById("movieContainer");
  container.innerHTML = "";

  movies.forEach(movie => {
    const firstGenre = (movie.genre || "").split(",")[0].trim() || "Movie";
    const score = parseFloat(movie.rating);
    const filled = isNaN(score) ? 0 : Math.round(score / 2);
    const stars = "★".repeat(filled) + "☆".repeat(5 - filled);
    const poster = movie.poster && movie.poster !== "N/A" ? movie.poster : PLACEHOLDER_POSTER;

    const card = document.createElement("div");
    card.className = "movie-card";
    card.dataset.title = movie.title;
    card.dataset.genre = firstGenre;

    card.innerHTML = `
      <div class="image-container">
        <span class="genre-badge">${escapeHTML(firstGenre)}</span>
        <img src="${escapeHTML(poster)}" alt="${escapeHTML(movie.title)}">
        <div class="image-overlay">
          <button class="watch-btn">▶ View Details</button>
        </div>
      </div>
      <div class="card-content">
        <h3>${escapeHTML(movie.title)}</h3>
        <p class="description">${escapeHTML((movie.description || "").slice(0, 110))}…</p>
        <div class="card-footer">
          <div class="stars">${stars}</div>
          <span class="year-tag">${escapeHTML(movie.year)}</span>
        </div>
      </div>
    `;

    // broken poster -> placeholder
    card.querySelector("img").addEventListener("error", e => {
      e.target.src = PLACEHOLDER_POSTER;
    });

    card.addEventListener("click", () => openMovie(movie.title));
    container.appendChild(card);
  });
}

// ===============================
// SEARCH / OPEN MOVIE
// ===============================

async function loadMovie(title) {
  setStatus(t("loading"));

  try {
    const response = await fetch(`/search?query=${encodeURIComponent(title)}`);
    const data = await response.json();

    if (!response.ok || data.error) throw new Error(data.error || "Movie not found");

    currentMovie = data.title || title;
    displayMovieData(data);
    document.getElementById("movieModal")?.classList.add("show");
    setStatus("");
  } catch (error) {
    setStatus("");
    alert("Could not find this movie. Please check the name (and your OMDb API key).");
  }
}

function searchMovie() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  const title = input.value.trim();
  if (!title) {
    alert("Please enter a movie name.");
    return;
  }
  loadMovie(title);
}

function openMovie(title) {
  loadMovie(title);
}

function closeMovie() {
  document.getElementById("movieModal")?.classList.remove("show");
  document.getElementById("trailerBox").innerHTML = ""; // stops trailer playing
}

// ===============================
// DISPLAY MOVIE
// ===============================

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || "N/A";
}

function displayMovieData(data) {
  const poster = document.getElementById("detailPoster");
  poster.src = data.img && data.img !== "N/A" ? data.img : PLACEHOLDER_POSTER;
  poster.onerror = () => { poster.src = PLACEHOLDER_POSTER; };

  setText("detailTitle", data.title);
  setText("detailMeta", `${data.year || "N/A"} • ${data.genre || "N/A"}`);
  setText("detailRating", data.rating);
  setText("detailVerdict", data.verdict);
  setText("detailDescription", data.desc);
  setText("detailDirector", data.director);
  setText("detailActors", data.actors);
  setText("detailRuntime", data.runtime);
  setText("detailLanguage", data.language);
  setText("detailVotes", data.votes);
  setText("detailBoxOffice", data.box_office);

  // trailer
  const trailerBox = document.getElementById("trailerBox");
  trailerBox.innerHTML = data.trailer
    ? `<iframe width="100%" height="220" src="${escapeHTML(data.trailer)}" frameborder="0" allowfullscreen></iframe>`
    : "";

  // saved rating
  highlightStars(data.user_rating || 0);
  document.getElementById("ratingMessage").textContent = "";

  renderComments(data.comments || []);
  fillCommentName();
}

// ===============================
// USER RATING
// ===============================

function highlightStars(n) {
  document.querySelectorAll("#ratingStars button").forEach((btn, i) => {
    btn.classList.toggle("active", i < n);
    btn.style.color = i < n ? "#f5a623" : "";
  });
}

async function submitRating(rating) {
  if (!currentMovie) {
    alert("Please select a movie first.");
    return;
  }

  const message = document.getElementById("ratingMessage");

  if (!currentUser) {
    message.textContent = t("loginFirst");
    openLogin();
    return;
  }

  try {
    const response = await fetch("/rate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: currentMovie, rating: rating })
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || "Failed");

    highlightStars(rating);
    message.textContent = data.message || "Thanks for your rating!";
  } catch (error) {
    message.textContent = "Rating could not be submitted.";
  }
}

// ===============================
// COMMENTS
// ===============================

function renderComments(comments) {
  const list = document.getElementById("commentsList");
  list.innerHTML = "";

  if (!comments.length) {
    list.innerHTML = `<p>${escapeHTML(t("noComments"))}</p>`;
    return;
  }

  comments.forEach(c => {
    const div = document.createElement("div");
    div.className = "comment";
    div.innerHTML = `
      <strong>${escapeHTML(c.name || "Anonymous")}</strong>
      <p>${escapeHTML(c.comment || c.text || "")}</p>
    `;
    list.appendChild(div);
  });
}

async function loadComments() {
  if (!currentMovie) return;

  try {
    const response = await fetch(`/comments?title=${encodeURIComponent(currentMovie)}`);
    const data = await response.json();
    renderComments(data.comments || []);
  } catch (error) {
    document.getElementById("commentsList").innerHTML = "<p>Comments could not be loaded.</p>";
  }
}

function fillCommentName() {
  const nameInput = document.getElementById("commentName");
  if (!nameInput) return;
  if (currentUser) {
    nameInput.value = currentUser.name;
    nameInput.readOnly = true;
  } else {
    nameInput.readOnly = false;
  }
}

async function submitComment() {
  const nameInput = document.getElementById("commentName");
  const textInput = document.getElementById("commentText");

  if (!currentMovie) {
    alert("Please select a movie first.");
    return;
  }

  if (!currentUser) {
    alert(t("loginFirst"));
    openLogin();
    return;
  }

  const name = nameInput.value.trim() || currentUser.name || "Anonymous";
  const comment = textInput.value.trim();

  if (!comment) {
    alert("Please write a comment.");
    return;
  }

  try {
    const response = await fetch("/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: currentMovie, name: name, comment: comment })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Comment failed");

    textInput.value = "";
    loadComments();
  } catch (error) {
    alert("Could not post your comment.");
  }
}

// ===============================
// LOGIN
// ===============================

function openLogin() {
  document.getElementById("loginMessage").textContent = "";
  document.getElementById("loginModal")?.classList.add("show");
}

function closeLogin() {
  document.getElementById("loginModal")?.classList.remove("show");
}

function handleAuthClick() {
  if (currentUser) {
    if (confirm(`${t("signOut")}?`)) logoutUser();
  } else {
    openLogin();
  }
}

function updateAuthUI() {
  const btn = document.getElementById("authBtn");
  if (btn) {
    btn.textContent = currentUser ? `👤 ${currentUser.name}` : t("signIn");
    btn.title = currentUser ? t("signOut") : "";
  }
  fillCommentName();
}

function loginUser() {
  const name = document.getElementById("loginName").value.trim();
  const email = document.getElementById("loginEmail").value.trim();
  const message = document.getElementById("loginMessage");

  if (!name || !email) {
    message.textContent = "Please enter your name and email.";
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    message.textContent = "Please enter a valid email address.";
    return;
  }

  currentUser = { name, email };
  try { localStorage.setItem("lumiere_user", JSON.stringify(currentUser)); } catch (e) {}

  message.textContent = `Welcome to Lumiere, ${name}!`;
  updateAuthUI();

  setTimeout(closeLogin, 1000);
}

function logoutUser() {
  currentUser = null;
  try { localStorage.removeItem("lumiere_user"); } catch (e) {}
  const nameInput = document.getElementById("commentName");
  if (nameInput) nameInput.value = "";
  updateAuthUI();
}

// ===============================
// LANGUAGE
// ===============================

function changeLanguage(language) {
  if (!translations[language]) return;

  currentLanguage = language;
  try { localStorage.setItem("lumiere_lang", language); } catch (e) {}
  document.documentElement.lang = language;

  // plain text elements
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });

  // category labels (filters + sidebar)
  document.querySelectorAll("[data-label]").forEach(el => {
    const emoji = el.dataset.emoji ? el.dataset.emoji + " " : "";
    el.textContent = emoji + catName(el.dataset.label);
  });

  // hero + placeholders + login modal
  document.getElementById("heroText").textContent = t("hero");
  document.getElementById("searchInput").placeholder = t("search");
  document.getElementById("commentName").placeholder = t("yourName");
  document.getElementById("commentText").placeholder = t("writeComment");
  document.getElementById("loginName").placeholder = t("yourName");
  document.getElementById("loginEmail").placeholder = t("email");
  document.getElementById("loginTitle").textContent = t("welcomeTitle");
  document.getElementById("loginSubtitle").textContent = t("welcomeSub");
  document.querySelector(".login-submit").textContent = t("signIn");

  updateSectionTitle();
  updateAuthUI();
}

// ===============================
// STARTUP
// ===============================

document.addEventListener("DOMContentLoaded", function () {
  // restore saved user + language
  try {
    const saved = localStorage.getItem("lumiere_user");
    if (saved) currentUser = JSON.parse(saved);

    const lang = localStorage.getItem("lumiere_lang");
    if (lang && translations[lang]) {
      currentLanguage = lang;
      document.getElementById("languageSelect").value = lang;
    }
  } catch (e) {}

  changeLanguage(currentLanguage);

  // Enter key search
  document.getElementById("searchInput").addEventListener("keydown", function (event) {
    if (event.key === "Enter") searchMovie();
  });

  // click on dark backdrop closes a modal
  ["movieModal", "loginModal"].forEach(id => {
    const modal = document.getElementById(id);
    modal.addEventListener("click", e => {
      if (e.target === modal) {
        id === "movieModal" ? closeMovie() : closeLogin();
      }
    });
  });

  // Escape key closes everything
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeMenu();
      closeMovie();
      closeLogin();
    }
  });

  loadCategory("Featured");
});

// ===============================
// HTML ESCAPE
// ===============================

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}