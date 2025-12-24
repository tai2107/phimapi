import { HomepageWidget, useWidgetMovies } from "@/hooks/useHomepageWidgets";
import { HeroSlider } from "./HeroSlider";
import { Movie } from "@/lib/api";

interface WidgetSliderProps {
  widget: HomepageWidget;
}

export function WidgetSlider({ widget }: WidgetSliderProps) {
  const { data: movies, isLoading } = useWidgetMovies(widget);

  // Transform database movies to match API format expected by HeroSlider
  const transformedMovies: Movie[] = movies?.map((movie) => ({
    _id: movie.id,
    name: movie.name,
    slug: movie.slug,
    origin_name: movie.origin_name || "",
    poster_url: movie.poster_url || "",
    thumb_url: movie.thumb_url || "",
    year: movie.year || 0,
    quality: movie.quality || "",
    lang: movie.lang || "",
    episode_current: movie.episode_current || "",
    type: movie.type || "single",
    time: "",
    episode_total: "",
    category: [],
    country: [],
  })) || [];

  if (isLoading) {
    return (
      <div className="relative h-[60vh] min-h-[400px] w-full bg-gradient-to-b from-muted to-background animate-pulse" />
    );
  }

  return <HeroSlider movies={transformedMovies} />;
}
