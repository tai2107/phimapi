import { useEffect } from "react";
import { useSeoSettings } from "@/hooks/useSeoSettings";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article" | "video.movie";
  url?: string;
}

export function SEOHead({ 
  title, 
  description, 
  image,
  type = "website",
  url 
}: SEOHeadProps) {
  const { data: seoSettings } = useSeoSettings();
  const { data: siteSettings } = useSiteSettings();

  const siteName = seoSettings?.site_name || siteSettings?.site_name || "KKPhim";
  const faviconUrl = siteSettings?.favicon_url || seoSettings?.favicon_url;
  
  const pageTitle = title ? `${title} - ${siteName}` : siteName;
  const pageDescription = description || seoSettings?.homepage_description || "Xem phim online miễn phí chất lượng cao";

  useEffect(() => {
    // Update document title
    document.title = pageTitle;

    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute("content", pageDescription);

    // Update OG tags
    updateMetaTag("og:title", pageTitle);
    updateMetaTag("og:description", pageDescription);
    updateMetaTag("og:type", type);
    updateMetaTag("og:site_name", siteName);
    
    if (image) {
      updateMetaTag("og:image", image);
      updateMetaTag("twitter:image", image);
    }
    
    if (url) {
      updateMetaTag("og:url", url);
    }

    // Update Twitter tags
    updateMetaTag("twitter:title", pageTitle);
    updateMetaTag("twitter:description", pageDescription);

    // Update favicon
    if (faviconUrl) {
      let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement("link");
        favicon.setAttribute("rel", "icon");
        document.head.appendChild(favicon);
      }
      favicon.setAttribute("href", faviconUrl);
      favicon.setAttribute("type", faviconUrl.endsWith(".svg") ? "image/svg+xml" : "image/png");
    }

    // Inject custom head HTML
    if (siteSettings?.head_html) {
      let customHead = document.getElementById("custom-head-html");
      if (!customHead) {
        customHead = document.createElement("div");
        customHead.id = "custom-head-html";
        document.head.appendChild(customHead);
      }
      customHead.innerHTML = siteSettings.head_html;
    }
  }, [pageTitle, pageDescription, faviconUrl, image, type, url, siteName, siteSettings?.head_html]);

  return null;
}

function updateMetaTag(property: string, content: string) {
  const isOg = property.startsWith("og:") || property.startsWith("twitter:");
  const selector = isOg 
    ? `meta[property="${property}"]` 
    : `meta[name="${property}"]`;
  
  let meta = document.querySelector(selector) as HTMLMetaElement;
  
  if (!meta) {
    meta = document.createElement("meta");
    if (isOg) {
      meta.setAttribute("property", property);
    } else {
      meta.setAttribute("name", property);
    }
    document.head.appendChild(meta);
  }
  
  meta.setAttribute("content", content);
}
