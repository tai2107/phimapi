import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSeoSettings } from "@/hooks/useSeoSettings";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article" | "video.movie";
  url?: string;
  noindex?: boolean;
  keywords?: string;
}

export function SEOHead({ 
  title, 
  description, 
  image,
  type = "website",
  url,
  noindex = false,
  keywords
}: SEOHeadProps) {
  const location = useLocation();
  const { data: seoSettings } = useSeoSettings();
  const { data: siteSettings } = useSiteSettings();

  const siteName = seoSettings?.site_name || siteSettings?.site_name || "KKPhim";
  const siteUrl = siteSettings?.site_url || window.location.origin;
  const faviconUrl = siteSettings?.favicon_url || seoSettings?.favicon_url;
  
  const pageTitle = title ? `${title} - ${siteName}` : siteName;
  const pageDescription = description || seoSettings?.homepage_description || "Xem phim online miễn phí chất lượng cao";
  const canonicalUrl = url || `${siteUrl}${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = pageTitle;

    // Update meta description
    updateMetaTag("description", pageDescription, "name");

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);

    // Update robots meta
    if (noindex) {
      updateMetaTag("robots", "noindex, nofollow", "name");
    } else {
      updateMetaTag("robots", "index, follow", "name");
    }

    // Update keywords if provided
    if (keywords) {
      updateMetaTag("keywords", keywords, "name");
    }

    // Update OG tags
    updateMetaTag("og:title", pageTitle, "property");
    updateMetaTag("og:description", pageDescription, "property");
    updateMetaTag("og:type", type, "property");
    updateMetaTag("og:site_name", siteName, "property");
    updateMetaTag("og:url", canonicalUrl, "property");
    updateMetaTag("og:locale", "vi_VN", "property");
    
    if (image) {
      updateMetaTag("og:image", image, "property");
      updateMetaTag("og:image:alt", pageTitle, "property");
      updateMetaTag("twitter:image", image, "property");
    }

    // Update Twitter tags
    updateMetaTag("twitter:card", image ? "summary_large_image" : "summary", "name");
    updateMetaTag("twitter:title", pageTitle, "name");
    updateMetaTag("twitter:description", pageDescription, "name");

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
  }, [pageTitle, pageDescription, faviconUrl, image, type, canonicalUrl, siteName, siteSettings?.head_html, noindex, keywords]);

  return null;
}

function updateMetaTag(name: string, content: string, type: "name" | "property") {
  const selector = type === "property" 
    ? `meta[property="${name}"]` 
    : `meta[name="${name}"]`;
  
  let meta = document.querySelector(selector) as HTMLMetaElement;
  
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(type, name);
    document.head.appendChild(meta);
  }
  
  meta.setAttribute("content", content);
}
