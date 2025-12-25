import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { MovieCard } from "@/components/MovieCard";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface TaxonomyData {
  id: string;
  name: string;
  slug?: string;
  seo_title?: string | null;
  seo_description?: string | null;
}

type TaxonomyType = "danh-muc" | "the-loai" | "quoc-gia" | "nam";

const ITEMS_PER_PAGE = 24;

interface MovieData {
  id: string;
  slug: string;
  name: string;
  thumb_url: string | null;
  poster_url: string | null;
  year: number | null;
  quality: string | null;
  episode_current: string | null;
}

const TaxonomyList = () => {
  const { type, slug } = useParams<{ type: TaxonomyType; slug: string }>();
  const [page, setPage] = useState(1);

  const { data: taxonomy, isLoading: taxonomyLoading } = useQuery<TaxonomyData | null>({
    queryKey: ["taxonomy", type, slug],
    queryFn: async () => {
      let table = "";
      let nameColumn = "name";
      
      switch (type) {
        case "danh-muc":
          table = "movie_categories";
          break;
        case "the-loai":
          table = "genres";
          break;
        case "quoc-gia":
          table = "countries";
          break;
        case "nam":
          table = "years";
          nameColumn = "year";
          break;
        default:
          return null;
      }

      if (type === "nam") {
        const { data, error } = await supabase
          .from("years")
          .select("*")
          .eq("year", parseInt(slug || "0"))
          .is("deleted_at", null)
          .single();
        if (error) return null;
        return { ...data, name: data.year.toString() };
      }

      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("slug", slug)
        .is("deleted_at", null)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!type && !!slug,
  });

  const { data: moviesData, isLoading: moviesLoading } = useQuery<{ movies: MovieData[], total: number }>({
    queryKey: ["taxonomy-movies", type, slug, page],
    queryFn: async () => {
      if (!taxonomy) return { movies: [] as MovieData[], total: 0 };

      let query = supabase.from("movies").select("*", { count: "exact" });

      switch (type) {
        case "danh-muc":
          const { data: categoryMovieIds } = await supabase
            .from("movie_category_map")
            .select("movie_id")
            .eq("category_id", taxonomy.id);
          const catIds = categoryMovieIds?.map(m => m.movie_id) || [];
          if (catIds.length === 0) return { movies: [], total: 0 };
          query = query.in("id", catIds);
          break;
        case "the-loai":
          const { data: genreMovieIds } = await supabase
            .from("movie_genres")
            .select("movie_id")
            .eq("genre_id", taxonomy.id);
          const genreIds = genreMovieIds?.map(m => m.movie_id) || [];
          if (genreIds.length === 0) return { movies: [], total: 0 };
          query = query.in("id", genreIds);
          break;
        case "quoc-gia":
          const { data: countryMovieIds } = await supabase
            .from("movie_countries")
            .select("movie_id")
            .eq("country_id", taxonomy.id);
          const countryIds = countryMovieIds?.map(m => m.movie_id) || [];
          if (countryIds.length === 0) return { movies: [], total: 0 };
          query = query.in("id", countryIds);
          break;
        case "nam":
          query = query.eq("year", parseInt(slug || "0"));
          break;
      }

      const { data, error, count } = await query
        .is("deleted_at", null)
        .order("updated_at", { ascending: false })
        .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

      if (error) return { movies: [], total: 0 };
      return { movies: data || [], total: count || 0 };
    },
    enabled: !!taxonomy,
  });

  const totalPages = Math.ceil((moviesData?.total || 0) / ITEMS_PER_PAGE);

  const getTitle = () => {
    switch (type) {
      case "danh-muc":
        return `Phim ${taxonomy?.name}`;
      case "the-loai":
        return `Phim thể loại ${taxonomy?.name}`;
      case "quoc-gia":
        return `Phim ${taxonomy?.name}`;
      case "nam":
        return `Phim năm ${taxonomy?.name}`;
      default:
        return "Danh sách phim";
    }
  };

  const getBreadcrumbLabel = () => {
    switch (type) {
      case "danh-muc":
        return "Danh mục";
      case "the-loai":
        return "Thể loại";
      case "quoc-gia":
        return "Quốc gia";
      case "nam":
        return "Năm";
      default:
        return "";
    }
  };

  if (taxonomyLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!taxonomy) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy</h1>
          <p className="text-muted-foreground">Danh mục bạn tìm không tồn tại.</p>
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">
            Về trang chủ
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        title={taxonomy.seo_title || getTitle()}
        description={taxonomy.seo_description || `Xem phim ${taxonomy.name} mới nhất, chất lượng cao, vietsub`}
      />

      <div className="container py-6 space-y-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Trang chủ</Link>
          <span className="mx-2">/</span>
          <span>{getBreadcrumbLabel()}</span>
          <span className="mx-2">/</span>
          <span className="text-foreground">{taxonomy.name}</span>
        </nav>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold">{getTitle()}</h1>
          <p className="text-muted-foreground">
            {moviesData?.total || 0} phim
          </p>
        </div>

        {/* Movies Grid */}
        {moviesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
            ))}
          </div>
        ) : moviesData?.movies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chưa có phim nào trong danh mục này.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {moviesData?.movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  slug={movie.slug}
                  name={movie.name}
                  thumbUrl={movie.thumb_url || movie.poster_url || ""}
                  posterUrl={movie.poster_url || ""}
                  year={movie.year || 0}
                  quality={movie.quality || ""}
                  episodeCurrent={movie.episode_current || ""}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
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

export default TaxonomyList;
