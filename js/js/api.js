// ========== API SERVICE ==========

const API = {
  async fetch(endpoint, params = {}) {
    const url = new URL(`${CONFIG.BASE_URL}${endpoint}`);
    url.searchParams.set("api_key", CONFIG.API_KEY);
    url.searchParams.set("language", "en-US");

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value);
      }
    });

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error("Fetch error:", err);
      throw err;
    }
  },

  // Trending
  getTrending(page = 1) {
    return this.fetch("/trending/movie/week", { page });
  },

  // Popular
  getPopular(page = 1) {
    return this.fetch("/movie/popular", { page });
  },

  // Top Rated
  getTopRated(page = 1) {
    return this.fetch("/movie/top_rated", { page });
  },

  // Upcoming
  getUpcoming(page = 1) {
    return this.fetch("/movie/upcoming", { page });
  },

  // Movie Details
  getMovie(id) {
    return this.fetch(`/movie/${id}`, {
      append_to_response: "credits,videos,similar",
    });
  },

  // Search
  searchMovies(query, page = 1) {
    return this.fetch("/search/movie", { query, page });
  },

  // Genres
  getGenres() {
    return this.fetch("/genre/movie/list");
  },

  // Discover by genre
  getByGenre(genreId, page = 1) {
    return this.fetch("/discover/movie", {
      with_genres: genreId,
      sort_by: "popularity.desc",
      page,
    });
  },

  // Image helpers
  poster(path) {
    return path
      ? `${CONFIG.IMAGE_BASE}${CONFIG.POSTER_SIZE}${path}`
      : CONFIG.PLACEHOLDER;
  },

  backdrop(path) {
    return path
      ? `${CONFIG.IMAGE_BASE}${CONFIG.BACKDROP_SIZE}${path}`
      : CONFIG.PLACEHOLDER;
  },

  profile(path) {
    return path
      ? `${CONFIG.IMAGE_BASE}${CONFIG.PROFILE_SIZE}${path}`
      : CONFIG.PLACEHOLDER_PERSON;
  },
};
