import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { SEOHead } from "@/components/SEOHead";
import { HeroSlider } from "@/components/HeroSlider";
import { MovieCarousel } from "@/components/MovieCarousel";
import { WidgetCarousel } from "@/components/WidgetCarousel";
import { WidgetSlider } from "@/components/WidgetSlider";
import { fetchNewMovies, fetchMoviesByType } from "@/lib/api";
import { useHomepageWidgets } from "@/hooks/useHomepageWidgets";

const Index = () => {
  // Fetch widgets from database
  const { data: widgets, isLoading: loadingWidgets } = useHomepageWidgets();

  // Fallback: Fetch from API if no widgets configured
  const { data: newMovies, isLoading: loadingNew } = useQuery({
    queryKey: ["newMovies"],
    queryFn: () => fetchNewMovies(1),
    enabled: !widgets || widgets.length === 0,
  });

  const { data: seriesData, isLoading: loadingSeries } = useQuery({
    queryKey: ["series"],
    queryFn: () => fetchMoviesByType("phim-bo", 1, { limit: 12 }),
    enabled: !widgets || widgets.length === 0,
  });

  const { data: singleMovies, isLoading: loadingSingle } = useQuery({
    queryKey: ["singleMovies"],
    queryFn: () => fetchMoviesByType("phim-le", 1, { limit: 12 }),
    enabled: !widgets || widgets.length === 0,
  });

  const { data: animationData, isLoading: loadingAnimation } = useQuery({
    queryKey: ["animation"],
    queryFn: () => fetchMoviesByType("hoat-hinh", 1, { limit: 12 }),
    enabled: !widgets || widgets.length === 0,
  });

  const newMoviesList = newMovies?.items || [];
  const seriesList = seriesData?.data?.items || [];
  const singleList = singleMovies?.data?.items || [];
  const animationList = animationData?.data?.items || [];

  // Get slider widgets and carousel widgets
  const sliderWidgets = widgets?.filter(w => w.widget_type === "slider") || [];
  const carouselWidgets = widgets?.filter(w => w.widget_type === "carousel") || [];

  const hasWidgets = widgets && widgets.length > 0;

  return (
    <Layout hideHeader>
      <SEOHead />
      
      {/* Hero section */}
      <div className="-mt-14 sm:-mt-16">
        {sliderWidgets.length > 0 ? (
          <WidgetSlider widget={sliderWidgets[0]} />
        ) : (
          <HeroSlider movies={newMoviesList} />
        )}
      </div>

      {/* Fixed header overlay for hero */}
      <div className="fixed left-0 right-0 top-0 z-50 safe-top">
        <div className="container flex h-14 items-center justify-between px-4 sm:h-16">
        </div>
      </div>

      {/* Movie carousels */}
      <div className="container px-4 sm:px-6">
        {hasWidgets ? (
          // Render widgets from database
          carouselWidgets.map((widget) => (
            <WidgetCarousel key={widget.id} widget={widget} />
          ))
        ) : (
          // Fallback to API data
          <>
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
          </>
        )}
      </div>
    </Layout>
  );
};

export default Index;
