# CineScope — Professional Movie Discovery Website

Modern, responsive movie discovery web app built with pure **HTML, CSS & JavaScript**.  
Uses the **TMDB API** for real-time movie data.

---

## Features

- Beautiful Dark / Light theme (saved in localStorage)
- Trending, Popular, Top Rated & Upcoming movies
- Auto-sliding Hero banner
- Genre filter
- Live search with dropdown results
- Full movie detail page (cast, trailer modal, similar movies, ratings)
- **Favorites** system (localStorage) — heart icon on every card
- Trailer modal (YouTube embed)
- Pagination on listing pages
- Toast notifications
- Scroll to top button
- Fully responsive (mobile + tablet + desktop)
- Clean professional folder structure

---

## Project Structure

```
movie-website/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── config.js      ← API key yahan daalo
│   ├── api.js         ← TMDB API calls
│   ├── ui.js          ← UI rendering helpers
│   └── app.js         ← Main app logic + Favorites
├── assets/            ← (optional)
├── .gitignore
└── README.md
```

---

## Step-by-Step Guide

### 1. Get Free TMDB API Key

1. Open → [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
2. Account banao (free)
3. "Request an API Key" pe click karo
4. Type: **Developer** select karo
5. Form fill karo (application name kuch bhi rakh sakte ho)
6. API Key mil jayegi (v3 auth wala key)

### 2. Project Setup

1. Saari files download / copy kar lo
2. `js/config.js` file kholo
3. Ye line change karo:

```js
API_KEY: "YOUR_TMDB_API_KEY_HERE"
```

Apni real key paste kar do.

4. `index.html` ko browser mein open karo  
   **Ya** VS Code + Live Server extension use karo (recommended)

### 3. Local Testing

- Chrome / Firefox mein `index.html` open karo
- Agar "API Key Required" dikhe → config.js mein key sahi se paste nahi hui
- Console (F12) check karo agar koi error aaye

### 4. GitHub pe Deploy (Live)

#### Method A — GitHub Website se

1. [GitHub.com](https://github.com) pe login karo
2. **New repository** banao (name: `cinescope` ya `movie-website`)
3. Public select karo
4. "uploading an existing file" pe click karo
5. Saari files drag & drop kar do (folder structure maintain rakho)
6. Commit changes
7. **Settings** → left side **Pages**
8. Source: **Deploy from a branch**
9. Branch: `main` → Folder: `/ (root)` → **Save**
10. 1-2 minute wait karo
11. Site live ho jayegi:  
    `https://YOUR_USERNAME.github.io/REPOSITORY_NAME/`

#### Method B — Git se (better)

```bash
# Project folder mein jao
cd movie-website

# Git init
git init
git add .
git commit -m "Initial commit - CineScope movie website"

# GitHub pe repo banao pehle, phir:
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

Phir GitHub → Settings → Pages → Deploy from branch → main → Save

---

## How to Use the Website

| Feature            | How to use                                      |
|--------------------|-------------------------------------------------|
| Search             | Navbar search box mein type karo                |
| Favorites          | Movie card pe heart icon click karo             |
| Favorites page     | Navbar → Favorites                              |
| Trailer            | Movie detail → Watch Trailer button             |
| Theme toggle       | Navbar mein moon / sun icon                     |
| Genre filter       | Home page pe genre buttons                      |
| See All            | Section ke right side "See All" pe click        |

---

## Tech Stack

- HTML5
- CSS3 (Custom Properties, Grid, Flexbox)
- Vanilla JavaScript (ES6+)
- TMDB API
- Font Awesome 6
- Google Fonts (Inter)
- localStorage (Favorites + Theme)

---

## Important Notes

- API key **public** repo mein daalne se pehle soch lo (free tier ke liye usually theek hai)
- Agar key leak hone ka dar ho to GitHub Secrets + environment variable use kar sakte ho (advanced)
- TMDB ke terms of use follow karo
- Ye project educational / portfolio ke liye best hai

---

## License

Free to use for personal and educational purposes.  
Movie data provided by [The Movie Database (TMDB)](https://www.themoviedb.org/).

---

Made with ❤️ for learning & portfolio projects
