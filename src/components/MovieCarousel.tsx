import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Movie } from "@/lib/api";
import { MovieCard } from "./MovieCard";
import { Button } from "./ui/button";

interface MovieCarouselProps {
  title: string;
  movies: Movie[];
  loading?: boolean;
}

export function MovieCarousel({ title, movies, loading }: MovieCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <section className="py-4">
        <h2 className="mb-4 text-xl font-bold text-foreground">{title}</h2>
        <div className="flex gap-3 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[140px] sm:w-[160px]">
              <div className="aspect-[2/3] rounded-lg bg-muted animate-pulse" />
              <div className="mt-2 h-4 w-3/4 rounded bg-muted animate-pulse" />
              <div className="mt-1 h-3 w-1/2 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!movies.length) return null;

  return (
    <section className="py-4 group/section">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        
        {/* Navigation buttons - visible on hover (desktop) */}
        <div className="hidden gap-2 sm:flex opacity-0 transition-opacity group-hover/section:opacity-100">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full border-border bg-card hover:bg-accent"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full border-border bg-card hover:bg-accent"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Movie grid - scrollable */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {movies.map((movie, index) => (
          <div key={movie._id} className="flex-shrink-0 w-[140px] sm:w-[160px]">
            <MovieCard movie={movie} index={index} />
          </div>
        ))}
      </div>
    </section>
  );
}
