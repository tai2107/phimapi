import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Clock,
  FileText,
  Globe,
  Film,
  Tv,
  Tag,
  MapPin
} from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

interface SitemapStatus {
  name: string;
  url: string;
  icon: React.ElementType;
  description: string;
  status: "loading" | "success" | "error";
  lastChecked?: Date;
  urlCount?: number;
  error?: string;
}

const sitemaps: Omit<SitemapStatus, "status">[] = [
  {
    name: "Sitemap Index",
    url: "/sitemap.xml",
    icon: MapPin,
    description: "Sitemap tổng hợp chứa liên kết đến tất cả sitemap con",
  },
  {
    name: "Pages Sitemap",
    url: "/sitemap-pages.xml",
    icon: FileText,
    description: "Các trang tĩnh: Homepage, hub pages",
  },
  {
    name: "Movies Sitemap",
    url: "/sitemap-movies.xml",
    icon: Film,
    description: "Tất cả trang phim (/phim/[slug])",
  },
  {
    name: "Episodes Sitemap",
    url: "/sitemap-episodes.xml",
    icon: Tv,
    description: "Tất cả trang tập phim (/phim/[slug]/tap-[episode])",
  },
  {
    name: "Taxonomy Sitemap",
    url: "/sitemap-taxonomy.xml",
    icon: Tag,
    description: "Thể loại, quốc gia, năm, diễn viên, đạo diễn",
  },
  {
    name: "Posts Sitemap",
    url: "/sitemap-posts.xml",
    icon: Globe,
    description: "Bài viết và danh mục bài viết",
  },
];

export default function SitemapManagement() {
  const [sitemapStatuses, setSitemapStatuses] = useState<Record<string, SitemapStatus>>({});
  const [isTestingAll, setIsTestingAll] = useState(false);

  // Fetch site URL from settings
  const { data: siteSettings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value");
      if (error) throw error;
      const settings: Record<string, string> = {};
      data?.forEach((item) => {
        settings[item.setting_key] = item.setting_value || "";
      });
      return settings;
    },
  });

  const siteUrl = siteSettings?.site_url || window.location.origin;
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;

  const getFullSitemapUrl = (path: string) => {
    if (path === "/sitemap.xml") {
      return `https://${projectId}.supabase.co/functions/v1/sitemap-index`;
    }
    const functionName = path.replace("/", "").replace(".xml", "");
    return `https://${projectId}.supabase.co/functions/v1/${functionName}`;
  };

  const testSitemap = async (sitemap: Omit<SitemapStatus, "status">) => {
    setSitemapStatuses((prev) => ({
      ...prev,
      [sitemap.name]: { ...sitemap, status: "loading" },
    }));

    try {
      const url = getFullSitemapUrl(sitemap.url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      
      // Count URLs in sitemap
      const urlMatches = text.match(/<loc>/g);
      const urlCount = urlMatches ? urlMatches.length : 0;

      setSitemapStatuses((prev) => ({
        ...prev,
        [sitemap.name]: {
          ...sitemap,
          status: "success",
          lastChecked: new Date(),
          urlCount,
        },
      }));
    } catch (error: any) {
      setSitemapStatuses((prev) => ({
        ...prev,
        [sitemap.name]: {
          ...sitemap,
          status: "error",
          lastChecked: new Date(),
          error: error.message,
        },
      }));
    }
  };

  const testAllSitemaps = async () => {
    setIsTestingAll(true);
    for (const sitemap of sitemaps) {
      await testSitemap(sitemap);
    }
    setIsTestingAll(false);
    toast.success("Đã kiểm tra tất cả sitemap");
  };

  const openSitemap = (sitemap: Omit<SitemapStatus, "status">) => {
    const url = getFullSitemapUrl(sitemap.url);
    window.open(url, "_blank");
  };

  const getStatusBadge = (status?: SitemapStatus) => {
    if (!status) {
      return <Badge variant="outline">Chưa kiểm tra</Badge>;
    }
    switch (status.status) {
      case "loading":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Đang kiểm tra
          </Badge>
        );
      case "success":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Hoạt động ({status.urlCount} URLs)
          </Badge>
        );
      case "error":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500">
            <XCircle className="h-3 w-3 mr-1" />
            Lỗi
          </Badge>
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Quản lý Sitemap</h1>
            </div>
          </header>
          
          <main className="flex-1 p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Sitemap & SEO</h1>
                <p className="text-muted-foreground">
                  Kiểm tra và quản lý các sitemap cho SEO
                </p>
              </div>
              <Button onClick={testAllSitemaps} disabled={isTestingAll}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isTestingAll ? "animate-spin" : ""}`} />
                {isTestingAll ? "Đang kiểm tra..." : "Kiểm tra tất cả"}
              </Button>
            </div>

            {/* Site URL Warning */}
            {!siteSettings?.site_url && (
              <Card className="border-yellow-500/50 bg-yellow-500/10">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-500">Chưa cấu hình Site URL</p>
                      <p className="text-sm text-muted-foreground">
                        Vui lòng thêm <code className="bg-muted px-1 rounded">site_url</code> trong 
                        Cài đặt Site để sitemap sử dụng đúng domain. 
                        Hiện tại đang sử dụng: <code className="bg-muted px-1 rounded">{siteUrl}</code>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sitemaps Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sitemaps.map((sitemap) => {
                const status = sitemapStatuses[sitemap.name];
                const Icon = sitemap.icon;
                
                return (
                  <Card key={sitemap.name} className="relative">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <CardTitle className="text-base">{sitemap.name}</CardTitle>
                        </div>
                        {getStatusBadge(status)}
                      </div>
                      <CardDescription className="text-sm">
                        {sitemap.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <code className="bg-muted px-2 py-1 rounded flex-1 truncate">
                          {sitemap.url}
                        </code>
                      </div>
                      
                      {status?.lastChecked && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Kiểm tra lúc: {status.lastChecked.toLocaleTimeString()}
                        </div>
                      )}

                      {status?.error && (
                        <div className="text-xs text-red-500 bg-red-500/10 p-2 rounded">
                          {status.error}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => testSitemap(sitemap)}
                          disabled={status?.status === "loading"}
                        >
                          <RefreshCw className={`h-3 w-3 mr-1 ${status?.status === "loading" ? "animate-spin" : ""}`} />
                          Test
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => openSitemap(sitemap)}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Xem
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Robots.txt */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">robots.txt</CardTitle>
                      <CardDescription>
                        File hướng dẫn crawler của search engines
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`https://${projectId}.supabase.co/functions/v1/robots-txt`, "_blank")}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Xem robots.txt
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* SEO Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Hướng dẫn SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">Submit Sitemap lên Google</h4>
                    <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                      <li>Truy cập Google Search Console</li>
                      <li>Chọn website của bạn</li>
                      <li>Vào mục Sitemaps</li>
                      <li>Nhập URL: <code className="bg-muted px-1 rounded">/sitemap.xml</code></li>
                      <li>Click Submit</li>
                    </ol>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Submit lên Bing</h4>
                    <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                      <li>Truy cập Bing Webmaster Tools</li>
                      <li>Chọn website của bạn</li>
                      <li>Vào mục Sitemaps</li>
                      <li>Nhập URL sitemap và submit</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
