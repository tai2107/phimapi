import { Link } from "react-router-dom";
import { HomepageWidget, useWidgetTvChannels } from "@/hooks/useHomepageWidgets";
import { Card } from "@/components/ui/card";
import { Tv } from "lucide-react";

interface WidgetTvChannelsProps {
  widget: HomepageWidget;
}

export function WidgetTvChannels({ widget }: WidgetTvChannelsProps) {
  const { data: channels, isLoading } = useWidgetTvChannels(widget);

  if (isLoading) {
    return (
      <div className="py-6">
        <h2 className="mb-4 text-lg font-bold sm:text-xl">{widget.title}</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!channels || channels.length === 0) {
    return null;
  }

  return (
    <div className="py-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold sm:text-xl">{widget.title}</h2>
        <Link 
          to={widget.static_path || "/tv"} 
          className="text-sm text-primary hover:underline"
        >
          Xem tất cả →
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {channels.map((channel) => (
          <Link key={channel.id} to={`/tv/${channel.slug}`}>
            <Card className="group relative overflow-hidden transition-transform hover:scale-105">
              <div className="aspect-square p-3">
                {channel.logo_url ? (
                  <img
                    src={channel.logo_url}
                    alt={channel.name}
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-md bg-muted">
                    <Tv className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-2">
                <p className="truncate text-center text-xs font-medium">
                  {channel.name}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
