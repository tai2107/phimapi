import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Film } from "lucide-react";
import { Layout } from "@/components/Layout";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const ITEMS_PER_PAGE = 24;

interface Movie {
  id: string;
  name: string;
  slug: string;
  origin_name: string | null;
  poster_url: string | null;
  thumb_url: string | null;
  year: number | null;
  type: string;
  quality: string | null;
  lang: string | null;
  episode_current: string | null;
  episode_total: string | null;
}

const AllMovies = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1");

  // Fetch total count
  const { data: countData } = useQuery({
    queryKey: ["movies-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("movies")
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null);
      
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch movies with pagination
  const { data: movies, isLoading, error } = useQuery({
    queryKey: ["all-movies", currentPage],
    queryFn: async () => {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from("movies")
        .select("id, name, slug, origin_name, poster_url, thumb_url, year, type, quality, lang, episode_current, episode_total")
        .is("deleted_at", null)
        .order("updated_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      return data as Movie[];
    },
  });

  const totalItems = countData || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setSearchParams({ page: page.toString() });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getPosterUrl = (url: string | null): string => {
    if (!url) return "/placeholder.svg";
    if (url.startsWith("http")) return url;
    return `https://phimimg.com/${url}`;
  };

  return (
    <Layout>
      <SEOHead 
        title="Tất cả phim"
        description="Xem tất cả phim có trên website, cập nhật liên tục với chất lượng cao nhất."
      />
      
      <div className="container px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Film className="h-6 w-6 text-primary" />
            Tất cả phim
          </h1>
          <span className="text-sm text-muted-foreground">
            {totalItems.toLocaleString()} phim
          </span>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {[...Array(18)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] rounded-lg bg-muted" />
                <div className="mt-2 h-4 w-3/4 rounded bg-muted" />
                <div className="mt-1 h-3 w-1/2 rounded bg-muted" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex min-h-[50vh] items-center justify-center">
            <p className="text-muted-foreground">Có lỗi xảy ra khi tải dữ liệu</p>
          </div>
        )}

        {/* Movie grid */}
        {!isLoading && !error && movies && (
          <>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {movies.map((movie) => (
                <Link
                  key={movie.id}
                  to={`/phim/${movie.slug}`}
                  className="group relative overflow-hidden rounded-lg bg-card transition-transform hover:scale-105"
                >
                  {/* Poster */}
                  <div className="aspect-[2/3] overflow-hidden">
                    <img
                      src={getPosterUrl(movie.poster_url || movie.thumb_url)}
                      alt={movie.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>

                  {/* Badges */}
                  <div className="absolute left-1 top-1 flex flex-wrap gap-1">
                    {movie.quality && (
                      <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                        {movie.quality}
                      </span>
                    )}
                    {movie.lang && (
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                        {movie.lang}
                      </span>
                    )}
                  </div>

                  {/* Episode info */}
                  {movie.episode_current && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <span className="text-xs text-white">
                        {movie.episode_current}
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  <div className="p-2">
                    <h3 className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {movie.name}
                    </h3>
                    {movie.origin_name && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {movie.origin_name}
                      </p>
                    )}
                    {movie.year && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {movie.year}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Empty state */}
            {movies.length === 0 && (
              <div className="flex min-h-[50vh] items-center justify-center">
                <p className="text-muted-foreground">Không có phim nào</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="h-10 w-10"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1">
                  {/* First page */}
                  {currentPage > 3 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(1)}
                        className="h-10 w-10"
                      >
                        1
                      </Button>
                      {currentPage > 4 && (
                        <span className="px-2 text-muted-foreground">...</span>
                      )}
                    </>
                  )}

                  {/* Pages around current */}
                  {Array.from({ length: 5 }, (_, i) => currentPage - 2 + i)
                    .filter((page) => page >= 1 && page <= totalPages)
                    .map((page) => (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className="h-10 w-10"
                      >
                        {page}
                      </Button>
                    ))}

                  {/* Last page */}
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && (
                        <span className="px-2 text-muted-foreground">...</span>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(totalPages)}
                        className="h-10 w-10"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="h-10 w-10"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Page info */}
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Trang {currentPage} / {totalPages}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default AllMovies;
