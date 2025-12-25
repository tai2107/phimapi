import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SeoSettings {
  site_name: string | null;
  favicon_url: string | null;
  homepage_title: string | null;
  homepage_description: string | null;
  movie_title: string | null;
  movie_description: string | null;
  genre_title: string | null;
  genre_description: string | null;
  country_title: string | null;
  country_description: string | null;
  actor_title: string | null;
  actor_description: string | null;
  tag_title: string | null;
  tag_description: string | null;
}

export function useSeoSettings() {
  return useQuery({
    queryKey: ["seo-settings"],
    queryFn: async (): Promise<SeoSettings> => {
      const { data, error } = await supabase
        .from("seo_settings")
        .select("setting_key, setting_value");

      if (error) throw error;

      const settings: SeoSettings = {
        site_name: null,
        favicon_url: null,
        homepage_title: null,
        homepage_description: null,
        movie_title: null,
        movie_description: null,
        genre_title: null,
        genre_description: null,
        country_title: null,
        country_description: null,
        actor_title: null,
        actor_description: null,
        tag_title: null,
        tag_description: null,
      };

      data?.forEach((item) => {
        if (item.setting_key in settings) {
          (settings as any)[item.setting_key] = item.setting_value;
        }
      });

      return settings;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
