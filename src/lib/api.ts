// KKPhim API client

const API_BASE_URL = "https://phimapi.com";

export interface Movie {
  _id: string;
  name: string;
  slug: string;
  origin_name: string;
  poster_url: string;
  thumb_url: string;
  year: number;
  type: string;
  quality: string;
  lang: string;
  time: string;
  episode_current: string;
  episode_total: string;
  category: Category[];
  country: Country[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Country {
  id: string;
  name: string;
  slug: string;
}

export interface Episode {
  name: string;
  slug: string;
  filename: string;
  link_embed: string;
  link_m3u8: string;
  link_mp4: string;
}

export interface ServerData {
  server_name: string;
  server_data: Episode[];
}

export interface MovieDetail extends Movie {
  content: string;
  status: string;
  showtimes: string;
  trailer_url: string;
  actor: string[];
  director: string[];
  episodes: ServerData[];
}

export interface PaginatedResponse<T> {
  status: string;
  items: T[];
  pagination: {
    totalItems: number;
    totalItemsPerPage: number;
    currentPage: number;
    totalPages: number;
  };
}

export interface MovieListResponse {
  status: boolean;
  items: Movie[];
  pagination: {
    totalItems: number;
    totalItemsPerPage: number;
    currentPage: number;
    totalPages: number;
  };
}

export interface MovieDetailResponse {
  status: boolean;
  movie: MovieDetail;
  episodes: ServerData[];
}

// Fetch new updated movies
export async function fetchNewMovies(page: number = 1): Promise<MovieListResponse> {
  const response = await fetch(`${API_BASE_URL}/danh-sach/phim-moi-cap-nhat?page=${page}`);
  if (!response.ok) throw new Error("Failed to fetch movies");
  return response.json();
}

// Fetch movie detail from external API (for crawling)
export async function fetchMovieDetailFromAPI(slug: string): Promise<MovieDetailResponse> {
  const response = await fetch(`${API_BASE_URL}/phim/${slug}`);
  if (!response.ok) throw new Error("Failed to fetch movie detail from API");
  return response.json();
}

// Fetch movie by slug from Supabase, fallback to external API if not found
export async function fetchMovieDetail(slug: string): Promise<MovieDetailResponse> {
  const { supabase } = await import("@/integrations/supabase/client");
  
  // Fetch movie with related data from local database
  const { data: movie, error } = await supabase
    .from("movies")
    .select(`
      *,
      movie_genres(genres(*)),
      movie_countries(countries(*)),
      movie_actors(actors(*)),
      movie_directors(directors(*))
    `)
    .eq("slug", slug)
    .maybeSingle();

  // If not found in local database, try fetching from external API
  if (!movie) {
    console.log(`Movie "${slug}" not found in local DB, fetching from external API...`);
    try {
      return await fetchMovieDetailFromAPI(slug);
    } catch (apiError) {
      console.error("Failed to fetch from external API:", apiError);
      throw new Error("Failed to fetch movie detail");
    }
  }

  if (error) {
    throw new Error("Failed to fetch movie detail");
  }

  // Fetch episodes
  const { data: episodes } = await supabase
    .from("episodes")
    .select("*")
    .eq("movie_id", movie.id)
    .order("server_name")
    .order("slug");

  // Transform data to match MovieDetailResponse format
  const transformedMovie: MovieDetail = {
    _id: movie.id,
    name: movie.name,
    slug: movie.slug,
    origin_name: movie.origin_name || "",
    poster_url: movie.poster_url || "",
    thumb_url: movie.thumb_url || "",
    year: movie.year || 0,
    type: movie.type,
    quality: movie.quality || "",
    lang: movie.lang || "",
    time: movie.time || "",
    episode_current: movie.episode_current || "",
    episode_total: movie.episode_total || "",
    content: movie.content || "",
    status: movie.status,
    showtimes: "",
    trailer_url: movie.trailer_url || "",
    category: movie.movie_genres?.map((mg: any) => ({
      id: mg.genres?.id,
      name: mg.genres?.name,
      slug: mg.genres?.slug,
    })).filter((c: any) => c.id) || [],
    country: movie.movie_countries?.map((mc: any) => ({
      id: mc.countries?.id,
      name: mc.countries?.name,
      slug: mc.countries?.slug,
    })).filter((c: any) => c.id) || [],
    actor: movie.movie_actors?.map((ma: any) => ma.actors?.name).filter(Boolean) || [],
    director: movie.movie_directors?.map((md: any) => md.directors?.name).filter(Boolean) || [],
    episodes: [],
  };

  // Group episodes by server
  const serverMap = new Map<string, Episode[]>();
  (episodes || []).forEach((ep: any) => {
    const serverName = ep.server_name || "Default";
    if (!serverMap.has(serverName)) {
      serverMap.set(serverName, []);
    }
    serverMap.get(serverName)!.push({
      name: ep.name,
      slug: ep.slug,
      filename: ep.filename || "",
      link_embed: ep.link_embed || "",
      link_m3u8: ep.link_m3u8 || "",
      link_mp4: ep.link_mp4 || "",
    });
  });

  const transformedEpisodes: ServerData[] = Array.from(serverMap.entries()).map(([name, data]) => ({
    server_name: name,
    server_data: data,
  }));

  return {
    status: true,
    movie: transformedMovie,
    episodes: transformedEpisodes,
  };
}

// Fetch movies by type
export async function fetchMoviesByType(
  type: string,
  page: number = 1,
  options?: {
    category?: string;
    country?: string;
    year?: number;
    limit?: number;
  }
): Promise<any> {
  const params = new URLSearchParams({
    page: page.toString(),
  });
  
  if (options?.category) params.append("category", options.category);
  if (options?.country) params.append("country", options.country);
  if (options?.year) params.append("year", options.year.toString());
  if (options?.limit) params.append("limit", options.limit.toString());

  const response = await fetch(`${API_BASE_URL}/v1/api/danh-sach/${type}?${params}`);
  if (!response.ok) throw new Error("Failed to fetch movies");
  return response.json();
}

// Search movies
export async function searchMovies(keyword: string, page: number = 1): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`);
  if (!response.ok) throw new Error("Failed to search movies");
  return response.json();
}

// Fetch categories
export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(`${API_BASE_URL}/the-loai`);
  if (!response.ok) throw new Error("Failed to fetch categories");
  return response.json();
}

// Fetch countries
export async function fetchCountries(): Promise<Country[]> {
  const response = await fetch(`${API_BASE_URL}/quoc-gia`);
  if (!response.ok) throw new Error("Failed to fetch countries");
  return response.json();
}

// Get full poster URL
export function getPosterUrl(url: string): string {
  if (!url) return "/placeholder.svg";
  if (url.startsWith("http")) return url;
  return `https://phimimg.com/${url}`;
}

// Get thumb URL
export function getThumbUrl(url: string): string {
  if (!url) return "/placeholder.svg";
  if (url.startsWith("http")) return url;
  return `https://phimimg.com/${url}`;
}
