import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { HeroSlider } from "@/components/HeroSlider";
import { MovieCarousel } from "@/components/MovieCarousel";
import { fetchNewMovies, fetchMoviesByType } from "@/lib/api";

const Index = () => {
  // Fetch new movies
  const { data: newMovies, isLoading: loadingNew } = useQuery({
    queryKey: ["newMovies"],
    queryFn: () => fetchNewMovies(1),
  });

  // Fetch series
  const { data: seriesData, isLoading: loadingSeries } = useQuery({
    queryKey: ["series"],
    queryFn: () => fetchMoviesByType("phim-bo", 1, { limit: 12 }),
  });

  // Fetch single movies
  const { data: singleMovies, isLoading: loadingSingle } = useQuery({
    queryKey: ["singleMovies"],
    queryFn: () => fetchMoviesByType("phim-le", 1, { limit: 12 }),
  });

  // Fetch animation
  const { data: animationData, isLoading: loadingAnimation } = useQuery({
    queryKey: ["animation"],
    queryFn: () => fetchMoviesByType("hoat-hinh", 1, { limit: 12 }),
  });

  const newMoviesList = newMovies?.items || [];
  const seriesList = seriesData?.data?.items || [];
  const singleList = singleMovies?.data?.items || [];
  const animationList = animationData?.data?.items || [];

  return (
    <Layout hideHeader>
      {/* Hero section with featured movies */}
      <div className="-mt-14 sm:-mt-16">
        <HeroSlider movies={newMoviesList} />
      </div>

      {/* Fixed header overlay for hero */}
      <div className="fixed left-0 right-0 top-0 z-50 safe-top">
        <div className="container flex h-14 items-center justify-between px-4 sm:h-16">
          {/* We'll use the Header component separately with transparent bg */}
        </div>
      </div>

      {/* Movie carousels */}
      <div className="container px-4 sm:px-6">
        <MovieCarousel
          title="🔥 Phim Mới Cập Nhật"
          movies={newMoviesList}
          loading={loadingNew}
        />
        
        <MovieCarousel
          title="📺 Phim Bộ Hay"
          movies={seriesList}
          loading={loadingSeries}
        />
        
        <MovieCarousel
          title="🎬 Phim Lẻ Đặc Sắc"
          movies={singleList}
          loading={loadingSingle}
        />
        
        <MovieCarousel
          title="✨ Hoạt Hình"
          movies={animationList}
          loading={loadingAnimation}
        />
      </div>

      {/* Footer */}
      <footer className="mt-8 border-t border-border bg-card py-6">
        <div className="container px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 KKPhim - Xem phim online miễn phí
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Dữ liệu phim được cung cấp bởi KKPhim API
          </p>
        </div>
      </footer>
    </Layout>
  );
};

export default Index;
