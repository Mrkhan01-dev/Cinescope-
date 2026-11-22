// ========== UI HELPERS ==========

const UI = {
  showLoader() {
    document.getElementById("loader").classList.add("active");
  },
  hideLoader() {
    document.getElementById("loader").classList.remove("active");
  },

  showToast(message, icon = "fa-check") {
    const toast = document.getElementById("toast");
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
  },

  createSkeletons(count = 8) {
    return Array.from({ length: count })
      .map(() => `<div class="skeleton skeleton-card"></div>`)
      .join("");
  },

  createMovieCard(movie, isFavorite = false) {
    const year = movie.release_date ? movie.release_date.slice(0, 4) : "N/A";
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";
    const favClass = isFavorite ? "active" : "";

    return `
      <article class="movie-card" data-id="${movie.id}">
        <div class="movie-poster">
          <img src="${API.poster(movie.poster_path)}" alt="${movie.title}" loading="lazy" />
          <span class="movie-rating">
            <i class="fa-solid fa-star"></i> ${rating}
          </span>
          <button class="movie-fav-btn ${favClass}" data-fav-id="${movie.id}" title="Add to Favorites">
            <i class="fa-solid fa-heart"></i>
          </button>
        </div>
        <div class="movie-info">
          <h3 title="${movie.title}">${movie.title}</h3>
          <span class="year">${year}</span>
        </div>
      </article>
    `;
  },

  renderMovies(container, movies, favorites = []) {
    if (!movies || movies.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-film"></i>
          <h3>No movies found</h3>
          <p>Try a different search or category</p>
        </div>`;
      return;
    }
    const favIds = new Set(favorites.map((f) => String(f.id)));
    container.innerHTML = movies
      .map((m) => this.createMovieCard(m, favIds.has(String(m.id))))
      .join("");
  },

  renderHero(movie) {
    const heroBg = document.getElementById("heroBg");
    const heroInfo = document.getElementById("heroInfo");

    heroBg.style.backgroundImage = `url(${API.backdrop(movie.backdrop_path)})`;

    const year = movie.release_date ? movie.release_date.slice(0, 4) : "";
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

    heroInfo.innerHTML = `
      <span class="badge"><i class="fa-solid fa-fire"></i> Trending</span>
      <h1>${movie.title}</h1>
      <div class="hero-meta">
        <span class="rating"><i class="fa-solid fa-star"></i> ${rating}</span>
        <span>${year}</span>
      </div>
      <p>${movie.overview || "No overview available."}</p>
      <div class="hero-actions">
        <button class="btn btn-primary" data-id="${movie.id}" id="heroPlayBtn">
          <i class="fa-solid fa-play"></i> View Details
        </button>
      </div>
    `;
  },

  renderGenres(genres) {
    const container = document.getElementById("genresList");
    container.innerHTML = `
      <button class="genre-btn active" data-genre="all">All</button>
      ${genres
        .map((g) => `<button class="genre-btn" data-genre="${g.id}">${g.name}</button>`)
        .join("")}
    `;
  },

  renderPagination(container, currentPage, totalPages, onPageClick) {
    totalPages = Math.min(totalPages, 20);
    let html = "";

    html += `<button class="page-btn" data-page="${currentPage - 1}" ${
      currentPage === 1 ? "disabled" : ""
    }><i class="fa-solid fa-chevron-left"></i></button>`;

    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);

    if (start > 1) {
      html += `<button class="page-btn" data-page="1">1</button>`;
      if (start > 2) html += `<span style="color:var(--text-muted)">...</span>`;
    }

    for (let i = start; i <= end; i++) {
      html += `<button class="page-btn ${i === currentPage ? "active" : ""}" data-page="${i}">${i}</button>`;
    }

    if (end < totalPages) {
      if (end < totalPages - 1) html += `<span style="color:var(--text-muted)">...</span>`;
      html += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
    }

    html += `<button class="page-btn" data-page="${currentPage + 1}" ${
      currentPage === totalPages ? "disabled" : ""
    }><i class="fa-solid fa-chevron-right"></i></button>`;

    container.innerHTML = html;

    container.querySelectorAll(".page-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const page = parseInt(btn.dataset.page);
        if (!isNaN(page) && page >= 1 && page <= totalPages) {
          onPageClick(page);
        }
      });
    });
  },

  renderDetail(movie, isFavorite = false) {
    const container = document.getElementById("detailContent");
    const backdrop = document.getElementById("detailBackdrop");

    backdrop.style.backgroundImage = `url(${API.backdrop(movie.backdrop_path)})`;

    const year = movie.release_date ? movie.release_date.slice(0, 4) : "N/A";
    const runtime = movie.runtime
      ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
      : "N/A";
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";
    const genres = (movie.genres || [])
      .map((g) => `<span>${g.name}</span>`)
      .join("");

    const trailer = (movie.videos?.results || []).find(
      (v) => v.type === "Trailer" && v.site === "YouTube"
    );

    const cast = (movie.credits?.cast || []).slice(0, 12);
    const similar = (movie.similar?.results || []).slice(0, 8);

    container.innerHTML = `
      <div class="detail-poster">
        <img src="${API.poster(movie.poster_path)}" alt="${movie.title}" />
      </div>
      <div class="detail-info">
        <h1>${movie.title}</h1>
        ${movie.tagline ? `<p class="detail-tagline">"${movie.tagline}"</p>` : ""}
        <div class="detail-meta">
          <span class="rating"><i class="fa-solid fa-star"></i> ${rating} / 10</span>
          <span>${year}</span>
          <span>${runtime}</span>
          <span>${movie.status || ""}</span>
        </div>
        <div class="detail-genres">${genres}</div>
        <div class="detail-overview">
          <h3>Overview</h3>
          <p>${movie.overview || "No overview available."}</p>
        </div>
        <div class="detail-actions">
          ${
            trailer
              ? `<button class="btn btn-primary" id="watchTrailerBtn" data-key="${trailer.key}">
                  <i class="fa-brands fa-youtube"></i> Watch Trailer
                </button>`
              : ""
          }
          <button class="btn btn-fav ${isFavorite ? "active" : ""}" id="detailFavBtn" data-id="${movie.id}">
            <i class="fa-solid fa-heart"></i> ${isFavorite ? "In Favorites" : "Add to Favorites"}
          </button>
          <a href="https://www.themoviedb.org/movie/${movie.id}" target="_blank" rel="noopener" class="btn btn-secondary">
            <i class="fa-solid fa-external-link"></i> More Info
          </a>
        </div>
        ${
          cast.length
            ? `
          <div class="cast-section">
            <h3>Top Cast</h3>
            <div class="cast-grid">
              ${cast
                .map(
                  (c) => `
                <div class="cast-card">
                  <img src="${API.profile(c.profile_path)}" alt="${c.name}" loading="lazy" />
                  <h4 title="${c.name}">${c.name}</h4>
                  <span title="${c.character || ""}">${c.character || ""}</span>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        `
            : ""
        }
        ${
          similar.length
            ? `
          <div class="similar-section">
            <h3>Similar Movies</h3>
            <div class="movies-grid" id="similarGrid">
              ${similar.map((m) => this.createMovieCard(m, false)).join("")}
            </div>
          </div>
        `
            : ""
        }
      </div>
    `;
  },

  renderSearchResults(results) {
    const container = document.getElementById("searchResults");
    if (!results || results.length === 0) {
      container.innerHTML = `<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:0.9rem;">No results found</div>`;
      container.classList.add("active");
      return;
    }

    container.innerHTML = results
      .slice(0, 8)
      .map((m) => {
        const year = m.release_date ? m.release_date.slice(0, 4) : "";
        return `
          <div class="search-item" data-id="${m.id}">
            <img src="${API.poster(m.poster_path)}" alt="${m.title}" />
            <div class="search-item-info">
              <h4>${m.title}</h4>
              <span>${year}</span>
            </div>
          </div>
        `;
      })
      .join("");

    container.classList.add("active");
  },

  hideSearchResults() {
    document.getElementById("searchResults").classList.remove("active");
  },

  showSection(sectionId) {
    document.getElementById("homeSection").classList.add("hidden");
    document.getElementById("listingSection").classList.add("hidden");
    document.getElementById("detailSection").classList.add("hidden");
    document.getElementById("heroSection").classList.add("hidden");
    document.querySelector(".genres-section").classList.add("hidden");

    if (sectionId === "home") {
      document.getElementById("homeSection").classList.remove("hidden");
      document.getElementById("heroSection").classList.remove("hidden");
      document.querySelector(".genres-section").classList.remove("hidden");
    } else if (sectionId === "detail") {
      document.getElementById("detailSection").classList.remove("hidden");
    } else {
      document.getElementById("listingSection").classList.remove("hidden");
    }
  },

  setActiveNav(page) {
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.toggle("active", link.dataset.page === page);
    });
  },

  updateFavCount(count) {
    const el = document.getElementById("favCount");
    if (el) el.textContent = count;
  },

  openTrailer(key) {
    const modal = document.getElementById("trailerModal");
    const frame = document.getElementById("trailerFrame");
    frame.src = `https://www.youtube.com/embed/${key}?autoplay=1&rel=0`;
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  },

  closeTrailer() {
    const modal = document.getElementById("trailerModal");
    const frame = document.getElementById("trailerFrame");
    frame.src = "";
    modal.classList.remove("active");
    document.body.style.overflow = "";
  },
};
