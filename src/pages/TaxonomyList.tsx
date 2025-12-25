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
import { Movie } from "@/lib/api";

interface TaxonomyData {
  id: string;
  name: string;
  slug?: string;
  seo_title?: string | null;
  seo_description?: string | null;
}

type TaxonomyType = "danh-muc" | "the-loai" | "quoc-gia" | "nam";

const ITEMS_PER_PAGE = 24;

const TaxonomyList = () => {
  const { type, slug } = useParams<{ type: string; slug: string }>();
  const [page, setPage] = useState(1);

  const { data: taxonomy, isLoading: taxonomyLoading } = useQuery({
    queryKey: ["taxonomy", type, slug],
    queryFn: async (): Promise<TaxonomyData | null> => {
      switch (type) {
        case "danh-muc": {
          const { data, error } = await supabase
            .from("movie_categories")
            .select("*")
            .eq("slug", slug!)
            .is("deleted_at", null)
            .single();
          if (error || !data) return null;
          return { id: data.id, name: data.name, slug: data.slug, seo_title: data.seo_title, seo_description: data.seo_description };
        }
        case "the-loai": {
          const { data, error } = await supabase
            .from("genres")
            .select("*")
            .eq("slug", slug!)
            .is("deleted_at", null)
            .single();
          if (error || !data) return null;
          return { id: data.id, name: data.name, slug: data.slug, seo_title: data.seo_title, seo_description: data.seo_description };
        }
        case "quoc-gia": {
          const { data, error } = await supabase
            .from("countries")
            .select("*")
            .eq("slug", slug!)
            .is("deleted_at", null)
            .single();
          if (error || !data) return null;
          return { id: data.id, name: data.name, slug: data.slug, seo_title: data.seo_title, seo_description: data.seo_description };
        }
        case "nam": {
          const { data, error } = await supabase
            .from("years")
            .select("*")
            .eq("year", parseInt(slug || "0"))
            .is("deleted_at", null)
            .single();
          if (error || !data) return null;
          return { id: data.id, name: data.year.toString(), seo_title: null, seo_description: null };
        }
        default:
          return null;
      }
    },
    enabled: !!type && !!slug,
  });

  const { data: moviesData, isLoading: moviesLoading } = useQuery({
    queryKey: ["taxonomy-movies", type, slug, page, taxonomy?.id],
    queryFn: async (): Promise<{ movies: Movie[], total: number }> => {
      if (!taxonomy) return { movies: [], total: 0 };

      let movieIds: string[] = [];

      switch (type) {
        case "danh-muc": {
          const { data } = await supabase
            .from("movie_category_map")
            .select("movie_id")
            .eq("category_id", taxonomy.id);
          movieIds = data?.map(m => m.movie_id) || [];
          if (movieIds.length === 0) return { movies: [], total: 0 };
          break;
        }
        case "the-loai": {
          const { data } = await supabase
            .from("movie_genres")
            .select("movie_id")
            .eq("genre_id", taxonomy.id);
          movieIds = data?.map(m => m.movie_id) || [];
          if (movieIds.length === 0) return { movies: [], total: 0 };
          break;
        }
        case "quoc-gia": {
          const { data } = await supabase
            .from("movie_countries")
            .select("movie_id")
            .eq("country_id", taxonomy.id);
          movieIds = data?.map(m => m.movie_id) || [];
          if (movieIds.length === 0) return { movies: [], total: 0 };
          break;
        }
        case "nam":
          // No need to get IDs, filter directly
          break;
      }

      let query = supabase.from("movies").select("*", { count: "exact" });
      
      if (type === "nam") {
        query = query.eq("year", parseInt(slug || "0"));
      } else {
        query = query.in("id", movieIds);
      }

      const { data, error, count } = await query
        .is("deleted_at", null)
        .order("updated_at", { ascending: false })
        .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

      if (error) return { movies: [], total: 0 };
      
      // Transform to Movie type
      const movies: Movie[] = (data || []).map(m => ({
        _id: m.id,
        name: m.name,
        slug: m.slug,
        origin_name: m.origin_name || "",
        poster_url: m.poster_url || "",
        thumb_url: m.thumb_url || "",
        year: m.year || 0,
        type: m.type,
        quality: m.quality || "",
        lang: m.lang || "",
        time: m.time || "",
        episode_current: m.episode_current || "",
        episode_total: m.episode_total || "",
        view: m.view_count || 0,
        content: m.content || "",
        category: [],
        country: [],
      }));

      return { movies, total: count || 0 };
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
              {moviesData?.movies.map((movie, index) => (
                <MovieCard
                  key={movie._id}
                  movie={movie}
                  index={index}
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
