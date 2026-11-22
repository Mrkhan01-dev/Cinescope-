// ========== MAIN APP ==========

const App = {
  currentPage: "home",
  currentListType: null,
  currentListPage: 1,
  genres: [],
  selectedGenre: "all",
  searchTimeout: null,
  heroMovies: [],
  heroIndex: 0,
  heroInterval: null,
  favorites: [],

  async init() {
    if (CONFIG.API_KEY === "YOUR_TMDB_API_KEY_HERE") {
      this.showApiKeyWarning();
      return;
    }

    this.loadFavorites();
    this.bindEvents();
    this.initTheme();
    this.initScrollTop();
    await this.loadHome();
  },

  // ---------- Favorites (localStorage) ----------
  loadFavorites() {
    try {
      this.favorites = JSON.parse(localStorage.getItem("cinescope-favorites")) || [];
    } catch {
      this.favorites = [];
    }
    UI.updateFavCount(this.favorites.length);
  },

  saveFavorites() {
    localStorage.setItem("cinescope-favorites", JSON.stringify(this.favorites));
    UI.updateFavCount(this.favorites.length);
  },

  isFavorite(id) {
    return this.favorites.some((f) => String(f.id) === String(id));
  },

  toggleFavorite(movie) {
    const id = String(movie.id);
    const exists = this.favorites.findIndex((f) => String(f.id) === id);

    if (exists > -1) {
      this.favorites.splice(exists, 1);
      UI.showToast("Removed from Favorites", "fa-heart-crack");
    } else {
      this.favorites.unshift({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
      });
      UI.showToast("Added to Favorites", "fa-heart");
    }
    this.saveFavorites();
    return exists === -1;
  },

  // ---------- API Key Warning ----------
  showApiKeyWarning() {
    document.body.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0b0c10;color:#fff;font-family:Inter,sans-serif;padding:20px;text-align:center;">
        <div style="max-width:520px;">
          <h1 style="font-size:2rem;margin-bottom:16px;">🔑 API Key Required</h1>
          <p style="color:#a0a8b8;margin-bottom:24px;line-height:1.6;">
            Please get a free TMDB API key and put it in <code style="background:#1a1d24;padding:2px 8px;border-radius:4px;">js/config.js</code>
          </p>
          <ol style="text-align:left;color:#a0a8b8;line-height:2;margin-bottom:28px;padding-left:20px;">
            <li>Go to <a href="https://www.themoviedb.org/settings/api" target="_blank" style="color:#e50914;">themoviedb.org/settings/api</a></li>
            <li>Create free account → Request API Key</li>
            <li>Copy the key → Paste in <code>js/config.js</code></li>
            <li>Refresh this page</li>
          </ol>
          <a href="https://www.themoviedb.org/settings/api" target="_blank" style="display:inline-block;background:#e50914;color:white;padding:12px 28px;border-radius:999px;font-weight:600;text-decoration:none;">
            Get Free API Key →
          </a>
        </div>
      </div>
    `;
  },

  // ---------- Events ----------
  bindEvents() {
    // Navigation
    document.querySelectorAll(".nav-link, .see-all").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const page = el.dataset.page;
        if (page) this.navigate(page);
      });
    });

    document.getElementById("logo").addEventListener("click", (e) => {
      e.preventDefault();
      this.navigate("home");
    });

    // Mobile menu
    document.getElementById("menuToggle").addEventListener("click", () => {
      document.getElementById("navLinks").classList.toggle("open");
    });

    // Theme
    document.getElementById("themeToggle").addEventListener("click", () => {
      this.toggleTheme();
    });

    // Search
    const searchInput = document.getElementById("searchInput");
    const searchClear = document.getElementById("searchClear");

    searchInput.addEventListener("input", (e) => {
      clearTimeout(this.searchTimeout);
      const query = e.target.value.trim();
      searchClear.classList.toggle("hidden", query.length === 0);

      if (query.length < 2) {
        UI.hideSearchResults();
        return;
      }
      this.searchTimeout = setTimeout(() => this.handleSearch(query), 350);
    });

    searchClear.addEventListener("click", () => {
      searchInput.value = "";
      searchClear.classList.add("hidden");
      UI.hideSearchResults();
      searchInput.focus();
    });

    searchInput.addEventListener("focus", () => {
      if (searchInput.value.trim().length >= 2) {
        document.getElementById("searchResults").classList.add("active");
      }
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-box")) {
        UI.hideSearchResults();
      }
    });

    // Movie card click + Favorite button (event delegation)
    document.addEventListener("click", (e) => {
      // Favorite button on card
      const favBtn = e.target.closest(".movie-fav-btn");
      if (favBtn) {
        e.stopPropagation();
        e.preventDefault();
        const id = favBtn.dataset.favId;
        const card = favBtn.closest(".movie-card");
        const title = card?.querySelector("h3")?.textContent || "Movie";
        const img = card?.querySelector("img")?.src || "";
        const poster_path = img.includes("/w500") ? img.split("/w500")[1] : null;

        const movie = {
          id,
          title,
          poster_path,
          release_date: card?.querySelector(".year")?.textContent || "",
          vote_average: parseFloat(card?.querySelector(".movie-rating")?.textContent) || 0,
        };

        const added = this.toggleFavorite(movie);
        favBtn.classList.toggle("active", added);
        return;
      }

      // Open movie detail
      const card = e.target.closest(".movie-card, .search-item, #heroPlayBtn");
      if (card && card.dataset.id) {
        this.showMovieDetail(card.dataset.id);
        UI.hideSearchResults();
        document.getElementById("searchInput").value = "";
        document.getElementById("searchClear").classList.add("hidden");
      }
    });

    // Back button
    document.getElementById("backBtn").addEventListener("click", () => {
      if (this.currentPage === "favorites") {
        this.navigate("favorites");
      } else if (this.currentPage === "home") {
        this.navigate("home");
      } else {
        this.navigate(this.currentPage);
      }
    });

    // Genre filter
    document.getElementById("genresList").addEventListener("click", (e) => {
      const btn = e.target.closest(".genre-btn");
      if (!btn) return;
      document.querySelectorAll(".genre-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      this.selectedGenre = btn.dataset.genre;
      this.loadGenreMovies(this.selectedGenre);
    });

    // Trailer modal close
    document.getElementById("modalClose").addEventListener("click", () => UI.closeTrailer());
    document.getElementById("trailerModal").addEventListener("click", (e) => {
      if (e.target.id === "trailerModal") UI.closeTrailer();
    });

    // Escape key closes modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") UI.closeTrailer();
    });

    // Clear favorites
    document.getElementById("clearFavoritesBtn").addEventListener("click", () => {
      if (confirm("Clear all favorites?")) {
        this.favorites = [];
        this.saveFavorites();
        this.loadFavoritesPage();
        UI.showToast("Favorites cleared", "fa-trash");
      }
    });
  },

  // ---------- Theme ----------
  initTheme() {
    const saved = localStorage.getItem("cinescope-theme") || "dark";
    document.documentElement.setAttribute("data-theme", saved);
    this.updateThemeIcon(saved);
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("cinescope-theme", next);
    this.updateThemeIcon(next);
  },

  updateThemeIcon(theme) {
    const icon = document.querySelector("#themeToggle i");
    icon.className = theme === "dark" ? "fa-solid fa-moon" : "fa-solid fa-sun";
  },

  // ---------- Scroll to Top ----------
  initScrollTop() {
    const btn = document.getElementById("scrollTop");
    window.addEventListener("scroll", () => {
      btn.classList.toggle("visible", window.scrollY > 400);
    });
    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  },

  // ---------- Navigation ----------
  async navigate(page) {
    this.currentPage = page;
    UI.setActiveNav(page);
    document.getElementById("navLinks").classList.remove("open");

    document.getElementById("clearFavoritesBtn").classList.add("hidden");

    if (page === "home") {
      UI.showSection("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (page === "favorites") {
      this.loadFavoritesPage();
      return;
    }

    this.currentListType = page;
    this.currentListPage = 1;
    await this.loadListing(page, 1);
  },

  // ---------- Home ----------
  async loadHome() {
    UI.showLoader();
    try {
      const [trending, popular, topRated, upcoming, genreData] = await Promise.all([
        API.getTrending(),
        API.getPopular(),
        API.getTopRated(),
        API.getUpcoming(),
        API.getGenres(),
      ]);

      this.genres = genreData.genres || [];
      UI.renderGenres(this.genres);

      this.heroMovies = trending.results.slice(0, 5);
      this.heroIndex = 0;
      this.startHeroSlider();

      UI.renderMovies(document.getElementById("trendingGrid"), trending.results.slice(0, 12), this.favorites);
      UI.renderMovies(document.getElementById("popularGrid"), popular.results.slice(0, 12), this.favorites);
      UI.renderMovies(document.getElementById("topRatedGrid"), topRated.results.slice(0, 12), this.favorites);
      UI.renderMovies(document.getElementById("upcomingGrid"), upcoming.results.slice(0, 12), this.favorites);

      UI.showSection("home");
    } catch (err) {
      console.error(err);
      alert("Failed to load movies. Check your API key and internet connection.");
    } finally {
      UI.hideLoader();
    }
  },

  // ---------- Hero Slider ----------
  startHeroSlider() {
    if (this.heroMovies.length === 0) return;

    const show = (index) => {
      this.heroIndex = index;
      UI.renderHero(this.heroMovies[index]);

      const indicators = document.getElementById("heroIndicators");
      indicators.innerHTML = this.heroMovies
        .map((_, i) => `<span class="${i === index ? "active" : ""}" data-index="${i}"></span>`)
        .join("");

      indicators.querySelectorAll("span").forEach((dot) => {
        dot.addEventListener("click", () => {
          clearInterval(this.heroInterval);
          show(parseInt(dot.dataset.index));
          this.heroInterval = setInterval(next, 6000);
        });
      });
    };

    const next = () => {
      const nextIndex = (this.heroIndex + 1) % this.heroMovies.length;
      show(nextIndex);
    };

    show(0);
    clearInterval(this.heroInterval);
    this.heroInterval = setInterval(next, 6000);
  },

  // ---------- Listing Pages ----------
  async loadListing(type, page = 1) {
    UI.showLoader();
    UI.showSection("listing");

    const titles = {
      trending: "Trending This Week",
      popular: "Popular Movies",
      "top-rated": "Top Rated Movies",
      upcoming: "Upcoming Movies",
    };

    document.getElementById("listingTitle").textContent = titles[type] || "Movies";

    try {
      let data;
      switch (type) {
        case "trending": data = await API.getTrending(page); break;
        case "popular": data = await API.getPopular(page); break;
        case "top-rated": data = await API.getTopRated(page); break;
        case "upcoming": data = await API.getUpcoming(page); break;
        default: data = await API.getPopular(page);
      }

      UI.renderMovies(document.getElementById("listingGrid"), data.results, this.favorites);

      UI.renderPagination(
        document.getElementById("pagination"),
        page,
        data.total_pages,
        (newPage) => {
          this.currentListPage = newPage;
          this.loadListing(type, newPage);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      );
    } catch (err) {
      console.error(err);
    } finally {
      UI.hideLoader();
    }
  },

  // ---------- Favorites Page ----------
  loadFavoritesPage() {
    UI.showSection("listing");
    document.getElementById("listingTitle").textContent = "My Favorites";
    document.getElementById("clearFavoritesBtn").classList.toggle("hidden", this.favorites.length === 0);
    document.getElementById("pagination").innerHTML = "";

    if (this.favorites.length === 0) {
      document.getElementById("listingGrid").innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-heart"></i>
          <h3>No favorites yet</h3>
          <p>Click the heart icon on any movie to add it here</p>
        </div>`;
    } else {
      UI.renderMovies(document.getElementById("listingGrid"), this.favorites, this.favorites);
    }
  },

  // ---------- Genre Filter ----------
  async loadGenreMovies(genreId) {
    if (genreId === "all") {
      const [trending, popular, topRated, upcoming] = await Promise.all([
        API.getTrending(),
        API.getPopular(),
        API.getTopRated(),
        API.getUpcoming(),
      ]);
      UI.renderMovies(document.getElementById("trendingGrid"), trending.results.slice(0, 12), this.favorites);
      UI.renderMovies(document.getElementById("popularGrid"), popular.results.slice(0, 12), this.favorites);
      UI.renderMovies(document.getElementById("topRatedGrid"), topRated.results.slice(0, 12), this.favorites);
      UI.renderMovies(document.getElementById("upcomingGrid"), upcoming.results.slice(0, 12), this.favorites);
      return;
    }

    UI.showLoader();
    try {
      const data = await API.getByGenre(genreId);
      UI.renderMovies(document.getElementById("trendingGrid"), data.results.slice(0, 18), this.favorites);
      document.getElementById("popularGrid").innerHTML = "";
      document.getElementById("topRatedGrid").innerHTML = "";
      document.getElementById("upcomingGrid").innerHTML = "";
    } catch (err) {
      console.error(err);
    } finally {
      UI.hideLoader();
    }
  },

  // ---------- Search ----------
  async handleSearch(query) {
    try {
      const data = await API.searchMovies(query);
      UI.renderSearchResults(data.results);
    } catch (err) {
      console.error(err);
    }
  },

  // ---------- Movie Detail ----------
  async showMovieDetail(id) {
    UI.showLoader();
    try {
      const movie = await API.getMovie(id);
      const isFav = this.isFavorite(id);
      UI.renderDetail(movie, isFav);
      UI.showSection("detail");
      window.scrollTo({ top: 0, behavior: "smooth" });

      const trailerBtn = document.getElementById("watchTrailerBtn");
      if (trailerBtn) {
        trailerBtn.addEventListener("click", () => {
          UI.openTrailer(trailerBtn.dataset.key);
        });
      }

      const favBtn = document.getElementById("detailFavBtn");
      if (favBtn) {
        favBtn.addEventListener("click", () => {
          const added = this.toggleFavorite(movie);
          favBtn.classList.toggle("active", added);
          favBtn.innerHTML = `<i class="fa-solid fa-heart"></i> ${added ? "In Favorites" : "Add to Favorites"}`;
        });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load movie details.");
    } finally {
      UI.hideLoader();
    }
  },
};

// Start
document.addEventListener("DOMContentLoaded", () => App.init());
