import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AdvertisementProps {
  position: "header" | "footer" | "sidebar" | "player";
  page?: string;
}

interface Ad {
  id: string;
  name: string;
  ad_type: string;
  position: string;
  content: string;
  is_active: boolean;
  pages: string[];
  display_order: number;
  start_date: string | null;
  end_date: string | null;
}

export const Advertisement = ({ position, page = "all" }: AdvertisementProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: ads } = useQuery({
    queryKey: ["advertisements", position, page],
    queryFn: async () => {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from("advertisements")
        .select("*")
        .eq("position", position)
        .eq("is_active", true)
        .eq("ad_type", "banner")
        .or(`start_date.is.null,start_date.lte.${now}`)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      
      // Filter by page
      return (data as Ad[]).filter(ad => 
        ad.pages?.includes("all") || ad.pages?.includes(page)
      );
    },
  });

  useEffect(() => {
    if (containerRef.current && ads && ads.length > 0) {
      // Clear previous content
      containerRef.current.innerHTML = "";
      
      ads.forEach(ad => {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = ad.content;
        
        // Execute scripts
        const scripts = wrapper.querySelectorAll("script");
        scripts.forEach(script => {
          const newScript = document.createElement("script");
          if (script.src) {
            newScript.src = script.src;
          } else {
            newScript.textContent = script.textContent;
          }
          document.body.appendChild(newScript);
        });
        
        containerRef.current?.appendChild(wrapper);
      });
    }
  }, [ads]);

  if (!ads || ads.length === 0) return null;

  return (
    <div 
      ref={containerRef}
      className="advertisement-container"
      data-position={position}
    />
  );
};

// Pop-under and Popup handler
export const usePopupAds = (page: string = "all") => {
  useEffect(() => {
    const fetchPopupAds = async () => {
      const now = new Date().toISOString();
      
      const { data } = await supabase
        .from("advertisements")
        .select("*")
        .in("ad_type", ["popup", "popunder"])
        .eq("is_active", true)
        .or(`start_date.is.null,start_date.lte.${now}`)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order("display_order", { ascending: true });
      
      if (!data) return;
      
      const ads = (data as Ad[]).filter(ad => 
        ad.pages?.includes("all") || ad.pages?.includes(page)
      );

      // Handle popup ads on first click
      const handleClick = () => {
        ads.forEach(ad => {
          if (ad.ad_type === "popup") {
            window.open(ad.content, "_blank", "width=800,height=600");
          } else if (ad.ad_type === "popunder") {
            const popup = window.open(ad.content, "_blank");
            if (popup) {
              popup.blur();
              window.focus();
            }
          }
        });
        document.removeEventListener("click", handleClick);
      };

      if (ads.length > 0) {
        // Store last shown time in localStorage to avoid spamming
        const lastShown = localStorage.getItem("popup_ads_last_shown");
        const now = Date.now();
        const cooldown = 30 * 60 * 1000; // 30 minutes
        
        if (!lastShown || now - parseInt(lastShown) > cooldown) {
          document.addEventListener("click", handleClick, { once: true });
          localStorage.setItem("popup_ads_last_shown", now.toString());
        }
      }
    };

    fetchPopupAds();
  }, [page]);
};
