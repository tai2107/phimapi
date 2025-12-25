// Movie API client - supports multiple sources

export type ApiSource = "phimapi" | "nguonc";

const API_SOURCES = {
  phimapi: {
    base: "https://phimapi.com",
    list: "/danh-sach/phim-moi-cap-nhat",
    detail: "/phim",
  },
  nguonc: {
    base: "https://phim.nguonc.com/api",
    list: "/films/phim-moi-cap-nhat",
    detail: "/film",
  },
};

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

// Fetch new updated movies from specified source
export async function fetchNewMovies(page: number = 1, source: ApiSource = "phimapi"): Promise<MovieListResponse> {
  const api = API_SOURCES[source];
  const response = await fetch(`${api.base}${api.list}?page=${page}`);
  if (!response.ok) throw new Error("Failed to fetch movies");
  
  const data = await response.json();
  
  if (source === "nguonc") {
    // Transform nguonc response to standard format
    return {
      status: data.status === "success",
      items: (data.items || []).map((item: any) => ({
        _id: item.id || item.slug,
        name: item.name,
        slug: item.slug,
        origin_name: item.original_name || item.origin_name || "",
        poster_url: item.poster_url || "",
        thumb_url: item.thumb_url || "",
        year: parseInt(item.year) || 0,
        type: item.type || "series",
        quality: item.quality || "",
        lang: item.language || "",
        time: item.time || "",
        episode_current: item.current_episode || item.episode_current || "",
        episode_total: String(item.total_episodes || item.episode_total || ""),
        category: [],
        country: [],
      })),
      pagination: {
        totalItems: data.paginate?.total_items || data.total || 0,
        totalItemsPerPage: data.paginate?.items_per_page || 24,
        currentPage: data.paginate?.current_page || page,
        totalPages: data.paginate?.total_pages || 1,
      },
    };
  }
  
  return data;
}

// Fetch movie detail from external API (for crawling)
export async function fetchMovieDetailFromAPI(slug: string, source: ApiSource = "phimapi"): Promise<MovieDetailResponse> {
  const api = API_SOURCES[source];
  const response = await fetch(`${api.base}${api.detail}/${slug}`);
  if (!response.ok) throw new Error("Failed to fetch movie detail from API");
  
  const data = await response.json();
  
  if (source === "nguonc") {
    const movie = data.movie;
    if (!movie) throw new Error("Movie not found");
    
    // Parse categories from nguonc format - structure: { "1": { group: { name: "Định dạng" }, list: [...] }, ... }
    const categories: Category[] = [];
    const countries: Country[] = [];
    let year = new Date().getFullYear();
    let type = "series";
    
    if (movie.category && typeof movie.category === 'object') {
      // Iterate through all category groups
      Object.keys(movie.category).forEach((key) => {
        const catGroup = movie.category[key];
        if (!catGroup || !catGroup.group || !catGroup.list) return;
        
        const groupName = catGroup.group.name;
        
        // Parse genres from "Thể loại" group
        if (groupName === "Thể loại") {
          catGroup.list.forEach((item: any) => {
            if (item && item.name) {
              categories.push({ 
                id: item.id || '', 
                name: item.name, 
                slug: createSlugFromName(item.name) 
              });
            }
          });
        }
        
        // Parse countries from "Quốc gia" group
        if (groupName === "Quốc gia") {
          catGroup.list.forEach((item: any) => {
            if (item && item.name) {
              countries.push({ 
                id: item.id || '', 
                name: item.name, 
                slug: createSlugFromName(item.name) 
              });
            }
          });
        }
        
        // Parse year from "Năm" group
        if (groupName === "Năm" && catGroup.list?.[0]?.name) {
          const parsedYear = parseInt(catGroup.list[0].name);
          if (!isNaN(parsedYear)) {
            year = parsedYear;
          }
        }
        
        // Parse format/type from "Định dạng" group
        if (groupName === "Định dạng" && catGroup.list) {
          catGroup.list.forEach((item: any) => {
            if (item && item.name) {
              const itemName = item.name.toLowerCase();
              if (itemName.includes("lẻ") || itemName.includes("single")) {
                type = "single";
              } else if (itemName.includes("hoạt hình")) {
                type = "hoathinh";
              } else if (itemName.includes("tv show")) {
                type = "tvshows";
              } else if (itemName.includes("bộ") || itemName.includes("series")) {
                type = "series";
              }
            }
          });
        }
      });
    }
    
    // Parse episodes from nguonc format
    const episodes: ServerData[] = (movie.episodes || []).map((server: any) => ({
      server_name: server.server_name || "Server #1",
      server_data: (server.items || []).map((ep: any) => ({
        name: ep.name || "",
        slug: ep.slug || "",
        filename: "",
        link_embed: ep.embed || "",
        link_m3u8: ep.m3u8 || "",
        link_mp4: "",
      })),
    }));
    
    // Parse actors/directors - handle null values
    const actors = movie.casts 
      ? String(movie.casts).split(",").map((a: string) => a.trim()).filter(Boolean) 
      : [];
    const directors = movie.director 
      ? (Array.isArray(movie.director) ? movie.director : [movie.director]).filter(Boolean) 
      : [];
    
    return {
      status: true,
      movie: {
        _id: movie.id || movie.slug,
        name: movie.name || "",
        slug: movie.slug || "",
        origin_name: movie.original_name || "",
        poster_url: movie.poster_url || "",
        thumb_url: movie.thumb_url || "",
        year,
        type,
        quality: movie.quality || "",
        lang: movie.language || "",
        time: movie.time || "",
        episode_current: movie.current_episode || "",
        episode_total: String(movie.total_episodes || ""),
        content: movie.description || "",
        status: movie.current_episode?.toLowerCase()?.includes("hoàn tất") ? "completed" : "ongoing",
        showtimes: "",
        trailer_url: "",
        category: categories,
        country: countries,
        actor: actors,
        director: directors,
        episodes: [],
      },
      episodes,
    };
  }
  
  return data;
}

// Helper to create slug from name
function createSlugFromName(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
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
      // Try phimapi first
      return await fetchMovieDetailFromAPI(slug, "phimapi");
    } catch (apiError) {
      console.log("PhimAPI failed, trying NguonC...");
      try {
        return await fetchMovieDetailFromAPI(slug, "nguonc");
      } catch (nguoncError) {
        console.error("Failed to fetch from all external APIs:", nguoncError);
        throw new Error("Failed to fetch movie detail");
      }
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

  const response = await fetch(`${API_SOURCES.phimapi.base}/v1/api/danh-sach/${type}?${params}`);
  if (!response.ok) throw new Error("Failed to fetch movies");
  return response.json();
}

// Search movies
export async function searchMovies(keyword: string, page: number = 1): Promise<any> {
  const response = await fetch(`${API_SOURCES.phimapi.base}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`);
  if (!response.ok) throw new Error("Failed to search movies");
  return response.json();
}

// Fetch categories
export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(`${API_SOURCES.phimapi.base}/the-loai`);
  if (!response.ok) throw new Error("Failed to fetch categories");
  return response.json();
}

// Fetch countries
export async function fetchCountries(): Promise<Country[]> {
  const response = await fetch(`${API_SOURCES.phimapi.base}/quoc-gia`);
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
