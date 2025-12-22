import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { Layout } from "@/components/Layout";
import { MovieCard } from "@/components/MovieCard";
import { Button } from "@/components/ui/button";
import { fetchMoviesByType } from "@/lib/api";

const typeLabels: Record<string, string> = {
  "phim-bo": "Phim Bộ",
  "phim-le": "Phim Lẻ",
  "hoat-hinh": "Hoạt Hình",
  "tv-shows": "TV Shows",
  "phim-vietsub": "Phim Vietsub",
  "phim-thuyet-minh": "Phim Thuyết Minh",
  "phim-long-tieng": "Phim Lồng Tiếng",
};

const MovieList = () => {
  const { type } = useParams<{ type: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1");

  const { data, isLoading, error } = useQuery({
    queryKey: ["movieList", type, currentPage],
    queryFn: () => fetchMoviesByType(type!, currentPage, { limit: 24 }),
    enabled: !!type,
  });

  const movies = data?.data?.items || [];
  const pagination = data?.data?.params?.pagination || {};
  const totalPages = pagination.totalPages || 1;

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setSearchParams({ page: page.toString() });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const title = type ? typeLabels[type] || type : "Danh sách phim";

  return (
    <Layout>
      <div className="container px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
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
        {!isLoading && !error && (
          <>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {movies.map((movie, index) => (
                <MovieCard key={movie._id} movie={movie} index={index} />
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
          </>
        )}
      </div>
    </Layout>
  );
};

export default MovieList;
