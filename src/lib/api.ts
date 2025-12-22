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

// Fetch movie by slug
export async function fetchMovieDetail(slug: string): Promise<MovieDetailResponse> {
  const response = await fetch(`${API_BASE_URL}/phim/${slug}`);
  if (!response.ok) throw new Error("Failed to fetch movie detail");
  return response.json();
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
