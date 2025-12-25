import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSettings {
  site_url: string | null;
  site_name: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  google_analytics_id: string | null;
  google_tag_manager_id: string | null;
  facebook_app_id: string | null;
  head_html: string | null;
  footer_html: string | null;
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: async (): Promise<SiteSettings> => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value");

      if (error) throw error;

      const settings: SiteSettings = {
        site_url: null,
        site_name: null,
        logo_url: null,
        favicon_url: null,
        google_analytics_id: null,
        google_tag_manager_id: null,
        facebook_app_id: null,
        head_html: null,
        footer_html: null,
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
